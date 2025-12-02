import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { InstallmentPlan } from '../installments/entities/installment-plan.entity';
import { Installment } from '../installments/entities/installment.entity';
import { CreditCard } from '../credit-cards/entities/credit-card.entity';
import { CardTransaction } from '../card-transactions/entities/card-transaction.entity';
import { Invoice } from '../card-transactions/entities/invoice.entity';
import { InstallmentStatus, TransactionType, InvoiceStatus } from '../../common/enums';
import { ProjectionsService, MonthlyStatsWithProjections } from '../transactions/projections.service';

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
    
    // Get current month stats with projections
    const currentMonthStats = await this.projectionsService.getMonthlyStatsWithProjections(
      userId,
      targetYear,
      currentDate.getMonth() + 1,
    );

    // Get full year overview
    const yearlyOverview = await this.projectionsService.getMonthlyStatsWithProjections(
      userId,
      targetYear,
    );

    // Get recent transactions (last 10)
    const recentTransactions = await this.getRecentTransactions(userId, 10);

    // Get top categories for current month
    const topCategories = await this.getTopCategories(userId, targetYear, currentDate.getMonth() + 1);

    // Get installments summary (with paid installments for current month)
    const installments = await this.getInstallmentsSummary(userId, targetYear, currentDate.getMonth() + 1);

    // Get credit cards summary
    const currentPeriod = `${targetYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const creditCards = await this.getCreditCardsSummary(userId, currentPeriod);

    // Get card installments summary
    const cardInstallments = await this.getCardInstallmentsSummary(userId, currentPeriod);

    // Get card expenses based on invoice due date (not invoice period)
    const cardExpenses = await this.getCardExpensesByInvoiceDueMonth(userId, targetYear, currentDate.getMonth() + 1);

    const currentMonth = currentMonthStats[0] || {
      period: `${targetYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
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
        ...currentMonth,
        cardExpenses,
        totalExpenses: currentMonth.totalExpenses + cardExpenses,
        balance: currentMonth.totalIncome - (currentMonth.totalExpenses + cardExpenses),
      },
      yearlyOverview,
      recentTransactions,
      topCategories,
      installments,
      creditCards,
      cardInstallments,
    };
  }

  async getMonthlyDashboardStats(userId: string, year: number, month: number): Promise<MonthlyNavigationStats> {
    // Get specific month stats with projections
    const monthStats = await this.projectionsService.getMonthlyStatsWithProjections(
      userId,
      year,
      month,
    );

    // Get recent transactions for the month
    const competencyPeriod = `${year}-${String(month).padStart(2, '0')}`;
    const monthTransactions = await this.getTransactionsForPeriod(userId, competencyPeriod, 20);

    // Get top categories for the month (includes card transaction categories by due date)
    const topCategories = await this.getTopCategories(userId, year, month);

    // Get installments summary for the selected month
    const installments = await this.getInstallmentsSummary(userId, year, month);

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

    return {
      year,
      month,
      stats,
      recentTransactions: monthTransactions,
      topCategories,
      installments,
    };
  }

  private async getRecentTransactions(userId: string, limit: number = 10) {
    const transactions = await this.transactionsRepository.find({
      where: { userId },
      relations: ['category'],
      order: { transactionDate: 'DESC' },
      take: limit,
    });

    return transactions.map(transaction => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      description: transaction.description,
      type: transaction.type,
      transactionDate: transaction.transactionDate,
      competencyPeriod: transaction.competencyPeriod,
      isProjected: transaction.isProjected || false,
      projectionSource: transaction.projectionSource,
      confidenceScore: transaction.confidenceScore ? Number(transaction.confidenceScore) : undefined,
      category: transaction.category ? {
        id: transaction.category.id,
        name: transaction.category.name,
        color: transaction.category.color,
        icon: transaction.category.icon,
      } : null,
    }));
  }

  private async getTransactionsForPeriod(userId: string, competencyPeriod: string, limit: number = 20) {
    const transactions = await this.transactionsRepository.find({
      where: { 
        userId,
        competencyPeriod,
      },
      relations: ['category'],
      order: { transactionDate: 'DESC' },
      take: limit,
    });

    return transactions.map(transaction => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      description: transaction.description,
      type: transaction.type,
      transactionDate: transaction.transactionDate,
      competencyPeriod: transaction.competencyPeriod,
      isProjected: transaction.isProjected || false,
      projectionSource: transaction.projectionSource,
      confidenceScore: transaction.confidenceScore ? Number(transaction.confidenceScore) : undefined,
      category: transaction.category ? {
        id: transaction.category.id,
        name: transaction.category.name,
        color: transaction.category.color,
        icon: transaction.category.icon,
      } : null,
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
    const categoryMap = new Map<string, {
      id: string | null;
      name: string;
      color: string;
      icon: string;
      total: number;
      count: number;
      type: string;
      projectedTotal: number;
      projectedCount: number;
    }>();

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
    const plans = await this.installmentPlanRepository.find({
      where: { userId, isActive: true },
      relations: ['installments'],
    });

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

    // Get upcoming payments (next 5 installments due)
    const today = new Date();
    const upcomingPayments = await this.installmentRepository
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.installmentPlan', 'plan')
      .where('plan.userId = :userId', { userId })
      .andWhere('installment.status = :status', { status: InstallmentStatus.PENDING })
      .andWhere('installment.dueDate >= :today', { today })
      .orderBy('installment.dueDate', 'ASC')
      .limit(5)
      .getMany();

    const formattedUpcomingPayments = upcomingPayments.map(installment => ({
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
        .limit(5)
        .getMany();

      paidInMonth = paidInstallments.map(installment => ({
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

  private async getCreditCardsSummary(userId: string, currentPeriod: string): Promise<CreditCardSummary[]> {
    const creditCards = await this.creditCardRepository.find({
      where: { userId, isActive: true },
      order: { name: 'ASC' },
    });

    const summaries: CreditCardSummary[] = [];

    for (const card of creditCards) {
      // Get current invoice amount
      const currentInvoiceResult = await this.cardTransactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.creditCardId = :cardId', { cardId: card.id })
        .andWhere('transaction.invoicePeriod = :period', { period: currentPeriod })
        .getRawOne();

      const currentInvoiceAmount = Number(currentInvoiceResult?.total || 0);

      // Calculate used limit considering full installment amounts
      // For installment transactions, we need to count all remaining installments, not just current period
      const usedLimitResult = await this.calculateUsedLimitForCard(card.id, currentPeriod);

      // Get invoice status
      const invoice = await this.invoiceRepository.findOne({
        where: { creditCardId: card.id, period: currentPeriod },
      });

      const totalLimit = Number(card.totalLimit);
      const usedLimit = usedLimitResult;
      const availableLimit = totalLimit - usedLimit;
      const usagePercentage = totalLimit > 0 ? (usedLimit / totalLimit) * 100 : 0;

      // Calculate due date for current period
      const [yearStr, monthStr] = currentPeriod.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr) - 1;
      const dueDate = new Date(year, month, card.dueDay);
      if (card.dueDay <= card.closingDay) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

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

  private async getCardInstallmentsSummary(userId: string, currentPeriod: string): Promise<CardInstallmentSummary[]> {
    // Get all parent installment transactions that have remaining installments
    const installmentTransactions = await this.cardTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.creditCard', 'creditCard')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.isInstallment = :isInstallment', { isInstallment: true })
      .andWhere('transaction.parentTransactionId IS NULL')
      .orderBy('transaction.transactionDate', 'DESC')
      .getMany();

    const summaries: CardInstallmentSummary[] = [];

    for (const transaction of installmentTransactions) {
      // Find current installment for this period
      const currentInstallment = await this.cardTransactionRepository.findOne({
        where: [
          { id: transaction.id, invoicePeriod: currentPeriod },
          { parentTransactionId: transaction.id, invoicePeriod: currentPeriod },
        ],
      });

      // Count remaining installments
      const remainingCount = await this.cardTransactionRepository
        .createQueryBuilder('transaction')
        .where('(transaction.id = :parentId OR transaction.parentTransactionId = :parentId)', { parentId: transaction.id })
        .andWhere('transaction.invoicePeriod >= :period', { period: currentPeriod })
        .getCount();

      if (remainingCount > 0) {
        const currentInstallmentNumber = currentInstallment?.installmentNumber || 
          (transaction.totalInstallments! - remainingCount + 1);

        summaries.push({
          id: transaction.id,
          description: transaction.description,
          creditCardName: transaction.creditCard?.name || '',
          creditCardColor: transaction.creditCard?.color || '#3B82F6',
          currentInstallment: currentInstallmentNumber,
          totalInstallments: transaction.totalInstallments!,
          remainingInstallments: remainingCount,
          installmentAmount: Number(transaction.amount),
          totalRemaining: Number(transaction.amount) * remainingCount,
        });
      }
    }

    return summaries;
  }

  private async getCardExpensesForPeriod(userId: string, period: string): Promise<number> {
    const result = await this.cardTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.invoicePeriod = :period', { period })
      .getRawOne();

    return Number(result?.total || 0);
  }

  /**
   * Calcula despesas de cartão de crédito baseado na data de vencimento da fatura.
   * Se o dia de vencimento <= dia de fechamento, a fatura vence no mês seguinte ao período.
   * Exemplo: Cartão fecha dia 10, vence dia 20 -> fatura de nov vence em nov
   * Exemplo: Cartão fecha dia 25, vence dia 5 -> fatura de nov vence em dez
   */
  async getCardExpensesByInvoiceDueMonth(userId: string, year: number, month: number): Promise<number> {
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
      const invoicePeriods = this.getInvoicePeriodsWithDueDateInMonth(card.closingDay, card.dueDay, year, month);

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
  private getInvoicePeriodsWithDueDateInMonth(closingDay: number, dueDay: number, targetYear: number, targetMonth: number): string[] {
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
  async getCardExpensesByCategoryForDueMonth(userId: string, year: number, month: number): Promise<any[]> {
    const creditCards = await this.creditCardRepository.find({
      where: { userId, isActive: true },
    });

    if (creditCards.length === 0) {
      return [];
    }

    const categoryTotals = new Map<string, { id: string | null; name: string; color: string; icon: string; total: number; count: number }>();

    for (const card of creditCards) {
      const invoicePeriods = this.getInvoicePeriodsWithDueDateInMonth(card.closingDay, card.dueDay, year, month);

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
}