import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, RecurrenceFrequency } from '../../../common/enums';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class RecurringTransactionResponseDto {
  @ApiProperty({ description: 'Recurring transaction ID' })
  readonly id: string;

  @ApiProperty({ description: 'Transaction description' })
  readonly description: string;

  @ApiProperty({ description: 'Transaction amount' })
  readonly amount: number;

  @ApiProperty({ enum: TransactionType, description: 'Transaction type' })
  readonly type: TransactionType;

  @ApiProperty({ type: CategoryResponseDto, description: 'Associated category' })
  readonly category: CategoryResponseDto;

  @ApiProperty({ enum: RecurrenceFrequency, description: 'Recurrence frequency' })
  readonly frequency: RecurrenceFrequency;

  @ApiProperty({ description: 'Recurrence interval' })
  readonly interval: number;

  @ApiProperty({ description: 'Next execution date', type: Date })
  readonly nextExecution: Date;

  @ApiPropertyOptional({ description: 'End date for recurrence', type: Date })
  readonly endDate?: Date;

  @ApiPropertyOptional({ description: 'Maximum number of executions' })
  readonly maxExecutions?: number;

  @ApiProperty({ description: 'Number of times executed' })
  readonly executionCount: number;

  @ApiProperty({ description: 'Whether the recurrence is active' })
  readonly isActive: boolean;

  @ApiProperty({ description: 'Whether the recurrence is completed' })
  readonly isCompleted: boolean;

  @ApiPropertyOptional({ description: 'Additional notes' })
  readonly notes?: string;

  @ApiPropertyOptional({ description: 'Additional metadata', type: 'object' })
  readonly metadata?: Record<string, any>;

  @ApiProperty({ description: 'Creation date', type: Date })
  readonly createdAt: Date;

  @ApiProperty({ description: 'Last update date', type: Date })
  readonly updatedAt: Date;
}
