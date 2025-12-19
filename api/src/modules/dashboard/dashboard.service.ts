import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { InstallmentPlan } from '../installments/entities/installment-plan.entity';
import { Installment } from '../installments/entities/installment.entity';
import { CreditCard } from '../credit-cards/entities/credit-card.entity';
import { CardTransaction } from '../card-transactions/entities/card-transaction.entity';
import { Invoice } from '../card-transactions/entities/invoice.entity';
import { InstallmentStatus, TransactionType, InvoiceStatus } from '../../common/enums';
import {
  ProjectionsService,
  MonthlyStatsWithProjections,
} from '../transactions/projections.service';

export interface CreditCardSummary {
  id: string;
  name: string;
  color: string;
  totalLimit: number;
  usedLimit: number;
  availableLimit: number;
  usagePercentage: number;
  currentInvoiceAmount: number;
  currentInvoiceStatus: InvoiceStatus;
  dueDate?: Date;
}

export interface CardInstallmentSummary {
  id: string;
  description: string;
  creditCardName: string;
  creditCardColor: string;
  currentInstallment: number;
  totalInstallments: number;
  remainingInstallments: number;
  installmentAmount: number;
  totalRemaining: number;
}

export interface InvoiceSummary {
  id: string;
  creditCardId: string;
  creditCardName: string;
  creditCardColor: string;
  period: string;
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  closingDate?: Date;
  paidAt?: Date;
  isOverdue: boolean;
}

export interface MonthlyExpenseBreakdownItem {
  type: 'transaction' | 'credit-card' | 'financing' | 'total';
  name: string;
  amount: number;
  color?: string;
  icon?: string;
  discountAmount?: number;
}

export interface DashboardStats {
  currentMonth: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
    projectedIncome: number;
    projectedExpenses: number;
    projectedBalance: number;
    projectedTransactionCount: number;
    hasProjections: boolean;
    cardExpenses: number;
  };
  yearlyOverview: MonthlyStatsWithProjections[];
  recentTransactions: any[];
  topCategories: any[];
  installments: {
    totalPlans: number;
    totalFinanced: number;
    totalPaid: number;
    totalRemaining: number;
    totalSavings: number;
    upcomingPayments: any[];
    paidInMonth: any[];
  };
  creditCards: CreditCardSummary[];
  cardInstallments: CardInstallmentSummary[];
  invoices: InvoiceSummary[];
  expenseBreakdown: MonthlyExpenseBreakdownItem[];
}

export interface MonthlyNavigationStats {
  year: number;
  month: number;
  stats: MonthlyStatsWithProjections;
  recentTransactions: any[];
  topCategories: any[];
  installments: {
    totalPlans: number;
    totalFinanced: number;
    totalPaid: number;
    totalRemaining: number;
    totalSavings: number;
    upcomingPayments: any[];
    paidInMonth: any[];
  };
  creditCards: CreditCardSummary[];
  cardInstallments: CardInstallmentSummary[];
  invoices: InvoiceSummary[];
  expenseBreakdown: MonthlyExpenseBreakdownItem[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(InstallmentPlan)
    private readonly installmentPlanRepository: Repository<InstallmentPlan>,
    @InjectRepository(Installment)
    private readonly installmentRepository: Repository<Installment>,
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    @InjectRepository(CardTransaction)
    private readonly cardTransactionRepository: Repository<CardTransaction>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly projectionsService: ProjectionsService,
  ) {}

  async getDashboardStats(userId: string, year?: number): Promise<DashboardStats> {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Get current month stats with projections
    const currentMonthStats = await this.projectionsService.getMonthlyStatsWithProjections(
      userId,
      targetYear,
      currentMonth,
    );

    // Get full year overview
    const yearlyOverview = await this.projectionsService.getMonthlyStatsWithProjections(
      userId,
      targetYear,
    );

    // Get transactions for current month (not just recent, but all for the month)
    const competencyPeriod = `${targetYear}-${String(currentMonth).padStart(2, '0')}`;
    const recentTransactions = await this.getTransactionsForPeriod(userId, competencyPeriod);

    // Get top categories for current month
    const topCategories = await this.getTopCategories(userId, targetYear, currentMonth);

    // Get installments summary (with paid installments for current month)
    const installments = await this.getInstallmentsSummary(userId, targetYear, currentMonth);

    // Get credit cards summary (based on invoice due date)
    const creditCards = await this.getCreditCardsSummary(userId, targetYear, currentMonth);

    // Get card installments summary (based on invoice due date)
    const cardInstallments = await this.getCardInstallmentsSummary(
      userId,
      targetYear,
      currentMonth,
    );

    // Get invoices summary (based on invoice due date)
    const invoices = await this.getInvoicesSummary(userId, targetYear, currentMonth);

    // Get card expenses based on invoice due date (not invoice period)
    const cardExpenses = await this.getCardExpensesByInvoiceDueMonth(
      userId,
      targetYear,
      currentMonth,
    );

    // Get monthly expense breakdown
    const expenseBreakdown = await this.getMonthlyExpenseBreakdown(
      userId,
      targetYear,
      currentMonth,
      creditCards,
    );

    const currentMonthData = currentMonthStats[0] || {
      period: `${targetYear}-${String(currentMonth).padStart(2, '0')}`,
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      projectedIncome: 0,
      projectedExpenses: 0,
      projectedBalance: 0,
      hasProjections: false,
      transactionCount: 0,
      projectedTransactionCount: 0,
    };

    return {
      currentMonth: {
        ...currentMonthData,
        cardExpenses,
        totalExpenses: currentMonthData.totalExpenses + cardExpenses,
        balance: currentMonthData.totalIncome - (currentMonthData.totalExpenses + cardExpenses),
      },
      yearlyOverview,
      recentTransactions,
      topCategories,
      installments,
      creditCards,
      cardInstallments,
      invoices,
      expenseBreakdown,
    };
  }

  async getMonthlyDashboardStats(
    userId: string,
    year: number,
    month: number,
  ): Promise<MonthlyNavigationStats> {
    // Get specific month stats with projections
    const monthStats = await this.projectionsService.getMonthlyStatsWithProjections(
      userId,
      year,
      month,
    );

    // Get all transactions for the month
    const competencyPeriod = `${year}-${String(month).padStart(2, '0')}`;
    const monthTransactions = await this.getTransactionsForPeriod(userId, competencyPeriod);

    // Get top categories for the month (includes card transaction categories by due date)
    const topCategories = await this.getTopCategories(userId, year, month);

    // Get installments summary for the selected month
    const installments = await this.getInstallmentsSummary(userId, year, month);

    // Get credit cards summary (based on invoice due date)
    const creditCards = await this.getCreditCardsSummary(userId, year, month);

    // Get card installments summary (based on invoice due date)
    const cardInstallments = await this.getCardInstallmentsSummary(userId, year, month);

    // Get invoices summary (based on invoice due date)
    const invoices = await this.getInvoicesSummary(userId, year, month);

    const stats = monthStats[0] || {
      period: competencyPeriod,
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      projectedIncome: 0,
      projectedExpenses: 0,
      projectedBalance: 0,
      hasProjections: false,
      transactionCount: 0,
      projectedTransactionCount: 0,
      cardExpenses: 0,
    };

    // Get monthly expense breakdown
    const expenseBreakdown = await this.getMonthlyExpenseBreakdown(
      userId,
      year,
      month,
      creditCards,
    );

    return {
      year,
      month,
      stats,
      recentTransactions: monthTransactions,
      topCategories,
      installments,
      creditCards,
      cardInstallments,
      invoices,
      expenseBreakdown,
    };
  }

  private async getRecentTransactions(userId: string, limit: number = 10) {
    const transactions = await this.transactionsRepository.find({
      where: { userId },
      relations: ['category'],
      order: { transactionDate: 'DESC' },
      take: limit,
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      description: transaction.description,
      type: transaction.type,
      transactionDate: transaction.transactionDate,
      competencyPeriod: transaction.competencyPeriod,
      isProjected: transaction.isProjected || false,
      projectionSource: transaction.projectionSource,
      confidenceScore: transaction.confidenceScore
        ? Number(transaction.confidenceScore)
        : undefined,
      paymentStatus: transaction.paymentStatus || 'pending',
      paidDate: transaction.paidDate,
      category: transaction.category
        ? {
            id: transaction.category.id,
            name: transaction.category.name,
            color: transaction.category.color,
            icon: transaction.category.icon,
          }
        : null,
    }));
  }

  private async getTransactionsForPeriod(userId: string, competencyPeriod: string, limit?: number) {
    const findOptions: any = {
      where: {
        userId,
        competencyPeriod,
      },
      relations: ['category'],
      order: { transactionDate: 'DESC' },
    };

    // Only apply limit if specified
    if (limit) {
      findOptions.take = limit;
    }

    const transactions = await this.transactionsRepository.find(findOptions);

    return transactions.map((transaction) => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      description: transaction.description,
      type: transaction.type,
      transactionDate: transaction.transactionDate,
      competencyPeriod: transaction.competencyPeriod,
      isProjected: transaction.isProjected || false,
      projectionSource: transaction.projectionSource,
      confidenceScore: transaction.confidenceScore
        ? Number(transaction.confidenceScore)
        : undefined,
      paymentStatus: transaction.paymentStatus || 'pending',
      paidDate: transaction.paidDate,
      category: transaction.category
        ? {
            id: transaction.category.id,
            name: transaction.category.name,
            color: transaction.category.color,
            icon: transaction.category.icon,
          }
        : null,
    }));
  }

  private async getTopCategories(userId: string, year: number, month: number) {
    const competencyPeriod = `${year}-${String(month).padStart(2, '0')}`;

    // Get regular transaction categories
    const transactionResult = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select([
        'category.id as id',
        'category.name as name',
        'category.color as color',
        'category.icon as icon',
        'SUM(transaction.amount) as total',
        'COUNT(transaction.id) as count',
        'transaction.type as type',
        'SUM(CASE WHEN transaction.isProjected = true THEN transaction.amount ELSE 0 END) as projectedTotal',
        'COUNT(CASE WHEN transaction.isProjected = true THEN 1 END) as projectedCount',
      ])
      .leftJoin('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.competencyPeriod = :competencyPeriod', { competencyPeriod })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .groupBy('category.id, category.name, category.color, category.icon, transaction.type')
      .getRawMany();

    // Get card transaction categories based on invoice due date
    const cardCategories = await this.getCardExpensesByCategoryForDueMonth(userId, year, month);

    // Merge categories from both sources
    const categoryMap = new Map<
      string,
      {
        id: string | null;
        name: string;
        color: string;
        icon: string;
        total: number;
        count: number;
        type: string;
        projectedTotal: number;
        projectedCount: number;
      }
    >();

    // Add regular transaction categories
    for (const item of transactionResult) {
      const key = item.id || 'uncategorized';
      categoryMap.set(key, {
        id: item.id,
        name: item.name || 'Sem categoria',
        color: item.color || '#808080',
        icon: item.icon || 'category',
        total: Number(item.total) || 0,
        count: Number(item.count) || 0,
        type: item.type,
        projectedTotal: Number(item.projectedtotal) || 0,
        projectedCount: Number(item.projectedcount) || 0,
      });
    }

    // Merge card transaction categories
    for (const cardCat of cardCategories) {
      const key = cardCat.id || 'uncategorized';
      const existing = categoryMap.get(key);
      if (existing) {
        existing.total += cardCat.total;
        existing.count += cardCat.count;
      } else {
        categoryMap.set(key, {
          id: cardCat.id,
          name: cardCat.name,
          color: cardCat.color,
          icon: cardCat.icon,
          total: cardCat.total,
          count: cardCat.count,
          type: TransactionType.EXPENSE,
          projectedTotal: 0,
          projectedCount: 0,
        });
      }
    }

    // Sort by total and limit to top 5
    const sortedCategories = Array.from(categoryMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return sortedCategories;
  }

  private async getInstallmentsSummary(userId: string, year?: number, month?: number) {
    // Get all active installment plans
    const startOfPeriod = month !== undefined ? new Date(year, month, 1) : new Date(year, 0, 1);

    const endOfPeriod =
      month !== undefined
        ? new Date(year, month + 1, 0, 23, 59, 59)
        : new Date(year, 11, 31, 23, 59, 59);

    const qb = this.installmentPlanRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.installments', 'installment')
      .where('plan.userId = :userId', { userId })
      .andWhere('plan.isActive = true')
      .andWhere('plan.startDate <= :endOfPeriod', { endOfPeriod })
      .andWhere('plan.endDate >= :startOfPeriod', { startOfPeriod });

    const plans = await qb.getMany();

    if (!plans.length) {
      return {
        totalPlans: 0,
        totalFinanced: 0,
        totalPaid: 0,
        totalRemaining: 0,
        totalSavings: 0,
        upcomingPayments: [],
        paidInMonth: [],
      };
    }

    // Calculate totals
    const totalPlans = plans.length;
    const totalFinanced = plans.reduce((sum, plan) => sum + Number(plan.financedAmount), 0);
    const totalPaid = plans.reduce((sum, plan) => sum + Number(plan.totalPaid), 0);
    const totalRemaining = plans.reduce((sum, plan) => sum + Number(plan.remainingAmount), 0);
    const totalSavings = plans.reduce((sum, plan) => sum + Number(plan.totalDiscount), 0);

    // Get upcoming payments (all pending installments due)
    const today = new Date();
    const upcomingPayments = await this.installmentRepository
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.installmentPlan', 'plan')
      .where('plan.userId = :userId', { userId })
      .andWhere('installment.status = :status', { status: InstallmentStatus.PENDING })
      .andWhere('installment.dueDate >= :today', { today })
      .orderBy('installment.dueDate', 'ASC')
      .getMany();

    const formattedUpcomingPayments = upcomingPayments.map((installment) => ({
      id: installment.id,
      installmentNumber: installment.installmentNumber,
      amount: Number(installment.originalAmount),
      dueDate: installment.dueDate,
      planName: installment.installmentPlan.name,
      planId: installment.installmentPlan.id,
    }));

    // Get paid installments for the selected month (if year and month provided)
    let paidInMonth: {
      id: string;
      planId: string;
      planName: string;
      installmentNumber: number;
      totalInstallments: number;
      paidAmount: number;
      paidDate: Date;
      discountAmount: number;
    }[] = [];

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const paidInstallments = await this.installmentRepository
        .createQueryBuilder('installment')
        .leftJoinAndSelect('installment.installmentPlan', 'plan')
        .where('plan.userId = :userId', { userId })
        .andWhere('installment.status = :status', { status: InstallmentStatus.PAID })
        .andWhere('installment.paidDate >= :startDate', { startDate })
        .andWhere('installment.paidDate <= :endDate', { endDate })
        .orderBy('installment.paidDate', 'DESC')
        .getMany();

      paidInMonth = paidInstallments.map((installment) => ({
        id: installment.id,
        planId: installment.installmentPlan.id,
        planName: installment.installmentPlan.name,
        installmentNumber: installment.installmentNumber,
        totalInstallments: installment.installmentPlan.totalInstallments,
        paidAmount: Number(installment.paidAmount || 0),
        paidDate: installment.paidDate,
        discountAmount: Number(installment.discountAmount || 0),
      }));
    }

    return {
      totalPlans,
      totalFinanced,
      totalPaid,
      totalRemaining,
      totalSavings,
      upcomingPayments: formattedUpcomingPayments,
      paidInMonth,
    };
  }

  /**
   * Calcula o limite usado do cartão considerando o valor total das transações parceladas.
   * Para transações parceladas, soma todas as parcelas restantes (do período atual em diante).
   * Para transações simples, soma apenas as do período atual.
   */
  private async calculateUsedLimitForCard(cardId: string, currentPeriod: string): Promise<number> {
    // 1. Sum of non-installment transactions in current period
    const nonInstallmentResult = await this.cardTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.creditCardId = :cardId', { cardId })
      .andWhere('transaction.invoicePeriod = :period', { period: currentPeriod })
      .andWhere('transaction.isInstallment = :isInstallment', { isInstallment: false })
      .getRawOne();

    const nonInstallmentTotal = Number(nonInstallmentResult?.total || 0);

    // 2. For installment transactions, get the total remaining value (all installments from current period onwards)
    const installmentResult = await this.cardTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.creditCardId = :cardId', { cardId })
      .andWhere('transaction.invoicePeriod >= :period', { period: currentPeriod })
      .andWhere('transaction.isInstallment = :isInstallment', { isInstallment: true })
      .getRawOne();

    const installmentTotal = Number(installmentResult?.total || 0);

    return nonInstallmentTotal + installmentTotal;
  }

  private async getCreditCardsSummary(
    userId: string,
    year: number,
    month: number,
  ): Promise<CreditCardSummary[]> {
    const creditCards = await this.creditCardRepository.find({
      where: { userId, isActive: true },
      order: { name: 'ASC' },
    });

    const summaries: CreditCardSummary[] = [];

    for (const card of creditCards) {
      // Get the invoice period that has due date in the target month
      const invoicePeriods = this.getInvoicePeriodsWithDueDateInMonth(
        card.closingDay,
        card.dueDay,
        year,
        month,
      );
      const invoicePeriod = invoicePeriods[0]; // Should have only one period

      // Get current invoice amount for the invoice that is due in this month
      const currentInvoiceResult = await this.cardTransactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.creditCardId = :cardId', { cardId: card.id })
        .andWhere('transaction.invoicePeriod = :period', { period: invoicePeriod })
        .getRawOne();

      const currentInvoiceAmount = Number(currentInvoiceResult?.total || 0);

      // Calculate used limit considering full installment amounts
      // For installment transactions, we need to count all remaining installments, not just current period
      const usedLimitResult = await this.calculateUsedLimitForCard(card.id, invoicePeriod);

      // Get invoice status
      const invoice = await this.invoiceRepository.findOne({
        where: { creditCardId: card.id, period: invoicePeriod },
      });

      const totalLimit = Number(card.totalLimit);
      const usedLimit = usedLimitResult;
      const availableLimit = totalLimit - usedLimit;
      const usagePercentage = totalLimit > 0 ? (usedLimit / totalLimit) * 100 : 0;

      // Due date is in the target month
      const dueDate = new Date(year, month - 1, card.dueDay);

      summaries.push({
        id: card.id,
        name: card.name,
        color: card.color,
        totalLimit,
        usedLimit,
        availableLimit,
        usagePercentage,
        currentInvoiceAmount,
        currentInvoiceStatus: invoice?.status || InvoiceStatus.OPEN,
        dueDate,
      });
    }

    return summaries;
  }

  private async getInvoicesSummary(
    userId: string,
    year: number,
    month: number,
  ): Promise<InvoiceSummary[]> {
    const creditCards = await this.creditCardRepository.find({
      where: { userId, isActive: true },
      order: { name: 'ASC' },
    });

    const summaries: InvoiceSummary[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const card of creditCards) {
      // Get the invoice period that has due date in the target month
      const invoicePeriods = this.getInvoicePeriodsWithDueDateInMonth(
        card.closingDay,
        card.dueDay,
        year,
        month,
      );
      const invoicePeriod = invoicePeriods[0];

      // Get invoice amount from transactions
      const invoiceAmountResult = await this.cardTransactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.creditCardId = :cardId', { cardId: card.id })
        .andWhere('transaction.invoicePeriod = :period', { period: invoicePeriod })
        .getRawOne();

      const totalAmount = Number(invoiceAmountResult?.total || 0);

      // Skip if no transactions for this invoice
      if (totalAmount === 0) {
        continue;
      }

      // Get invoice record (may not exist if not created yet)
      const invoice = await this.invoiceRepository.findOne({
        where: { creditCardId: card.id, period: invoicePeriod },
      });

      // Calculate due date
      const dueDate = new Date(year, month - 1, card.dueDay);

      // Calculate closing date (one month before due date, on closing day)
      const closingDate = new Date(year, month - 2, card.closingDay);

      // Check if overdue
      const isOverdue = invoice?.status !== InvoiceStatus.PAID && dueDate < today;

      summaries.push({
        id: invoice?.id || `${card.id}-${invoicePeriod}`,
        creditCardId: card.id,
        creditCardName: card.name,
        creditCardColor: card.color,
        period: invoicePeriod,
        totalAmount,
        status: invoice?.status || InvoiceStatus.OPEN,
        dueDate,
        closingDate,
        paidAt: invoice?.paidAt,
        isOverdue,
      });
    }

    return summaries;
  }

  private async getCardInstallmentsSummary(
    userId: string,
    year: number,
    month: number,
  ): Promise<CardInstallmentSummary[]> {
    // Get all credit cards to determine invoice periods based on due date
    const creditCards = await this.creditCardRepository.find({
      where: { userId, isActive: true },
    });

    if (creditCards.length === 0) {
      return [];
    }

    const summaries: CardInstallmentSummary[] = [];
    const processedTransactionIds = new Set<string>();

    for (const card of creditCards) {
      // Get the invoice period that has due date in the target month
      const invoicePeriods = this.getInvoicePeriodsWithDueDateInMonth(
        card.closingDay,
        card.dueDay,
        year,
        month,
      );
      const invoicePeriod = invoicePeriods[0];

      // Get all installment transactions for this card and period
      const installmentTransactions = await this.cardTransactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.creditCard', 'creditCard')
        .leftJoinAndSelect('transaction.parentTransaction', 'parentTransaction')
        .where('transaction.creditCardId = :cardId', { cardId: card.id })
        .andWhere('transaction.isInstallment = :isInstallment', { isInstallment: true })
        .andWhere('transaction.invoicePeriod = :period', { period: invoicePeriod })
        .orderBy('transaction.transactionDate', 'DESC')
        .getMany();

      for (const transaction of installmentTransactions) {
        // Determine the parent transaction id
        const parentId = transaction.parentTransactionId || transaction.id;

        // Skip if already processed
        if (processedTransactionIds.has(parentId)) {
          continue;
        }
        processedTransactionIds.add(parentId);

        // Get parent transaction info if needed
        const parentTransaction = transaction.parentTransaction || transaction;

        // Count remaining installments from this period onwards
        const remainingCount = await this.cardTransactionRepository
          .createQueryBuilder('t')
          .where('(t.id = :parentId OR t.parentTransactionId = :parentId)', { parentId })
          .andWhere('t.invoicePeriod >= :period', { period: invoicePeriod })
          .getCount();

        summaries.push({
          id: parentId,
          description: parentTransaction.description,
          creditCardName: card.name,
          creditCardColor: card.color,
          currentInstallment: transaction.installmentNumber || 1,
          totalInstallments:
            transaction.totalInstallments || parentTransaction.totalInstallments || 1,
          remainingInstallments: remainingCount,
          installmentAmount: Number(transaction.amount),
          totalRemaining: Number(transaction.amount) * remainingCount,
        });
      }
    }

    return summaries;
  }

  /**
   * Calcula despesas de cartão de crédito baseado na data de vencimento da fatura.
   * Se o dia de vencimento <= dia de fechamento, a fatura vence no mês seguinte ao período.
   * Exemplo: Cartão fecha dia 10, vence dia 20 -> fatura de nov vence em nov
   * Exemplo: Cartão fecha dia 25, vence dia 5 -> fatura de nov vence em dez
   */
  async getCardExpensesByInvoiceDueMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<number> {
    // Get all credit cards for the user
    const creditCards = await this.creditCardRepository.find({
      where: { userId, isActive: true },
    });

    if (creditCards.length === 0) {
      return 0;
    }

    let totalExpenses = 0;

    for (const card of creditCards) {
      // Calculate which invoice period(s) have due date in the target month
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
   * Determina quais períodos de fatura (invoicePeriod) têm vencimento no mês/ano alvo.
   * Retorna array de períodos no formato YYYY-MM.
   */
  private getInvoicePeriodsWithDueDateInMonth(
    closingDay: number,
    dueDay: number,
    targetYear: number,
    targetMonth: number,
  ): string[] {
    const periods: string[] = [];

    // Se dueDay <= closingDay, a fatura do período X vence no mês X+1
    // Caso contrário, vence no mesmo mês X
    const dueDateIsNextMonth = dueDay <= closingDay;

    if (dueDateIsNextMonth) {
      // A fatura que vence no mês alvo é do mês anterior
      let invoiceMonth = targetMonth - 1;
      let invoiceYear = targetYear;
      if (invoiceMonth < 1) {
        invoiceMonth = 12;
        invoiceYear -= 1;
      }
      periods.push(`${invoiceYear}-${String(invoiceMonth).padStart(2, '0')}`);
    } else {
      // A fatura que vence no mês alvo é do próprio mês
      periods.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}`);
    }

    return periods;
  }

  /**
   * Obtém despesas de cartão por categoria para um mês específico (baseado na data de vencimento).
   */
  async getCardExpensesByCategoryForDueMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<any[]> {
    const creditCards = await this.creditCardRepository.find({
      where: { userId, isActive: true },
    });

    if (creditCards.length === 0) {
      return [];
    }

    const categoryTotals = new Map<
      string,
      { id: string | null; name: string; color: string; icon: string; total: number; count: number }
    >();

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
          .select([
            'category.id as id',
            'category.name as name',
            'category.color as color',
            'category.icon as icon',
            'SUM(transaction.amount) as total',
            'COUNT(transaction.id) as count',
          ])
          .leftJoin('transaction.category', 'category')
          .where('transaction.creditCardId = :cardId', { cardId: card.id })
          .andWhere('transaction.invoicePeriod = :period', { period })
          .groupBy('category.id, category.name, category.color, category.icon')
          .getRawMany();

        for (const item of result) {
          const key = item.id || 'uncategorized';
          const existing = categoryTotals.get(key);
          if (existing) {
            existing.total += Number(item.total || 0);
            existing.count += Number(item.count || 0);
          } else {
            categoryTotals.set(key, {
              id: item.id,
              name: item.name || 'Sem categoria',
              color: item.color || '#808080',
              icon: item.icon || 'credit_card',
              total: Number(item.total || 0),
              count: Number(item.count || 0),
            });
          }
        }
      }
    }

    return Array.from(categoryTotals.values());
  }

  /**
   * Generates a breakdown of monthly expenses by source: regular transactions, credit cards, and financings.
   * Only shows items with values > 0. Includes a grand total at the end.
   */
  private async getMonthlyExpenseBreakdown(
    userId: string,
    year: number,
    month: number,
    creditCards: CreditCardSummary[],
  ): Promise<MonthlyExpenseBreakdownItem[]> {
    const breakdown: MonthlyExpenseBreakdownItem[] = [];
    let grandTotal = 0;

    // 1. Get regular transaction expenses (excluding projected)
    const competencyPeriod = `${year}-${String(month).padStart(2, '0')}`;
    const regularExpensesResult = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.competencyPeriod = :competencyPeriod', { competencyPeriod })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('(transaction.isProjected = false OR transaction.isProjected IS NULL)')
      .getRawOne();

    const regularExpenses = Number(regularExpensesResult?.total || 0);

    if (regularExpenses > 0) {
      breakdown.push({
        type: 'transaction',
        name: 'Transações',
        amount: regularExpenses,
        icon: 'receipt_long',
        color: '#607D8B',
      });
      grandTotal += regularExpenses;
    }

    // 2. Credit card invoices - one item per card with invoice amount > 0
    for (const card of creditCards) {
      if (card.currentInvoiceAmount > 0) {
        breakdown.push({
          type: 'credit-card',
          name: card.name,
          amount: card.currentInvoiceAmount,
          icon: 'credit_card',
          color: card.color || '#9C27B0',
        });
        grandTotal += card.currentInvoiceAmount;
      }
    }

    // 3. Financings - Get installments due in this month + early payments from other months
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // 3a. Get all installments DUE in this month but exclude installments
    // that were already paid in a different month (i.e. paidDate exists and
    // is outside the current month range). We keep installments that are
    // unpaid or that were paid within this month.
    const installmentsDueThisMonth = await this.installmentRepository
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.installmentPlan', 'plan')
      .where('plan.userId = :userId', { userId })
      .andWhere('installment.dueDate >= :startOfMonth', { startOfMonth })
      .andWhere('installment.dueDate <= :endOfMonth', { endOfMonth })
      .andWhere(
        new Brackets((qb) => {
          // Keep installments that are not paid, OR that were paid within the month
          qb.where('installment.status != :paidStatus', {
            paidStatus: InstallmentStatus.PAID,
          });
          qb.orWhere(
            '(installment.status = :paidStatus AND installment.paidDate >= :startOfMonth AND installment.paidDate <= :endOfMonth)',
            {
              paidStatus: InstallmentStatus.PAID,
              startOfMonth,
              endOfMonth,
            },
          );
        }),
      )
      .getMany();

    // 3b. Get installments PAID in this month but DUE in other months (early payments / adiantamentos)
    const earlyPayments = await this.installmentRepository
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.installmentPlan', 'plan')
      .where('plan.userId = :userId', { userId })
      .andWhere('installment.status = :status', { status: InstallmentStatus.PAID })
      .andWhere('installment.paidDate >= :startOfMonth', { startOfMonth })
      .andWhere('installment.paidDate <= :endOfMonth', { endOfMonth })
      .andWhere('(installment.dueDate < :startOfMonth OR installment.dueDate > :endOfMonth)', {
        startOfMonth,
        endOfMonth,
      })
      .getMany();

    // Aggregate by plan
    const planTotals = new Map<
      string,
      {
        name: string;
        dueAmount: number; // Amount due this month (original or paid)
        earlyPaymentAmount: number; // Amount from early payments
        discountAmount: number;
      }
    >();

    // Process installments due this month
    for (const installment of installmentsDueThisMonth) {
      const planId = installment.installmentPlan.id;
      const existing = planTotals.get(planId);
      // Use paidAmount if paid, otherwise originalAmount
      const amount =
        installment.status === InstallmentStatus.PAID
          ? Number(installment.paidAmount || installment.originalAmount)
          : Number(installment.originalAmount);
      const discount =
        installment.status === InstallmentStatus.PAID ? Number(installment.discountAmount || 0) : 0;

      if (existing) {
        existing.dueAmount += amount;
        existing.discountAmount += discount;
      } else {
        planTotals.set(planId, {
          name: installment.installmentPlan.name,
          dueAmount: amount,
          earlyPaymentAmount: 0,
          discountAmount: discount,
        });
      }
    }

    // Process early payments (paid this month but due in other months)
    for (const installment of earlyPayments) {
      const planId = installment.installmentPlan.id;
      const existing = planTotals.get(planId);
      const amount = Number(installment.paidAmount || installment.originalAmount);
      const discount = Number(installment.discountAmount || 0);

      if (existing) {
        existing.earlyPaymentAmount += amount;
        existing.discountAmount += discount;
      } else {
        planTotals.set(planId, {
          name: installment.installmentPlan.name,
          dueAmount: 0,
          earlyPaymentAmount: amount,
          discountAmount: discount,
        });
      }
    }

    // Add financing items to breakdown
    for (const [_, plan] of planTotals) {
      const totalAmount = plan.dueAmount + plan.earlyPaymentAmount;
      if (totalAmount > 0) {
        // Build description based on what we have
        let name = plan.name;
        if (plan.earlyPaymentAmount > 0 && plan.dueAmount > 0) {
          name = `${plan.name} (+ adiantamento)`;
        } else if (plan.earlyPaymentAmount > 0 && plan.dueAmount === 0) {
          name = `${plan.name} (adiantamento)`;
        }

        breakdown.push({
          type: 'financing',
          name,
          amount: totalAmount,
          icon: 'account_balance',
          color: '#FF9800',
          discountAmount: plan.discountAmount > 0 ? plan.discountAmount : undefined,
        });
        grandTotal += totalAmount;
      }
    }

    // 4. Add grand total row
    if (breakdown.length > 0) {
      breakdown.push({
        type: 'total',
        name: 'Total Geral',
        amount: grandTotal,
        icon: 'functions',
        color: '#2196F3',
      });
    }

    return breakdown;
  }
}
