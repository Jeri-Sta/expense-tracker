import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, Not, In } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { RecurringTransaction } from '../recurring-transactions/entities/recurring-transaction.entity';
import { GenerateProjectionsDto } from '../transactions/dto/generate-projections.dto';
import { TransactionResponseDto } from '../transactions/dto/transaction-response.dto';
import { Installment } from '../installments/entities/installment.entity';
import { CardTransaction } from '../card-transactions/entities/card-transaction.entity';
import { RecurrenceFrequency, InstallmentStatus } from '../../common/enums';
import { parseLocalDate } from '../../common/utils/date.utils';
import { calculateInvoicePeriod } from '../../common/utils/invoice.utils';
import { Subscription } from '../subscriptions/entities/subscription.entity';

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
  subscriptionProjections: SubscriptionProjection[];
}

export interface SubscriptionProjection {
  name: string;
  chargeDate: string;
  amount: number;
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
    @InjectRepository(CardTransaction)
    private readonly cardTransactionRepository: Repository<CardTransaction>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async generateRecurringProjections(
    workspaceId: string,
    generateDto: GenerateProjectionsDto,
  ): Promise<ProjectionResult> {
    // Normalize period format (accept both YYYY-MM and MM/YYYY)
    const normalizedStartPeriod = this.normalizePeriodFormat(generateDto.startPeriod);
    const normalizedEndPeriod = this.normalizePeriodFormat(generateDto.endPeriod);

    const startDate = parseLocalDate(`${normalizedStartPeriod}-01`);
    const endParts = normalizedEndPeriod.split('-');
    const endYear = Number.parseInt(endParts[0]);
    const endMonth = Number.parseInt(endParts[1]);
    // Last moment of the last day of the month
    const endDate = new Date(endYear, endMonth, 0, 23, 59, 59, 999);

    // Clean existing projections if requested
    if (generateDto.overrideExisting) {
      await this.cleanupProjections(workspaceId, normalizedStartPeriod, normalizedEndPeriod);
    }

    // Get active recurring transactions
    const recurringTransactions = await this.recurringRepository.find({
      where: {
        workspaceId,
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
      period: `${normalizedStartPeriod} to ${normalizedEndPeriod}`,
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
    // Advance until currentDate is within or after the projection period
    while (currentDate < startDate) {
      currentDate = this.getNextExecutionDate(recurring, currentDate);
    }

    while (currentDate <= endDate) {
      // Check if projection already exists for this period
      const competencyPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

      const existing = await this.transactionsRepository.findOne({
        where: {
          workspaceId: recurring.workspaceId,
          recurringTransactionId: recurring.id,
          transactionDate: currentDate,
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
          workspaceId: recurring.workspaceId,
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

  /**
   * Normalizes period format to YYYY-MM
   * Accepts both YYYY-MM and MM/YYYY formats
   */
  private normalizePeriodFormat(period: string): string {
    // Check if format is MM/YYYY (contains /)
    if (period.includes('/')) {
      const [month, year] = period.split('/');
      return `${year}-${month.padStart(2, '0')}`;
    }

    // Check if format is YYYY-MM (contains -)
    if (period.includes('-')) {
      const parts = period.split('-');
      // Ensure month has 2 digits
      if (parts.length === 2) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}`;
      }
    }

    // If no separator found, throw error
    throw new Error(`Invalid period format: ${period}. Expected YYYY-MM or MM/YYYY`);
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
      case RecurrenceFrequency.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3 * (recurring.interval || 1));
        break;
      case RecurrenceFrequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + (recurring.interval || 1));
        break;
    }

    return nextDate;
  }

  async getMonthlyProjections(
    workspaceId: string,
    year: number,
    month: number,
  ): Promise<TransactionResponseDto[]> {
    const competencyPeriod = `${year}-${String(month).padStart(2, '0')}`;

    const projections = await this.transactionsRepository.find({
      where: {
        workspaceId,
        competencyPeriod,
        isProjected: true,
      },
      relations: ['category'],
      order: { transactionDate: 'ASC' },
    });

    return projections.map(this.mapToResponseDto);
  }

  async getMonthlyStatsWithProjections(
    workspaceId: string,
    year: number,
    month?: number,
  ): Promise<MonthlyStatsWithProjections[]> {
    const stats: MonthlyStatsWithProjections[] = [];

    if (month) {
      // Single month stats
      const stat = await this.calculateMonthStats(workspaceId, year, month);
      stats.push(stat);
    } else {
      // Full year stats
      for (let m = 1; m <= 12; m++) {
        const stat = await this.calculateMonthStats(workspaceId, year, m);
        stats.push(stat);
      }
    }

    return stats;
  }

  private async calculateMonthStats(
    workspaceId: string,
    year: number,
    month: number,
  ): Promise<MonthlyStatsWithProjections> {
    const competencyPeriod = `${year}-${String(month).padStart(2, '0')}`;

    // Real transactions
    const realTransactions = await this.transactionsRepository.find({
      where: {
        workspaceId,
        competencyPeriod,
        isProjected: false,
      },
    });

    // Projected transactions
    const projectedTransactions = await this.transactionsRepository.find({
      where: {
        workspaceId,
        competencyPeriod,
        isProjected: true,
      },
    });

    // Financing competency is the installment due month, regardless of payment date.
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const installments = await this.installmentRepository
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.installmentPlan', 'plan')
      .where('plan.workspaceId = :workspaceId', { workspaceId })
      .andWhere('installment.dueDate >= :startOfMonth', { startOfMonth })
      .andWhere('installment.dueDate <= :endOfMonth', { endOfMonth })
      .andWhere('installment.status != :cancelled', { cancelled: InstallmentStatus.CANCELLED })
      .getMany();

    const realIncome = realTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const realExpenses = realTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const installmentExpenses = installments.reduce(
      (sum, item) =>
        sum +
        Number(
          item.status === InstallmentStatus.PAID
            ? item.paidAmount || item.originalAmount
            : item.originalAmount,
        ),
      0,
    );

    const cardExpenses = await this.getCardExpensesByCompetencyMonth(workspaceId, year, month);

    const totalRealExpenses = realExpenses + installmentExpenses + cardExpenses;

    const projectedIncome = projectedTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const projectedExpenses = projectedTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const subscriptionProjections = await this.getSubscriptionProjections(workspaceId, year, month);
    const totalProjectedExpenses =
      projectedExpenses + subscriptionProjections.reduce((sum, item) => sum + item.amount, 0);

    return {
      period: competencyPeriod,
      totalIncome: realIncome,
      totalExpenses: totalRealExpenses,
      balance: realIncome - totalRealExpenses,
      projectedIncome,
      projectedExpenses: totalProjectedExpenses,
      projectedBalance: projectedIncome - totalProjectedExpenses,
      hasProjections: projectedTransactions.length > 0 || subscriptionProjections.length > 0,
      transactionCount: realTransactions.length + installments.length,
      projectedTransactionCount: projectedTransactions.length + subscriptionProjections.length,
      cardExpenses,
      subscriptionProjections,
    };
  }

  private async getSubscriptionProjections(
    workspaceId: string,
    year: number,
    month: number,
  ): Promise<SubscriptionProjection[]> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { workspaceId, isActive: true },
      relations: ['creditCard'],
    });
    if (!subscriptions.length) return [];

    const firstChargeMonth = new Date(year, month - 2, 1);
    const lastChargeMonth = new Date(year, month, 0);
    const startDate = `${firstChargeMonth.getFullYear()}-${String(firstChargeMonth.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = `${lastChargeMonth.getFullYear()}-${String(lastChargeMonth.getMonth() + 1).padStart(2, '0')}-${String(lastChargeMonth.getDate()).padStart(2, '0')}`;
    const existingCharges = await this.cardTransactionRepository.find({
      where: {
        workspaceId,
        subscriptionId: In(subscriptions.map(({ id }) => id)),
        subscriptionChargeDate: Between(startDate, endDate),
      },
    });
    const chargedOccurrences = new Set(
      existingCharges.map((charge) => `${charge.subscriptionId}:${charge.subscriptionChargeDate}`),
    );
    const projections: SubscriptionProjection[] = [];

    for (const subscription of subscriptions) {
      const nextDate = parseLocalDate(subscription.nextChargeDate);
      for (let monthOffset = -1; monthOffset <= 0; monthOffset++) {
        const occurrenceMonth = new Date(year, month - 1 + monthOffset, 1);
        const lastDay = new Date(
          occurrenceMonth.getFullYear(),
          occurrenceMonth.getMonth() + 1,
          0,
        ).getDate();
        const chargeDate = new Date(
          occurrenceMonth.getFullYear(),
          occurrenceMonth.getMonth(),
          Math.min(subscription.chargeDay, lastDay),
          12,
        );
        const chargeDateString = `${chargeDate.getFullYear()}-${String(chargeDate.getMonth() + 1).padStart(2, '0')}-${String(chargeDate.getDate()).padStart(2, '0')}`;
        if (
          chargeDate < nextDate ||
          calculateInvoicePeriod(chargeDate, subscription.creditCard.closingDay) !==
            `${year}-${String(month).padStart(2, '0')}` ||
          chargedOccurrences.has(`${subscription.id}:${chargeDateString}`)
        ) {
          continue;
        }
        projections.push({
          name: subscription.name,
          chargeDate: chargeDateString,
          amount: Number(subscription.amount),
        });
      }
    }
    return projections;
  }

  async cleanupProjections(
    workspaceId: string,
    startPeriod?: string,
    endPeriod?: string,
    includeManual?: boolean,
  ): Promise<number> {
    const whereCondition: any = {
      workspaceId,
      isProjected: true,
    };

    if (startPeriod && endPeriod) {
      whereCondition.competencyPeriod = Between(startPeriod, endPeriod);
    } else if (startPeriod) {
      whereCondition.competencyPeriod = MoreThanOrEqual(startPeriod);
    } else if (endPeriod) {
      whereCondition.competencyPeriod = LessThanOrEqual(endPeriod);
    }

    if (includeManual === false) {
      whereCondition.projectionSource = Not('manual');
    }

    const result = await this.transactionsRepository.delete(whereCondition);

    this.logger.log(`Cleaned up ${result.affected} projected transactions`);
    return result.affected || 0;
  }

  private mapToResponseDto(transaction: Transaction): TransactionResponseDto {
    return TransactionResponseDto.fromEntity(transaction);
  }

  private async getCardExpensesByCompetencyMonth(
    workspaceId: string,
    year: number,
    month: number,
  ): Promise<number> {
    const competencyPeriod = `${year}-${String(month).padStart(2, '0')}`;
    const result = await this.cardTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.workspaceId = :workspaceId', { workspaceId })
      .andWhere(
        '((transaction.subscriptionId IS NOT NULL AND transaction.invoicePeriod = :competencyPeriod) OR (transaction.subscriptionId IS NULL AND transaction.competencyPeriod = :competencyPeriod))',
        { competencyPeriod },
      )
      .getRawOne();

    return Number(result?.total || 0);
  }
}
