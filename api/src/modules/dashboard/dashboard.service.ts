import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { InstallmentPlan } from '../installments/entities/installment-plan.entity';
import { Installment } from '../installments/entities/installment.entity';
import { InstallmentStatus, TransactionType } from '../../common/enums';
import { ProjectionsService, MonthlyStatsWithProjections } from '../transactions/projections.service';

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
  };
}

export interface MonthlyNavigationStats {
  year: number;
  month: number;
  stats: MonthlyStatsWithProjections;
  recentTransactions: any[];
  topCategories: any[];
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

    // Get installments summary
    const installments = await this.getInstallmentsSummary(userId);

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
      currentMonth,
      yearlyOverview,
      recentTransactions,
      topCategories,
      installments,
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

    // Get top categories for the month
    const topCategories = await this.getTopCategories(userId, year, month);

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
    };

    return {
      year,
      month,
      stats,
      recentTransactions: monthTransactions,
      topCategories,
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
    
    const result = await this.transactionsRepository
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
      .orderBy('total', 'DESC')
      .limit(5)
      .getRawMany();

    return result.map(item => ({
      id: item.id,
      name: item.name || 'Sem categoria',
      color: item.color || '#808080',
      icon: item.icon || 'category',
      total: Number(item.total) || 0,
      count: Number(item.count) || 0,
      type: item.type,
      projectedTotal: Number(item.projectedtotal) || 0,
      projectedCount: Number(item.projectedcount) || 0,
    }));
  }

  private async getInstallmentsSummary(userId: string) {
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

    return {
      totalPlans,
      totalFinanced,
      totalPaid,
      totalRemaining,
      totalSavings,
      upcomingPayments: formattedUpcomingPayments,
    };
  }
}