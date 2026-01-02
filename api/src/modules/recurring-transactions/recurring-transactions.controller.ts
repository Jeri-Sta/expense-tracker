import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { RecurringTransactionResponseDto } from './dto/recurring-transaction-response.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Recurring Transactions')
@Controller('recurring-transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RecurringTransactionsController {
  constructor(private readonly recurringTransactionsService: RecurringTransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recurring transaction' })
  @ApiResponse({
    status: 201,
    description: 'Recurring transaction created successfully',
    type: RecurringTransactionResponseDto,
  })
  create(
    @GetUser() user: User,
    @Body() createRecurringTransactionDto: CreateRecurringTransactionDto,
  ): Promise<RecurringTransactionResponseDto> {
    return this.recurringTransactionsService.create(user.id, createRecurringTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recurring transactions' })
  @ApiResponse({
    status: 200,
    description: 'Recurring transactions retrieved successfully',
    type: [RecurringTransactionResponseDto],
  })
  findAll(@GetUser() user: User): Promise<RecurringTransactionResponseDto[]> {
    return this.recurringTransactionsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recurring transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Recurring transaction retrieved successfully',
    type: RecurringTransactionResponseDto,
  })
  findOne(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RecurringTransactionResponseDto> {
    return this.recurringTransactionsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update recurring transaction' })
  @ApiResponse({
    status: 200,
    description: 'Recurring transaction updated successfully',
    type: RecurringTransactionResponseDto,
  })
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecurringTransactionDto: UpdateRecurringTransactionDto,
  ): Promise<RecurringTransactionResponseDto> {
    return this.recurringTransactionsService.update(id, user.id, updateRecurringTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete recurring transaction' })
  @ApiResponse({
    status: 200,
    description: 'Recurring transaction deleted successfully',
  })
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.recurringTransactionsService.remove(id, user.id);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute recurring transaction manually' })
  @ApiResponse({
    status: 200,
    description: 'Recurring transaction executed successfully',
  })
  execute(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.recurringTransactionsService.execute(id, user.id);
  }

  @Post(':id/skip')
  @ApiOperation({ summary: 'Skip next occurrence of recurring transaction' })
  @ApiResponse({
    status: 200,
    description: 'Recurring transaction skipped successfully',
  })
  skip(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.recurringTransactionsService.skip(id, user.id);
  }
}
