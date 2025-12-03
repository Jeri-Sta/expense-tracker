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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CardTransactionsService } from './card-transactions.service';
import { CreateCardTransactionDto } from './dto/create-card-transaction.dto';
import { UpdateCardTransactionDto } from './dto/update-card-transaction.dto';
import { CardTransactionResponseDto } from './dto/card-transaction-response.dto';
import { CardTransactionFilterDto, PaginatedCardTransactionsResponse } from './dto/card-transaction-filter.dto';
import { InvoiceResponseDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Card Transactions')
@Controller('card-transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CardTransactionsController {
  constructor(private readonly cardTransactionsService: CardTransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new card transaction' })
  @ApiResponse({
    status: 201,
    description: 'Card transaction created successfully',
    type: CardTransactionResponseDto,
  })
  create(
    @GetUser() user: User,
    @Body() createDto: CreateCardTransactionDto,
  ): Promise<CardTransactionResponseDto> {
    return this.cardTransactionsService.create(user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all card transactions with pagination and sorting' })
  @ApiResponse({
    status: 200,
    description: 'Card transactions retrieved successfully',
  })
  findAll(
    @GetUser() user: User,
    @Query() filterDto: CardTransactionFilterDto,
  ): Promise<PaginatedCardTransactionsResponse> {
    return this.cardTransactionsService.findAllPaginated(user.id, filterDto);
  }

  @Get('by-due-month/:year/:month')
  @ApiOperation({ summary: 'Get card transactions by invoice due month' })
  @ApiResponse({
    status: 200,
    description: 'Card transactions retrieved successfully by due month',
    type: [CardTransactionResponseDto],
  })
  @ApiQuery({ name: 'creditCardId', required: false, description: 'Filter by credit card ID' })
  findByDueMonth(
    @GetUser() user: User,
    @Param('year') year: string,
    @Param('month') month: string,
    @Query('creditCardId') creditCardId?: string,
  ): Promise<CardTransactionResponseDto[]> {
    return this.cardTransactionsService.findByDueMonth(
      user.id,
      Number.parseInt(year, 10),
      Number.parseInt(month, 10),
      creditCardId,
    );
  }

  @Get('installments/pending')
  @ApiOperation({ summary: 'Get pending installment transactions' })
  @ApiResponse({
    status: 200,
    description: 'Pending installments retrieved successfully',
    type: [CardTransactionResponseDto],
  })
  @ApiQuery({ name: 'period', required: false, description: 'Starting period (YYYY-MM)' })
  getPendingInstallments(
    @GetUser() user: User,
    @Query('period') period?: string,
  ): Promise<CardTransactionResponseDto[]> {
    return this.cardTransactionsService.getPendingInstallments(user.id, period);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get card transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Card transaction retrieved successfully',
    type: CardTransactionResponseDto,
  })
  findOne(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CardTransactionResponseDto> {
    return this.cardTransactionsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update card transaction' })
  @ApiResponse({
    status: 200,
    description: 'Card transaction updated successfully',
    type: CardTransactionResponseDto,
  })
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCardTransactionDto,
  ): Promise<CardTransactionResponseDto> {
    return this.cardTransactionsService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete card transaction' })
  @ApiResponse({
    status: 200,
    description: 'Card transaction deleted successfully',
  })
  remove(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.cardTransactionsService.remove(id, user.id);
  }

  // Invoice endpoints
  @Get('invoices/all')
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
    type: [InvoiceResponseDto],
  })
  @ApiQuery({ name: 'creditCardId', required: false, description: 'Filter by credit card ID' })
  getInvoices(
    @GetUser() user: User,
    @Query('creditCardId') creditCardId?: string,
  ): Promise<InvoiceResponseDto[]> {
    return this.cardTransactionsService.getInvoices(user.id, creditCardId);
  }

  @Get('invoices/by-due-month/:year/:month')
  @ApiOperation({ summary: 'Get invoices by invoice due month' })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully by due month',
    type: [InvoiceResponseDto],
  })
  @ApiQuery({ name: 'creditCardId', required: false, description: 'Filter by credit card ID' })
  getInvoicesByDueMonth(
    @GetUser() user: User,
    @Param('year') year: string,
    @Param('month') month: string,
    @Query('creditCardId') creditCardId?: string,
  ): Promise<InvoiceResponseDto[]> {
    return this.cardTransactionsService.getInvoicesByDueMonth(
      user.id,
      Number.parseInt(year, 10),
      Number.parseInt(month, 10),
      creditCardId,
    );
  }

  @Get('invoices/:creditCardId/:period')
  @ApiOperation({ summary: 'Get invoice by credit card and period' })
  @ApiResponse({
    status: 200,
    description: 'Invoice retrieved successfully',
    type: InvoiceResponseDto,
  })
  getInvoice(
    @GetUser() user: User,
    @Param('creditCardId', ParseUUIDPipe) creditCardId: string,
    @Param('period') period: string,
  ): Promise<InvoiceResponseDto> {
    return this.cardTransactionsService.getInvoice(creditCardId, period, user.id);
  }

  @Patch('invoices/:creditCardId/:period/status')
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({
    status: 200,
    description: 'Invoice status updated successfully',
    type: InvoiceResponseDto,
  })
  updateInvoiceStatus(
    @GetUser() user: User,
    @Param('creditCardId', ParseUUIDPipe) creditCardId: string,
    @Param('period') period: string,
    @Body() updateDto: UpdateInvoiceStatusDto,
  ): Promise<InvoiceResponseDto> {
    return this.cardTransactionsService.updateInvoiceStatus(creditCardId, period, user.id, updateDto);
  }
}
