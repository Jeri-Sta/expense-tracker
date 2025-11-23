import { IsNotEmpty, IsEnum, IsNumber, IsString, IsDateString, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../../common/enums';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction amount',
    example: 150.50
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a valid number with up to 2 decimal places' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Grocery shopping'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: TransactionType,
    description: 'Transaction type'
  })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @ApiProperty({
    description: 'Transaction date',
    example: '2023-11-23'
  })
  @IsDateString({}, { message: 'Transaction date must be a valid date' })
  @IsNotEmpty()
  transactionDate: string;

  @ApiProperty({
    description: 'Competency period (YYYY-MM format)',
    example: '2023-11'
  })
  @IsString()
  @IsNotEmpty()
  competencyPeriod: string;

  @ApiProperty({
    description: 'Category ID',
    required: false
  })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: 'Additional notes',
    required: false
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Additional metadata',
    required: false
  })
  @IsOptional()
  metadata?: Record<string, any>;
}