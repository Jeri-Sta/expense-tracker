import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { RecurringTransaction } from '../recurring-transactions/entities/recurring-transaction.entity';
import { GenerateProjectionsDto } from '../transactions/dto/generate-projections.dto';
import { TransactionResponseDto } from '../transactions/dto/transaction-response.dto';
import { RecurrenceFrequency } from '../../common/enums';

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
}

@Injectable()
export class ProjectionsService {
  private readonly logger = new Logger(ProjectionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(RecurringTransaction)
    private readonly recurringRepository: Repository<RecurringTransaction>,
  ) {}

  async generateRecurringProjections(
    userId: string,
    generateDto: GenerateProjectionsDto,
  ): Promise<ProjectionResult> {
    this.logger.log(`Generating projections for user ${userId} from ${generateDto.startPeriod} to ${generateDto.endPeriod}`);

    const startDate = new Date(`${generateDto.startPeriod}-01`);
    const endParts = generateDto.endPeriod.split('-');
    const endDate = new Date(parseInt(endParts[0]), parseInt(endParts[1]), 0); // Last day of month

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
    let currentDate = new Date(recurring.nextExecution || startDate);

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
        nextDate.setDate(nextDate.getDate() + (7 * (recurring.interval || 1)));
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

    // Real transactions
    const realTransactions = await this.transactionsRepository.find({
      where: {
        userId,
        competencyPeriod,
        isProjected: false,
      },
    });

    // Projected transactions
    const projectedTransactions = await this.transactionsRepository.find({
      where: {
        userId,
        competencyPeriod,
        isProjected: true,
      },
    });

    const realIncome = realTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const realExpenses = realTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const projectedIncome = projectedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const projectedExpenses = projectedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      period: competencyPeriod,
      totalIncome: realIncome,
      totalExpenses: realExpenses,
      balance: realIncome - realExpenses,
      projectedIncome,
      projectedExpenses,
      projectedBalance: projectedIncome - projectedExpenses,
      hasProjections: projectedTransactions.length > 0,
      transactionCount: realTransactions.length,
      projectedTransactionCount: projectedTransactions.length,
    };
  }

  async cleanupProjections(
    userId: string,
    startPeriod?: string,
    endPeriod?: string,
  ): Promise<number> {
    let whereCondition: any = {
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
      confidenceScore: transaction.confidenceScore ? Number(transaction.confidenceScore) : undefined,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      category: transaction.category ? {
        id: transaction.category.id,
        name: transaction.category.name,
        color: transaction.category.color,
        icon: transaction.category.icon,
      } : undefined,
    };
  }
}