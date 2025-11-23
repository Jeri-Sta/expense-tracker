import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateRecurringTransactionDto } from './create-recurring-transaction.dto';
import {
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRecurringTransactionDto extends PartialType(CreateRecurringTransactionDto) {
  @ApiPropertyOptional({ description: 'Number of times already executed', example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  @Type(() => Number)
  readonly executionCount?: number;
}