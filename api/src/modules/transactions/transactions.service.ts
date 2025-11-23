import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsFilterDto } from './dto/transactions-filter.dto';
import { ProjectionFiltersDto } from './dto/projection-filters.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    // Validate competency period format
    if (!this.isValidCompetencyPeriod(createTransactionDto.competencyPeriod)) {
      throw new Error('Competency period must be in YYYY-MM format');
    }

    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      userId,
      transactionDate: new Date(createTransactionDto.transactionDate),
    });

    const savedTransaction = await this.transactionsRepository.save(transaction);
    return this.mapToResponseDto(await this.findOneWithRelations(savedTransaction.id));
  }

  async findAll(userId: string, filterDto: TransactionsFilterDto | ProjectionFiltersDto): Promise<PaginatedResult<TransactionResponseDto>> {
    const queryBuilder = this.createFilteredQuery(userId, filterDto);
    
    // Add pagination
    const offset = (filterDto.page - 1) * filterDto.limit;
    queryBuilder.offset(offset).limit(filterDto.limit);

    // Add sorting
    queryBuilder.orderBy(`transaction.${filterDto.sortBy}`, filterDto.sortOrder);

    const [transactions, total] = await queryBuilder.getManyAndCount();
    
    return {
      data: transactions.map(transaction => this.mapToResponseDto(transaction)),
      total,
      page: filterDto.page,
      limit: filterDto.limit,
      totalPages: Math.ceil(total / filterDto.limit),
    };
  }

  async findOne(id: string, userId: string): Promise<TransactionResponseDto> {
    const transaction = await this.findOneWithRelations(id);
    
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('You can only access your own transactions');
    }

    return this.mapToResponseDto(transaction);
  }

  async update(id: string, userId: string, updateTransactionDto: UpdateTransactionDto): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('You can only update your own transactions');
    }

    // Validate competency period if provided
    if (updateTransactionDto.competencyPeriod && !this.isValidCompetencyPeriod(updateTransactionDto.competencyPeriod)) {
      throw new Error('Competency period must be in YYYY-MM format');
    }

    Object.assign(transaction, updateTransactionDto);
    
    if (updateTransactionDto.transactionDate) {
      transaction.transactionDate = new Date(updateTransactionDto.transactionDate);
    }

    const savedTransaction = await this.transactionsRepository.save(transaction);
    return this.mapToResponseDto(await this.findOneWithRelations(savedTransaction.id));
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('You can only delete your own transactions');
    }

    await this.transactionsRepository.softDelete(id);
  }

  async getMonthlyStats(userId: string, year: number, month: number): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
  }> {
    const competencyPeriod = `${year}-${month.toString().padStart(2, '0')}`;
    
    const [incomeResult, expensesResult, countResult] = await Promise.all([
      this.transactionsRepository
        .createQueryBuilder('transaction')
        .select('COALESCE(SUM(transaction.amount), 0)', 'total')
        .where('transaction.userId = :userId', { userId })
        .andWhere('transaction.competencyPeriod = :competencyPeriod', { competencyPeriod })
        .andWhere('transaction.type = :type', { type: 'income' })
        .getRawOne(),
      
      this.transactionsRepository
        .createQueryBuilder('transaction')
        .select('COALESCE(SUM(transaction.amount), 0)', 'total')
        .where('transaction.userId = :userId', { userId })
        .andWhere('transaction.competencyPeriod = :competencyPeriod', { competencyPeriod })
        .andWhere('transaction.type = :type', { type: 'expense' })
        .getRawOne(),
      
      this.transactionsRepository
        .createQueryBuilder('transaction')
        .select('COUNT(transaction.id)', 'count')
        .where('transaction.userId = :userId', { userId })
        .andWhere('transaction.competencyPeriod = :competencyPeriod', { competencyPeriod })
        .getRawOne(),
    ]);

    const totalIncome = Number.parseFloat(incomeResult.total) || 0;
    const totalExpenses = Number.parseFloat(expensesResult.total) || 0;
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: Number.parseInt(countResult.count) || 0,
    };
  }

  private async findOneWithRelations(id: string): Promise<Transaction | null> {
    return this.transactionsRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  private createFilteredQuery(userId: string, filterDto: TransactionsFilterDto | ProjectionFiltersDto): SelectQueryBuilder<Transaction> {
    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId });

    if (filterDto.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filterDto.type });
    }

    if (filterDto.categoryId) {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', { categoryId: filterDto.categoryId });
    }

    if (filterDto.startDate) {
      queryBuilder.andWhere('transaction.transactionDate >= :startDate', { startDate: filterDto.startDate });
    }

    if (filterDto.endDate) {
      queryBuilder.andWhere('transaction.transactionDate <= :endDate', { endDate: filterDto.endDate });
    }

    if (filterDto.competencyPeriod) {
      queryBuilder.andWhere('transaction.competencyPeriod = :competencyPeriod', { competencyPeriod: filterDto.competencyPeriod });
    }

    if (filterDto.search) {
      queryBuilder.andWhere('transaction.description ILIKE :search', { search: `%${filterDto.search}%` });
    }

    // Projection filters - check if this is a ProjectionFiltersDto
    if ('includeProjections' in filterDto) {
      if (filterDto.onlyProjections === true) {
        queryBuilder.andWhere('transaction.isProjected = :isProjected', { isProjected: true });
      } else if (filterDto.includeProjections === false) {
        queryBuilder.andWhere('transaction.isProjected = :isProjected', { isProjected: false });
      }
      // If includeProjections is true or undefined, show both

      if (filterDto.minConfidence !== undefined) {
        queryBuilder.andWhere('(transaction.confidenceScore >= :minConfidence OR transaction.isProjected = false)', 
          { minConfidence: filterDto.minConfidence });
      }

      if (filterDto.projectionSource) {
        queryBuilder.andWhere('transaction.projectionSource = :projectionSource', 
          { projectionSource: filterDto.projectionSource });
      }
    }

    return queryBuilder;
  }

  async getYearlyMonthlyStats(userId: string, year: number) {
    const stats = [];
    
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const result = await this.transactionsRepository
        .createQueryBuilder('transaction')
        .select([
          'SUM(CASE WHEN transaction.type = \'income\' THEN transaction.amount ELSE 0 END) as totalIncome',
          'SUM(CASE WHEN transaction.type = \'expense\' THEN transaction.amount ELSE 0 END) as totalExpenses',
          'COUNT(*) as transactionCount'
        ])
        .where('transaction.userId = :userId', { userId })
        .andWhere('transaction.transactionDate >= :startDate', { startDate })
        .andWhere('transaction.transactionDate <= :endDate', { endDate })
        .getRawOne();

      stats.push({
        period: `${year}-${month.toString().padStart(2, '0')}`,
        totalIncome: Number.parseFloat(result.totalIncome) || 0,
        totalExpenses: Number.parseFloat(result.totalExpenses) || 0,
        balance: (Number.parseFloat(result.totalIncome) || 0) - (Number.parseFloat(result.totalExpenses) || 0),
        transactionCount: Number.parseInt(result.transactionCount) || 0
      });
    }
    
    return stats;
  }

  private mapToResponseDto(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type,
      transactionDate: transaction.transactionDate,
      competencyPeriod: transaction.competencyPeriod,
      notes: transaction.notes,
      metadata: transaction.metadata,
      isRecurring: transaction.isRecurring,
      isProjected: transaction.isProjected ?? false,
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

  private isValidCompetencyPeriod(period: string): boolean {
    const regex = /^\d{4}-\d{2}$/;
    return regex.test(period);
  }
}