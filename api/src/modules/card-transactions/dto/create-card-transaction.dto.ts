import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsUUID, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCardTransactionDto {
  @ApiProperty({
    description: 'Transaction description',
    example: 'Compra na Amazon',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: 199.99,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Transaction date (YYYY-MM-DD)',
    example: '2025-11-15',
  })
  @IsDateString()
  transactionDate: string;

  @ApiProperty({
    description: 'Credit card ID',
  })
  @IsUUID()
  @IsNotEmpty()
  creditCardId: string;

  @ApiProperty({
    description: 'Category ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: 'Is this an installment purchase?',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isInstallment?: boolean = false;

  @ApiProperty({
    description: 'Total number of installments (required if isInstallment is true)',
    example: 12,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(2)
  @Max(48)
  totalInstallments?: number;
}
