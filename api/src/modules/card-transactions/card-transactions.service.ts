import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CardTransaction } from './entities/card-transaction.entity';
import { Invoice } from './entities/invoice.entity';
import { CreditCard } from '../credit-cards/entities/credit-card.entity';
import { CreateCardTransactionDto } from './dto/create-card-transaction.dto';
import { UpdateCardTransactionDto } from './dto/update-card-transaction.dto';
import { CardTransactionResponseDto, CardTransactionSummaryDto } from './dto/card-transaction-response.dto';
import { CardTransactionFilterDto, PaginatedCardTransactionsResponse } from './dto/card-transaction-filter.dto';
import { InvoiceResponseDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';
import { InvoiceStatus } from '../../common/enums';
import { parseLocalDate } from '../../common/utils/date.utils';

@Injectable()
export class CardTransactionsService {
  constructor(
    @InjectRepository(CardTransaction)
    private readonly transactionRepository: Repository<CardTransaction>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
  ) {}

  async create(userId: string, createDto: CreateCardTransactionDto): Promise<CardTransactionResponseDto> {
    // Validate credit card belongs to user
    const creditCard = await this.creditCardRepository.findOne({
      where: { id: createDto.creditCardId, userId },
    });

    if (!creditCard) {
      throw new NotFoundException('Credit card not found');
    }

    // Validate installments
    if (createDto.isInstallment && (!createDto.totalInstallments || createDto.totalInstallments < 2)) {
      throw new BadRequestException('Total installments must be at least 2 for installment purchases');
    }

    const transactionDate = parseLocalDate(createDto.transactionDate);
    const baseInvoicePeriod = this.calculateInvoicePeriod(transactionDate, creditCard.closingDay);

    if (createDto.isInstallment && createDto.totalInstallments) {
      // Create parent transaction (first installment)
      return this.createInstallmentTransaction(userId, createDto, creditCard, baseInvoicePeriod);
    } else {
      // Create single transaction
      return this.createSingleTransaction(userId, createDto, creditCard, baseInvoicePeriod);
    }
  }

  private async createSingleTransaction(
    userId: string,
    createDto: CreateCardTransactionDto,
    creditCard: CreditCard,
    invoicePeriod: string,
  ): Promise<CardTransactionResponseDto> {
    const transaction = this.transactionRepository.create({
      description: createDto.description,
      amount: createDto.amount,
      transactionDate: parseLocalDate(createDto.transactionDate),
      invoicePeriod,
      isInstallment: false,
      creditCardId: createDto.creditCardId,
      categoryId: createDto.categoryId,
      userId,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);
    await this.updateInvoiceTotal(creditCard.id, invoicePeriod, userId, creditCard);

    return this.mapToResponseDto(savedTransaction, creditCard);
  }

  private async createInstallmentTransaction(
    userId: string,
    createDto: CreateCardTransactionDto,
    creditCard: CreditCard,
    baseInvoicePeriod: string,
  ): Promise<CardTransactionResponseDto> {
    const installmentAmount = Number((createDto.amount / createDto.totalInstallments!).toFixed(2));
    const transactions: CardTransaction[] = [];

    // Create all installment transactions
    for (let i = 1; i <= createDto.totalInstallments!; i++) {
      const invoicePeriod = this.addMonthsToInvoicePeriod(baseInvoicePeriod, i - 1);
      
      const transaction = this.transactionRepository.create({
        description: createDto.description,
        amount: installmentAmount,
        transactionDate: parseLocalDate(createDto.transactionDate),
        invoicePeriod,
        isInstallment: true,
        installmentNumber: i,
        totalInstallments: createDto.totalInstallments,
        creditCardId: createDto.creditCardId,
        categoryId: createDto.categoryId,
        userId,
      });

      transactions.push(transaction);
    }

    // Save all transactions
    const savedTransactions = await this.transactionRepository.save(transactions);

    // Set parent-child relationships (first transaction is parent)
    const parentTransaction = savedTransactions[0];
    for (let i = 1; i < savedTransactions.length; i++) {
      savedTransactions[i].parentTransactionId = parentTransaction.id;
    }
    await this.transactionRepository.save(savedTransactions.slice(1));

    // Update invoice totals for all affected periods
    const uniquePeriods = [...new Set(transactions.map(t => t.invoicePeriod))];
    for (const period of uniquePeriods) {
      await this.updateInvoiceTotal(creditCard.id, period, userId, creditCard);
    }

    return this.mapToResponseDto(parentTransaction, creditCard);
  }

  /**
   * Find all card transactions with pagination and sorting support
   */
  async findAllPaginated(userId: string, filterDto: CardTransactionFilterDto): Promise<PaginatedCardTransactionsResponse> {
    const { 
      creditCardId, 
      invoicePeriod,
      dueYear,
      dueMonth,
      page = 1, 
      limit = 10, 
      sortField = 'transactionDate', 
      sortOrder = 'DESC' 
    } = filterDto;

    // If dueYear and dueMonth are provided, calculate the invoice periods by due date
    let invoicePeriodsToFilter: string[] = [];
    if (dueYear && dueMonth) {
      // Get all credit cards for the user to determine invoice periods
      const whereCondition: any = { userId, isActive: true };
      if (creditCardId) {
        whereCondition.id = creditCardId;
      }
      
      const creditCards = await this.creditCardRepository.find({
        where: whereCondition,
      });

      // Calculate which invoice period has due date in the target month for each card
      for (const card of creditCards) {
        const period = this.getInvoicePeriodWithDueDateInMonth(card.closingDay, card.dueDay, dueYear, dueMonth);
        if (!invoicePeriodsToFilter.includes(period)) {
          invoicePeriodsToFilter.push(period);
        }
      }
    }

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.creditCard', 'creditCard')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.parentTransaction', 'parent')
      .where('transaction.userId = :userId', { userId });

    // Apply filters - prioritize dueYear/dueMonth over invoicePeriod
    if (invoicePeriodsToFilter.length > 0) {
      queryBuilder.andWhere('transaction.invoicePeriod IN (:...periods)', { periods: invoicePeriodsToFilter });
    } else if (invoicePeriod) {
      queryBuilder.andWhere('transaction.invoicePeriod = :invoicePeriod', { invoicePeriod });
    } else {
      // When not filtering by period, only get parent transactions
      queryBuilder.andWhere('transaction.parentTransactionId IS NULL');
    }

    if (creditCardId) {
      queryBuilder.andWhere('transaction.creditCardId = :creditCardId', { creditCardId });
    }

    // Apply sorting
    const sortColumn = sortField === 'transactionDate' ? 'transaction.transactionDate' 
      : sortField === 'description' ? 'transaction.description'
      : sortField === 'amount' ? 'transaction.amount'
      : 'transaction.createdAt';
    queryBuilder.orderBy(sortColumn, sortOrder);

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const transactions = await queryBuilder.getMany();

    // Map to response DTOs
    const data = transactions.map(t => {
      const parentTransaction = t.parentTransaction;
      return {
        id: t.id,
        description: parentTransaction ? parentTransaction.description : t.description,
        amount: Number(t.amount),
        transactionDate: t.transactionDate,
        invoicePeriod: t.invoicePeriod,
        isInstallment: t.isInstallment,
        installmentNumber: t.installmentNumber,
        totalInstallments: t.totalInstallments || (parentTransaction?.totalInstallments),
        installmentLabel: t.isInstallment && t.installmentNumber && (t.totalInstallments || parentTransaction?.totalInstallments)
          ? `${t.installmentNumber}/${t.totalInstallments || parentTransaction?.totalInstallments}`
          : undefined,
        parentTransactionId: t.parentTransactionId,
        creditCardId: t.creditCardId,
        creditCardName: t.creditCard?.name,
        creditCardColor: t.creditCard?.color,
        categoryId: t.categoryId,
        categoryName: t.category?.name,
        categoryColor: t.category?.color,
        categoryIcon: t.category?.icon,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAll(userId: string, creditCardId?: string, invoicePeriod?: string): Promise<CardTransactionResponseDto[]> {
    // When filtering by invoicePeriod, we need to get all transactions that have installments in that period
    // This includes both parent transactions and child transactions that fall in the period
    
    if (invoicePeriod) {
      // Get all transactions (both parent and child) for the period
      const periodQueryBuilder = this.transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.creditCard', 'creditCard')
        .leftJoinAndSelect('transaction.category', 'category')
        .leftJoinAndSelect('transaction.parentTransaction', 'parent')
        .where('transaction.userId = :userId', { userId })
        .andWhere('transaction.invoicePeriod = :invoicePeriod', { invoicePeriod });

      if (creditCardId) {
        periodQueryBuilder.andWhere('transaction.creditCardId = :creditCardId', { creditCardId });
      }

      periodQueryBuilder.orderBy('transaction.transactionDate', 'DESC');

      const periodTransactions = await periodQueryBuilder.getMany();
      
      // Map transactions: for child transactions, we need to show them as the installment they are
      return periodTransactions.map(t => {
        // If it's a child transaction, get parent info for the original description
        const parentTransaction = t.parentTransaction;
        
        return {
          id: t.id,
          description: parentTransaction ? parentTransaction.description : t.description,
          amount: Number(t.amount),
          transactionDate: t.transactionDate,
          invoicePeriod: t.invoicePeriod,
          isInstallment: t.isInstallment,
          installmentNumber: t.installmentNumber,
          totalInstallments: t.totalInstallments || (parentTransaction?.totalInstallments),
          installmentLabel: t.isInstallment && t.installmentNumber && (t.totalInstallments || parentTransaction?.totalInstallments)
            ? `${t.installmentNumber}/${t.totalInstallments || parentTransaction?.totalInstallments}`
            : undefined,
          parentTransactionId: t.parentTransactionId,
          creditCardId: t.creditCardId,
          creditCardName: t.creditCard?.name,
          creditCardColor: t.creditCard?.color,
          categoryId: t.categoryId,
          categoryName: t.category?.name,
          categoryColor: t.category?.color,
          categoryIcon: t.category?.icon,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        };
      });
    }
    
    // When not filtering by period, return parent transactions with their children
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.creditCard', 'creditCard')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.childTransactions', 'children')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.parentTransactionId IS NULL'); // Only get parent transactions

    if (creditCardId) {
      queryBuilder.andWhere('transaction.creditCardId = :creditCardId', { creditCardId });
    }

    queryBuilder.orderBy('transaction.transactionDate', 'DESC');

    const transactions = await queryBuilder.getMany();
    return transactions.map(t => this.mapToResponseDto(t, t.creditCard, t.childTransactions));
  }

  async findByCard(userId: string, creditCardId: string): Promise<CardTransactionResponseDto[]> {
    return this.findAll(userId, creditCardId);
  }

  async findByInvoice(userId: string, creditCardId: string, invoicePeriod: string): Promise<CardTransactionResponseDto[]> {
    return this.findAll(userId, creditCardId, invoicePeriod);
  }

  async findOne(id: string, userId: string): Promise<CardTransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['creditCard', 'category', 'childTransactions'],
    });

    if (!transaction) {
      throw new NotFoundException('Card transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('You can only access your own transactions');
    }

    return this.mapToResponseDto(transaction, transaction.creditCard, transaction.childTransactions);
  }

  async update(id: string, userId: string, updateDto: UpdateCardTransactionDto): Promise<CardTransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['creditCard', 'category', 'childTransactions'],
    });

    if (!transaction) {
      throw new NotFoundException('Card transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('You can only update your own transactions');
    }

    // Cannot update child transactions directly
    if (transaction.parentTransactionId) {
      throw new BadRequestException('Cannot update installment child transactions directly. Update the parent transaction.');
    }

    const oldInvoicePeriod = transaction.invoicePeriod;
    
    // Build update object for the parent transaction
    const updateFields: Partial<CardTransaction> = {};
    
    if (updateDto.description !== undefined) {
      updateFields.description = updateDto.description;
    }
    if (updateDto.amount !== undefined) {
      updateFields.amount = updateDto.amount;
    }
    if ('categoryId' in updateDto) {
      updateFields.categoryId = updateDto.categoryId || null;
    }
    if (updateDto.transactionDate !== undefined) {
      updateFields.transactionDate = parseLocalDate(updateDto.transactionDate);
      updateFields.invoicePeriod = this.calculateInvoicePeriod(
        updateFields.transactionDate,
        transaction.creditCard.closingDay
      );
    }

    // Update parent transaction using repository.update for direct SQL update
    await this.transactionRepository.update({ id }, updateFields);

    // Update child transactions if this is a parent installment transaction
    if (transaction.isInstallment && transaction.childTransactions && transaction.childTransactions.length > 0) {
      // Fields to propagate to child transactions
      const childUpdateFields: Partial<CardTransaction> = {};
      
      if ('categoryId' in updateDto) {
        childUpdateFields.categoryId = updateDto.categoryId || null;
      }
      if (updateDto.description !== undefined) {
        childUpdateFields.description = updateDto.description;
      }

      if (Object.keys(childUpdateFields).length > 0) {
        await this.transactionRepository.update(
          { parentTransactionId: transaction.id },
          childUpdateFields
        );
      }
    }

    // Update invoice totals
    const creditCard = await this.creditCardRepository.findOne({
      where: { id: transaction.creditCardId },
    });
    
    const newInvoicePeriod = updateFields.invoicePeriod || transaction.invoicePeriod;
    if (oldInvoicePeriod !== newInvoicePeriod) {
      await this.updateInvoiceTotal(transaction.creditCardId, oldInvoicePeriod, userId, creditCard!);
    }
    await this.updateInvoiceTotal(transaction.creditCardId, newInvoicePeriod, userId, creditCard!);

    // Reload transaction with updated category relation
    const updatedTransaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['creditCard', 'category', 'childTransactions'],
    });

    return this.mapToResponseDto(updatedTransaction!, updatedTransaction!.creditCard, updatedTransaction!.childTransactions);
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['childTransactions', 'creditCard'],
    });

    if (!transaction) {
      throw new NotFoundException('Card transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('You can only delete your own transactions');
    }

    const affectedPeriods: string[] = [transaction.invoicePeriod];
    const creditCardId = transaction.creditCardId;

    // If it's a parent installment, delete all children
    if (transaction.childTransactions && transaction.childTransactions.length > 0) {
      for (const child of transaction.childTransactions) {
        if (!affectedPeriods.includes(child.invoicePeriod)) {
          affectedPeriods.push(child.invoicePeriod);
        }
      }
      await this.transactionRepository.remove(transaction.childTransactions);
    }

    await this.transactionRepository.remove(transaction);

    // Update invoice totals for all affected periods
    const creditCard = await this.creditCardRepository.findOne({
      where: { id: creditCardId },
    });
    
    for (const period of affectedPeriods) {
      await this.updateInvoiceTotal(creditCardId, period, userId, creditCard!);
    }
  }

  // Invoice management
  async getInvoices(userId: string, creditCardId?: string): Promise<InvoiceResponseDto[]> {
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.creditCard', 'creditCard')
      .where('invoice.userId = :userId', { userId });

    if (creditCardId) {
      queryBuilder.andWhere('invoice.creditCardId = :creditCardId', { creditCardId });
    }

    queryBuilder.orderBy('invoice.period', 'DESC');

    const invoices = await queryBuilder.getMany();
    return invoices.map(inv => this.mapInvoiceToResponseDto(inv));
  }

  async getInvoice(creditCardId: string, period: string, userId: string): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepository.findOne({
      where: { creditCardId, period, userId },
      relations: ['creditCard'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.mapInvoiceToResponseDto(invoice);
  }

  async updateInvoiceStatus(
    creditCardId: string,
    period: string,
    userId: string,
    updateDto: UpdateInvoiceStatusDto,
  ): Promise<InvoiceResponseDto> {
    let invoice = await this.invoiceRepository.findOne({
      where: { creditCardId, period, userId },
      relations: ['creditCard'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    invoice.status = updateDto.status;
    if (updateDto.status === InvoiceStatus.PAID) {
      invoice.paidAt = new Date();
    } else {
      invoice.paidAt = null as any;
    }

    invoice = await this.invoiceRepository.save(invoice);
    return this.mapInvoiceToResponseDto(invoice);
  }

  // Summary methods for dashboard
  async getCardUsage(userId: string, creditCardId: string): Promise<number> {
    const currentPeriod = this.getCurrentInvoicePeriod();
    
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.creditCardId = :creditCardId', { creditCardId })
      .andWhere('transaction.invoicePeriod = :period', { period: currentPeriod })
      .getRawOne();

    return Number(result?.total || 0);
  }

  async getPendingInstallments(userId: string, period?: string): Promise<CardTransactionResponseDto[]> {
    const targetPeriod = period || this.getCurrentInvoicePeriod();
    
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.creditCard', 'creditCard')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.isInstallment = :isInstallment', { isInstallment: true })
      .andWhere('transaction.invoicePeriod >= :period', { period: targetPeriod })
      .andWhere('transaction.parentTransactionId IS NULL')
      .orderBy('transaction.invoicePeriod', 'ASC')
      .addOrderBy('transaction.transactionDate', 'DESC')
      .getMany();

    return transactions.map(t => this.mapToResponseDto(t, t.creditCard));
  }

  async getMonthlyCardExpenses(userId: string, period: string): Promise<number> {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.invoicePeriod = :period', { period })
      .getRawOne();

    return Number(result?.total || 0);
  }

  /**
   * Get invoices by the invoice due month.
   * This returns invoices that have their due date in the target month/year.
   */
  async getInvoicesByDueMonth(
    userId: string,
    year: number,
    month: number,
    creditCardId?: string,
  ): Promise<InvoiceResponseDto[]> {
    // Get all credit cards for the user to determine invoice periods
    const whereCondition: any = { userId, isActive: true };
    if (creditCardId) {
      whereCondition.id = creditCardId;
    }

    const creditCards = await this.creditCardRepository.find({
      where: whereCondition,
    });

    if (creditCards.length === 0) {
      return [];
    }

    const allInvoices: InvoiceResponseDto[] = [];

    for (const card of creditCards) {
      // Calculate which invoice period has due date in the target month
      const invoicePeriod = this.getInvoicePeriodWithDueDateInMonth(card.closingDay, card.dueDay, year, month);

      // Get invoice for this card and period
      const invoice = await this.invoiceRepository.findOne({
        where: { creditCardId: card.id, period: invoicePeriod, userId },
        relations: ['creditCard'],
      });

      if (invoice) {
        allInvoices.push(this.mapInvoiceToResponseDto(invoice));
      }
    }

    return allInvoices;
  }

  /**
   * Get card transactions by the invoice due month.
   * This calculates which invoice periods have their due date in the target month/year.
   */
  async findByDueMonth(
    userId: string,
    year: number,
    month: number,
    creditCardId?: string,
  ): Promise<CardTransactionResponseDto[]> {
    // Get all credit cards for the user to determine invoice periods
    const whereCondition: any = { userId, isActive: true };
    if (creditCardId) {
      whereCondition.id = creditCardId;
    }
    
    const creditCards = await this.creditCardRepository.find({
      where: whereCondition,
    });

    if (creditCards.length === 0) {
      return [];
    }

    const allTransactions: CardTransactionResponseDto[] = [];

    for (const card of creditCards) {
      // Calculate which invoice period has due date in the target month
      const invoicePeriod = this.getInvoicePeriodWithDueDateInMonth(card.closingDay, card.dueDay, year, month);
      
      // Get transactions for this card and period
      const transactions = await this.findAll(userId, card.id, invoicePeriod);
      allTransactions.push(...transactions);
    }

    // Sort by transaction date descending
    return allTransactions.sort((a, b) => 
      new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    );
  }

  /**
   * Determines which invoice period has its due date in the target month/year.
   */
  private getInvoicePeriodWithDueDateInMonth(closingDay: number, dueDay: number, targetYear: number, targetMonth: number): string {
    // If dueDay <= closingDay, the invoice of period X is due in month X+1
    // Otherwise, it's due in the same month X
    const dueDateIsNextMonth = dueDay <= closingDay;

    if (dueDateIsNextMonth) {
      // The invoice that is due in the target month is from the previous month
      let invoiceMonth = targetMonth - 1;
      let invoiceYear = targetYear;
      if (invoiceMonth < 1) {
        invoiceMonth = 12;
        invoiceYear -= 1;
      }
      return `${invoiceYear}-${String(invoiceMonth).padStart(2, '0')}`;
    } else {
      // The invoice that is due in the target month is from the same month
      return `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
    }
  }

  // Helper methods
  private calculateInvoicePeriod(transactionDate: Date, closingDay: number): string {
    const txDate = new Date(transactionDate);
    const day = txDate.getDate();
    let month = txDate.getMonth();
    let year = txDate.getFullYear();

    // If transaction is on or after closing day, it goes to next month's invoice
    if (day >= closingDay) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }

    const monthStr = String(month + 1).padStart(2, '0');
    return `${year}-${monthStr}`;
  }

  private addMonthsToInvoicePeriod(invoicePeriod: string, months: number): string {
    const [yearStr, monthStr] = invoicePeriod.split('-');
    let year = parseInt(yearStr);
    let month = parseInt(monthStr) - 1 + months;

    while (month > 11) {
      month -= 12;
      year += 1;
    }

    return `${year}-${String(month + 1).padStart(2, '0')}`;
  }

  private getCurrentInvoicePeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private async updateInvoiceTotal(
    creditCardId: string,
    period: string,
    userId: string,
    creditCard: CreditCard,
  ): Promise<void> {
    // Calculate total for this invoice period
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.creditCardId = :creditCardId', { creditCardId })
      .andWhere('transaction.invoicePeriod = :period', { period })
      .getRawOne();

    const totalAmount = Number(result?.total || 0);

    // Find or create invoice
    let invoice = await this.invoiceRepository.findOne({
      where: { creditCardId, period },
    });

    if (!invoice) {
      // Calculate closing and due dates
      const [yearStr, monthStr] = period.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr) - 1;
      
      const closingDate = new Date(year, month, creditCard.closingDay);
      const dueDate = new Date(year, month, creditCard.dueDay);
      
      // If due day is before closing day, due date is next month
      if (creditCard.dueDay <= creditCard.closingDay) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      invoice = this.invoiceRepository.create({
        period,
        creditCardId,
        userId,
        totalAmount,
        closingDate,
        dueDate,
        status: InvoiceStatus.OPEN,
      });
    } else {
      invoice.totalAmount = totalAmount;
    }

    await this.invoiceRepository.save(invoice);
  }

  private mapToResponseDto(
    transaction: CardTransaction,
    creditCard?: CreditCard,
    childTransactions?: CardTransaction[],
  ): CardTransactionResponseDto {
    const dto: CardTransactionResponseDto = {
      id: transaction.id,
      description: transaction.description,
      amount: Number(transaction.amount),
      transactionDate: transaction.transactionDate,
      invoicePeriod: transaction.invoicePeriod,
      isInstallment: transaction.isInstallment,
      installmentNumber: transaction.installmentNumber,
      totalInstallments: transaction.totalInstallments,
      installmentLabel: transaction.isInstallment 
        ? `${transaction.installmentNumber}/${transaction.totalInstallments}` 
        : undefined,
      parentTransactionId: transaction.parentTransactionId,
      creditCardId: transaction.creditCardId,
      creditCardName: creditCard?.name,
      creditCardColor: creditCard?.color,
      categoryId: transaction.categoryId,
      categoryName: (transaction as any).category?.name,
      categoryColor: (transaction as any).category?.color,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };

    if (childTransactions && childTransactions.length > 0) {
      dto.childTransactions = childTransactions.map(child => 
        this.mapToResponseDto(child, creditCard)
      );
    }

    return dto;
  }

  private mapInvoiceToResponseDto(invoice: Invoice): InvoiceResponseDto {
    return {
      id: invoice.id,
      period: invoice.period,
      status: invoice.status,
      totalAmount: Number(invoice.totalAmount),
      paidAt: invoice.paidAt,
      closingDate: invoice.closingDate,
      dueDate: invoice.dueDate,
      creditCardId: invoice.creditCardId,
      creditCardName: (invoice as any).creditCard?.name,
      creditCardColor: (invoice as any).creditCard?.color,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}
