import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { TransactionsService, PaginatedResult } from './transactions.service';
import { ProjectionsService, ProjectionResult } from './projections.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsFilterDto } from './dto/transactions-filter.dto';
import { ProjectionFiltersDto } from './dto/projection-filters.dto';
import { GenerateProjectionsDto } from './dto/generate-projections.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly projectionsService: ProjectionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: TransactionResponseDto,
  })
  create(
    @GetUser() user: User,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.create(user.id, createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by transaction type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' })
  @ApiQuery({
    name: 'competencyPeriod',
    required: false,
    description: 'Filter by competency period (YYYY-MM)',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search in description' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC/DESC)' })
  @ApiQuery({
    name: 'paymentStatus',
    required: false,
    description: 'Filter by payment status (pending/paid)',
  })
  findAll(
    @GetUser() user: User,
    @Query() filterDto: TransactionsFilterDto,
  ): Promise<PaginatedResult<TransactionResponseDto>> {
    return this.transactionsService.findAll(user.id, filterDto);
  }

  @Get('stats/monthly')
  @ApiOperation({ summary: 'Get monthly statistics for a year' })
  @ApiResponse({
    status: 200,
    description: 'Monthly statistics retrieved successfully',
  })
  @ApiQuery({ name: 'year', required: false, description: 'Year for statistics' })
  getYearlyMonthlyStats(@GetUser() user: User, @Query('year') year?: string) {
    const targetYear = year ? Number.parseInt(year, 10) : new Date().getFullYear();
    return this.transactionsService.getYearlyMonthlyStats(user.id, targetYear);
  }

  @Get('stats/monthly/:year/:month')
  @ApiOperation({ summary: 'Get monthly statistics' })
  @ApiResponse({
    status: 200,
    description: 'Monthly statistics retrieved successfully',
  })
  getMonthlyStats(
    @GetUser() user: User,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.transactionsService.getMonthlyStats(
      user.id,
      Number.parseInt(year, 10),
      Number.parseInt(month, 10),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    type: TransactionResponseDto,
  })
  findOne(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    type: TransactionResponseDto,
  })
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.update(id, user.id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted successfully',
  })
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.transactionsService.remove(id, user.id);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Mark transaction as paid' })
  @ApiResponse({
    status: 200,
    description: 'Transaction marked as paid successfully',
    type: TransactionResponseDto,
  })
  markAsPaid(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { paidDate?: string },
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.markAsPaid(id, user.id, body?.paidDate);
  }

  // Projection endpoints
  @Post('projections/generate')
  @ApiOperation({ summary: 'Generate projections from recurring transactions' })
  @ApiResponse({
    status: 201,
    description: 'Projections generated successfully',
  })
  generateProjections(
    @GetUser() user: User,
    @Body() generateDto: GenerateProjectionsDto,
  ): Promise<ProjectionResult> {
    return this.projectionsService.generateRecurringProjections(user.id, generateDto);
  }

  @Get('projections/monthly/:year/:month')
  @ApiOperation({ summary: 'Get monthly projections' })
  @ApiResponse({
    status: 200,
    description: 'Monthly projections retrieved successfully',
  })
  getMonthlyProjections(
    @GetUser() user: User,
    @Param('year') year: string,
    @Param('month') month: string,
  ): Promise<TransactionResponseDto[]> {
    return this.projectionsService.getMonthlyProjections(
      user.id,
      Number.parseInt(year, 10),
      Number.parseInt(month, 10),
    );
  }

  @Get('projections/stats/:year')
  @ApiOperation({ summary: 'Get yearly stats with projections' })
  @ApiResponse({
    status: 200,
    description: 'Yearly stats with projections retrieved successfully',
  })
  @ApiQuery({ name: 'month', required: false, description: 'Specific month (1-12)' })
  getStatsWithProjections(
    @GetUser() user: User,
    @Param('year') year: string,
    @Query('month') month?: string,
  ) {
    const targetMonth = month ? Number.parseInt(month, 10) : undefined;
    return this.projectionsService.getMonthlyStatsWithProjections(
      user.id,
      Number.parseInt(year, 10),
      targetMonth,
    );
  }

  @Delete('projections/cleanup')
  @ApiOperation({ summary: 'Clean up projections' })
  @ApiResponse({
    status: 200,
    description: 'Projections cleaned up successfully',
  })
  @ApiQuery({ name: 'startPeriod', required: false, description: 'Start period (YYYY-MM)' })
  @ApiQuery({ name: 'endPeriod', required: false, description: 'End period (YYYY-MM)' })
  cleanupProjections(
    @GetUser() user: User,
    @Query('startPeriod') startPeriod?: string,
    @Query('endPeriod') endPeriod?: string,
  ): Promise<{ deleted: number }> {
    return this.projectionsService
      .cleanupProjections(user.id, startPeriod, endPeriod)
      .then((deleted) => ({ deleted }));
  }

  @Get('projections/filter')
  @ApiOperation({ summary: 'Get transactions with projection filtering' })
  @ApiResponse({
    status: 200,
    description: 'Filtered transactions retrieved successfully',
  })
  @ApiQuery({
    name: 'includeProjections',
    required: false,
    description: 'Include projected transactions',
  })
  @ApiQuery({
    name: 'onlyProjections',
    required: false,
    description: 'Only projected transactions',
  })
  @ApiQuery({ name: 'minConfidence', required: false, description: 'Minimum confidence score' })
  findWithProjectionFilters(
    @GetUser() user: User,
    @Query() filterDto: ProjectionFiltersDto,
  ): Promise<PaginatedResult<TransactionResponseDto>> {
    return this.transactionsService.findAll(user.id, filterDto);
  }
}
