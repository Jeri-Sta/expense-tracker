import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringTransaction } from './entities/recurring-transaction.entity';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { RecurringTransactionResponseDto } from './dto/recurring-transaction-response.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { CategoriesService } from '../categories/categories.service';
import { RecurrenceFrequency } from '../../common/enums';

@Injectable()
export class RecurringTransactionsService {
  constructor(
    @InjectRepository(RecurringTransaction)
    private readonly recurringTransactionsRepository: Repository<RecurringTransaction>,
    private readonly transactionsService: TransactionsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    userId: string,
    createRecurringTransactionDto: CreateRecurringTransactionDto,
  ): Promise<RecurringTransactionResponseDto> {
    // Verify category belongs to user
    await this.categoriesService.findOne(createRecurringTransactionDto.categoryId, userId);

    const recurringTransaction = this.recurringTransactionsRepository.create({
      ...createRecurringTransactionDto,
      userId,
      executionCount: 0,
      isCompleted: false,
    });

    const savedRecurringTransaction = await this.recurringTransactionsRepository.save(recurringTransaction);
    return this.findOne(savedRecurringTransaction.id, userId);
  }

  async findAll(userId: string): Promise<RecurringTransactionResponseDto[]> {
    const recurringTransactions = await this.recurringTransactionsRepository.find({
      where: { userId },
      relations: ['category'],
      order: {
        nextExecution: 'ASC',
        createdAt: 'DESC',
      },
    });

    return recurringTransactions.map(this.mapToResponseDto);
  }

  async findOne(id: string, userId: string): Promise<RecurringTransactionResponseDto> {
    const recurringTransaction = await this.recurringTransactionsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction not found');
    }

    if (recurringTransaction.userId !== userId) {
      throw new ForbiddenException('You can only access your own recurring transactions');
    }

    return this.mapToResponseDto(recurringTransaction);
  }

  async update(
    id: string,
    userId: string,
    updateRecurringTransactionDto: UpdateRecurringTransactionDto,
  ): Promise<RecurringTransactionResponseDto> {
    const recurringTransaction = await this.recurringTransactionsRepository.findOne({
      where: { id, userId },
    });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction not found');
    }

    // Verify category belongs to user if categoryId is being updated
    if (updateRecurringTransactionDto.categoryId) {
      await this.categoriesService.findOne(updateRecurringTransactionDto.categoryId, userId);
    }

    Object.assign(recurringTransaction, updateRecurringTransactionDto);
    await this.recurringTransactionsRepository.save(recurringTransaction);

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const recurringTransaction = await this.recurringTransactionsRepository.findOne({
      where: { id, userId },
    });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction not found');
    }

    await this.recurringTransactionsRepository.delete(id);
  }

  async execute(id: string, userId: string): Promise<void> {
    const recurringTransaction = await this.recurringTransactionsRepository.findOne({
      where: { id, userId },
      relations: ['category'],
    });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction not found');
    }

    if (!recurringTransaction.isActive) {
      throw new ForbiddenException('Recurring transaction is not active');
    }

    if (recurringTransaction.isCompleted) {
      throw new ForbiddenException('Recurring transaction is already completed');
    }

    // Create the actual transaction
    await this.transactionsService.create(userId, {
      description: `${recurringTransaction.description} (Recurring)`,
      amount: recurringTransaction.amount,
      type: recurringTransaction.type,
      categoryId: recurringTransaction.categoryId,
      transactionDate: new Date().toISOString().split('T')[0],
      competencyPeriod: new Date().toISOString().slice(0, 7),
      notes: `Auto-generated from recurring transaction: ${recurringTransaction.id}`,
      metadata: {
        ...recurringTransaction.metadata,
        recurringTransactionId: recurringTransaction.id,
        isAutoGenerated: true,
      },
    });

    // Update recurring transaction
    const newExecutionCount = recurringTransaction.executionCount + 1;
    const nextExecution = this.calculateNextExecution(
      recurringTransaction.nextExecution,
      recurringTransaction.frequency,
      recurringTransaction.interval,
    );

    const isCompleted = this.isRecurringCompleted(
      newExecutionCount,
      recurringTransaction.maxExecutions,
      nextExecution,
      recurringTransaction.endDate,
    );

    await this.recurringTransactionsRepository.update(id, {
      executionCount: newExecutionCount,
      lastExecutedAt: new Date(),
      nextExecution: isCompleted ? null : nextExecution,
      isCompleted,
      isActive: isCompleted ? false : recurringTransaction.isActive,
    });
  }

  async findDueRecurringTransactions(): Promise<RecurringTransaction[]> {
    const now = new Date();
    return this.recurringTransactionsRepository.find({
      where: {
        isActive: true,
        isCompleted: false,
      },
      relations: ['category'],
    }).then(transactions => 
      transactions.filter(t => 
        t.nextExecution && t.nextExecution <= now
      )
    );
  }

  private calculateNextExecution(
    currentExecution: Date,
    frequency: RecurrenceFrequency,
    interval: number,
  ): Date {
    const next = new Date(currentExecution);

    switch (frequency) {
      case RecurrenceFrequency.DAILY:
        next.setDate(next.getDate() + interval);
        break;
      case RecurrenceFrequency.WEEKLY:
        next.setDate(next.getDate() + (interval * 7));
        break;
      case RecurrenceFrequency.MONTHLY:
        next.setMonth(next.getMonth() + interval);
        break;
      case RecurrenceFrequency.QUARTERLY:
        next.setMonth(next.getMonth() + (interval * 3));
        break;
      case RecurrenceFrequency.YEARLY:
        next.setFullYear(next.getFullYear() + interval);
        break;
    }

    return next;
  }

  private isRecurringCompleted(
    executionCount: number,
    maxExecutions?: number,
    nextExecution?: Date,
    endDate?: Date,
  ): boolean {
    if (maxExecutions && executionCount >= maxExecutions) {
      return true;
    }

    if (endDate && nextExecution && nextExecution > endDate) {
      return true;
    }

    return false;
  }

  private mapToResponseDto(recurringTransaction: RecurringTransaction): RecurringTransactionResponseDto {
    return {
      id: recurringTransaction.id,
      description: recurringTransaction.description,
      amount: recurringTransaction.amount,
      type: recurringTransaction.type,
      category: {
        id: recurringTransaction.category.id,
        name: recurringTransaction.category.name,
        description: recurringTransaction.category.description,
        type: recurringTransaction.category.type,
        color: recurringTransaction.category.color,
        icon: recurringTransaction.category.icon,
        isActive: recurringTransaction.category.isActive,
        sortOrder: recurringTransaction.category.sortOrder,
        createdAt: recurringTransaction.category.createdAt,
        updatedAt: recurringTransaction.category.updatedAt,
      },
      frequency: recurringTransaction.frequency,
      interval: recurringTransaction.interval,
      nextExecution: recurringTransaction.nextExecution,
      endDate: recurringTransaction.endDate,
      maxExecutions: recurringTransaction.maxExecutions,
      executionCount: recurringTransaction.executionCount,
      isActive: recurringTransaction.isActive,
      isCompleted: recurringTransaction.isCompleted,
      notes: recurringTransaction.notes,
      metadata: recurringTransaction.metadata,
      createdAt: recurringTransaction.createdAt,
      updatedAt: recurringTransaction.updatedAt,
    };
  }
}