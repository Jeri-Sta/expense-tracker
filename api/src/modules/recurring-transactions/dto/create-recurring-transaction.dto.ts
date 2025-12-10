import {
  IsString,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsISO8601,
  Min,
  Max,
  Length,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, RecurrenceFrequency } from '../../../common/enums';

export class CreateRecurringTransactionDto {
  @ApiProperty({ description: 'Transaction description', example: 'Monthly salary' })
  @IsString()
  @Length(1, 255)
  readonly description: string;

  @ApiProperty({ description: 'Transaction amount', example: 5000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  readonly amount: number;

  @ApiProperty({ enum: TransactionType, description: 'Transaction type' })
  @IsEnum(TransactionType)
  readonly type: TransactionType;

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  readonly categoryId: string;

  @ApiProperty({ enum: RecurrenceFrequency, description: 'Recurrence frequency' })
  @IsEnum(RecurrenceFrequency)
  readonly frequency: RecurrenceFrequency;

  @ApiProperty({
    description: 'Next execution date',
    type: String,
    example: '2025-12-02T00:38:41.995Z',
  })
  @IsISO8601()
  readonly nextExecution: string;

  @ApiPropertyOptional({
    description: 'Recurrence interval (e.g., every 2 weeks)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  readonly interval?: number = 1;

  @ApiPropertyOptional({
    description: 'End date for recurrence',
    type: String,
    example: '2025-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsISO8601()
  readonly endDate?: string;

  @ApiPropertyOptional({ description: 'Maximum number of executions', example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  readonly maxExecutions?: number;

  @ApiPropertyOptional({ description: 'Whether the recurrence is active', default: true })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Automatic monthly salary deposit',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  readonly notes?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, any>;
}
