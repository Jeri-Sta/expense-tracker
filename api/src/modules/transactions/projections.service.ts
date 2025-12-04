import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { RecurringTransaction } from '../recurring-transactions/entities/recurring-transaction.entity';
import { GenerateProjectionsDto } from '../transactions/dto/generate-projections.dto';
import { TransactionResponseDto } from '../transactions/dto/transaction-response.dto';
import { Installment } from '../installments/entities/installment.entity';
import { CreditCard } from '../credit-cards/entities/credit-card.entity';
import { CardTransaction } from '../card-transactions/entities/card-transaction.entity';
import { RecurrenceFrequency, InstallmentStatus, PaymentStatus } from '../../common/enums';
import { parseLocalDate } from '../../common/utils/date.utils';

export interface ProjectionResult {
  generated: number;
  period: string;
  projections: Transaction[];
}

export interface MonthlyStatsWithProjections {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  hasProjections: boolean;
  transactionCount: number;
  projectedTransactionCount: number;
  cardExpenses: number;
}

@Injectable()
export class ProjectionsService {
  private readonly logger = new Logger(ProjectionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(RecurringTransaction)
    private readonly recurringRepository: Repository<RecurringTransaction>,
    @InjectRepository(Installment)
    private readonly installmentRepository: Repository<Installment>,
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    @InjectRepository(CardTransaction)
    private readonly cardTransactionRepository: Repository<CardTransaction>,
  ) {}

  async generateRecurringProjections(
    userId: string,
    generateDto: GenerateProjectionsDto,
  ): Promise<ProjectionResult> {
    this.logger.log(
      `Generating projections for user ${userId} from ${generateDto.startPeriod} to ${generateDto.endPeriod}`,
    );

    const startDate = new Date(`${generateDto.startPeriod}-01`);
    const endParts = generateDto.endPeriod.split('-');
    const endDate = new Date(Number.parseInt(endParts[0]), Number.parseInt(endParts[1]), 0); // Last day of month

    // Clean existing projections if requested
    if (generateDto.overrideExisting) {
      await this.cleanupProjections(userId, generateDto.startPeriod, generateDto.endPeriod);
    }

    // Get active recurring transactions
    const recurringTransactions = await this.recurringRepository.find({
      where: {
        userId,
        isActive: true,
        isCompleted: false,
      },
      relations: ['category'],
    });

    const projections: Transaction[] = [];

    for (const recurring of recurringTransactions) {
      const recurringProjections = await this.generateProjectionsForRecurring(
        recurring,
        startDate,
        endDate,
        generateDto.defaultConfidence || 80,
      );
      projections.push(...recurringProjections);
    }

    // Save all projections
    const savedProjections = await this.transactionsRepository.save(projections);

    this.logger.log(`Generated ${savedProjections.length} projections`);

    return {
      generated: savedProjections.length,
      period: `${generateDto.startPeriod} to ${generateDto.endPeriod}`,
      projections: savedProjections,
    };
  }

  async generateProjectionsForRecurring(
    recurring: RecurringTransaction,
    startDate: Date,
    endDate: Date,
    confidence: number,
  ): Promise<Transaction[]> {
    const projections: Transaction[] = [];
    let currentDate = parseLocalDate(recurring.nextExecution || startDate);

    // Ensure we start within the projection period
    if (currentDate < startDate) {
      currentDate = this.getNextExecutionDate(recurring, startDate);
    }

    while (currentDate <= endDate) {
      // Check if projection already exists for this period
      const competencyPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

      const existing = await this.transactionsRepository.findOne({
        where: {
          userId: recurring.userId,
          recurringTransactionId: recurring.id,
          competencyPeriod,
          isProjected: true,
        },
      });

      if (!existing) {
        const projection = this.transactionsRepository.create({
          amount: recurring.amount,
          description: `${recurring.description} (Projeção)`,
          type: recurring.type,
          transactionDate: currentDate,
          competencyPeriod,
          userId: recurring.userId,
          categoryId: recurring.categoryId,
          isProjected: true,
          projectionSource: 'recurring',
          confidenceScore: confidence,
          recurringTransactionId: recurring.id,
          isRecurring: true,
          metadata: {
            originalRecurringId: recurring.id,
            generatedAt: new Date(),
          },
        });

        projections.push(projection);
      }

      // Calculate next execution date
      currentDate = this.getNextExecutionDate(recurring, currentDate);
    }

    return projections;
  }

  private getNextExecutionDate(recurring: RecurringTransaction, currentDate: Date): Date {
    const nextDate = new Date(currentDate);

    switch (recurring.frequency) {
      case RecurrenceFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + (recurring.interval || 1));
        break;
      case RecurrenceFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7 * (recurring.interval || 1));
        break;
      case RecurrenceFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + (recurring.interval || 1));
        break;
      case RecurrenceFrequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + (recurring.interval || 1));
        break;
    }

    return nextDate;
  }

  async getMonthlyProjections(
    userId: string,
    year: number,
    month: number,
  ): Promise<TransactionResponseDto[]> {
    const competencyPeriod = `${year}-${String(month).padStart(2, '0')}`;

    const projections = await this.transactionsRepository.find({
      where: {
        userId,
        competencyPeriod,
        isProjected: true,
      },
      relations: ['category'],
      order: { transactionDate: 'ASC' },
    });

    return projections.map(this.mapToResponseDto);
  }

  async getMonthlyStatsWithProjections(
    userId: string,
    year: number,
    month?: number,
  ): Promise<MonthlyStatsWithProjections[]> {
    const stats: MonthlyStatsWithProjections[] = [];

    if (month) {
      // Single month stats
      const stat = await this.calculateMonthStats(userId, year, month);
      stats.push(stat);
    } else {
      // Full year stats
      for (let m = 1; m <= 12; m++) {
        const stat = await this.calculateMonthStats(userId, year, m);
        stats.push(stat);
      }
    }

    return stats;
  }

  private async calculateMonthStats(
    userId: string,
    year: number,
    month: number,
  ): Promise<MonthlyStatsWithProjections> {
    const competencyPeriod = `${year}-${String(month).padStart(2, '0')}`;

    this.logger.debug(`Calculating stats for period: ${competencyPeriod}, user: ${userId}`);

    // Real transactions
    const realTransactions = await this.transactionsRepository.find({
      where: {
        userId,
        competencyPeriod,
        isProjected: false,
      },
    });

    this.logger.debug(`Found ${realTransactions.length} real transactions for ${competencyPeriod}`);
    if (realTransactions.length > 0) {
      this.logger.debug(
        'Real transactions:',
        realTransactions.map((t) => ({
          id: t.id,
          description: t.description,
          amount: t.amount,
          type: t.type,
          transactionDate: t.transactionDate,
          competencyPeriod: t.competencyPeriod,
        })),
      );
    }

    // Projected transactions
    const projectedTransactions = await this.transactionsRepository.find({
      where: {
        userId,
        competencyPeriod,
        isProjected: true,
      },
    });

    this.logger.debug(
      `Found ${projectedTransactions.length} projected transactions for ${competencyPeriod}`,
    );

    // Get installments for the month - use due date for unpaid, paid date for paid
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    // Unpaid installments based on due date
    const unpaidInstallments = await this.installmentRepository
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.installmentPlan', 'plan')
      .where('plan.userId = :userId', { userId })
      .andWhere('installment.status != :paidStatus', { paidStatus: InstallmentStatus.PAID })
      .andWhere('installment.dueDate >= :startOfMonth', { startOfMonth })
      .andWhere('installment.dueDate <= :endOfMonth', { endOfMonth })
      .getMany();

    // Paid installments based on payment date
    const paidInstallments = await this.installmentRepository
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.installmentPlan', 'plan')
      .where('plan.userId = :userId', { userId })
      .andWhere('installment.status = :paidStatus', { paidStatus: InstallmentStatus.PAID })
      .andWhere('installment.paidDate >= :startOfMonth', { startOfMonth })
      .andWhere('installment.paidDate <= :endOfMonth', { endOfMonth })
      .getMany();

    const realIncome = realTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const realExpenses = realTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Add installment expenses: original amount for unpaid, paid amount for paid
    const installmentExpenses = [
      ...unpaidInstallments.map((i) => Number(i.originalAmount)),
      ...paidInstallments.map((i) => Number(i.paidAmount || i.originalAmount)),
    ].reduce((sum, amount) => sum + amount, 0);

    // Calculate card expenses based on invoice due date
    const cardExpenses = await this.getCardExpensesByInvoiceDueMonth(userId, year, month);

    const totalRealExpenses = realExpenses + installmentExpenses + cardExpenses;

    const projectedIncome = projectedTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const projectedExpenses = projectedTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      period: competencyPeriod,
      totalIncome: realIncome,
      totalExpenses: totalRealExpenses,
      balance: realIncome - totalRealExpenses,
      projectedIncome,
      projectedExpenses,
      projectedBalance: projectedIncome - projectedExpenses,
      hasProjections: projectedTransactions.length > 0,
      transactionCount:
        realTransactions.length + unpaidInstallments.length + paidInstallments.length,
      projectedTransactionCount: projectedTransactions.length,
      cardExpenses,
    };
  }

  async cleanupProjections(
    userId: string,
    startPeriod?: string,
    endPeriod?: string,
  ): Promise<number> {
    const whereCondition: any = {
      userId,
      isProjected: true,
    };

    if (startPeriod && endPeriod) {
      whereCondition.competencyPeriod = Between(startPeriod, endPeriod);
    } else if (startPeriod) {
      whereCondition.competencyPeriod = MoreThanOrEqual(startPeriod);
    } else if (endPeriod) {
      whereCondition.competencyPeriod = LessThanOrEqual(endPeriod);
    }

    const result = await this.transactionsRepository.delete(whereCondition);

    this.logger.log(`Cleaned up ${result.affected} projected transactions`);
    return result.affected || 0;
  }

  async cleanupOldProjections(userId: string): Promise<number> {
    // Remove projections older than current month
    const currentDate = new Date();
    const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const result = await this.transactionsRepository.delete({
      userId,
      isProjected: true,
      competencyPeriod: LessThanOrEqual(currentPeriod),
    });

    this.logger.log(`Cleaned up ${result.affected} old projected transactions`);
    return result.affected || 0;
  }

  private mapToResponseDto(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      amount: Number(transaction.amount),
      description: transaction.description,
      type: transaction.type,
      transactionDate: transaction.transactionDate,
      competencyPeriod: transaction.competencyPeriod,
      notes: transaction.notes,
      metadata: transaction.metadata,
      isRecurring: transaction.isRecurring,
      isProjected: transaction.isProjected,
      projectionSource: transaction.projectionSource,
      confidenceScore: transaction.confidenceScore
        ? Number(transaction.confidenceScore)
        : undefined,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      category: transaction.category
        ? {
            id: transaction.category.id,
            name: transaction.category.name,
            color: transaction.category.color,
            icon: transaction.category.icon,
          }
        : undefined,
      paymentStatus: transaction.paymentStatus ?? PaymentStatus.PENDING,
      paidDate: transaction.paidDate,
    };
  }

  /**
   * Calcula despesas de cartão de crédito baseado na data de vencimento da fatura.
   * Se o dia de vencimento <= dia de fechamento, a fatura vence no mês seguinte ao período.
   */
  private async getCardExpensesByInvoiceDueMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<number> {
    const creditCards = await this.creditCardRepository.find({
      where: { userId, isActive: true },
    });

    if (creditCards.length === 0) {
      return 0;
    }

    let totalExpenses = 0;

    for (const card of creditCards) {
      const invoicePeriods = this.getInvoicePeriodsWithDueDateInMonth(
        card.closingDay,
        card.dueDay,
        year,
        month,
      );

      for (const period of invoicePeriods) {
        const result = await this.cardTransactionRepository
          .createQueryBuilder('transaction')
          .select('SUM(transaction.amount)', 'total')
          .where('transaction.creditCardId = :cardId', { cardId: card.id })
          .andWhere('transaction.invoicePeriod = :period', { period })
          .getRawOne();

        totalExpenses += Number(result?.total || 0);
      }
    }

    return totalExpenses;
  }

  /**
   * Determina quais períodos de fatura têm vencimento no mês/ano alvo.
   */
  private getInvoicePeriodsWithDueDateInMonth(
    closingDay: number,
    dueDay: number,
    targetYear: number,
    targetMonth: number,
  ): string[] {
    const periods: string[] = [];
    const dueDateIsNextMonth = dueDay <= closingDay;

    if (dueDateIsNextMonth) {
      let invoiceMonth = targetMonth - 1;
      let invoiceYear = targetYear;
      if (invoiceMonth < 1) {
        invoiceMonth = 12;
        invoiceYear -= 1;
      }
      periods.push(`${invoiceYear}-${String(invoiceMonth).padStart(2, '0')}`);
    } else {
      periods.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}`);
    }

    return periods;
  }
}
