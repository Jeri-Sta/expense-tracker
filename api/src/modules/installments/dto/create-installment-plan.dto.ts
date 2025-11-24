import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDate, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInstallmentPlanDto {
  @ApiProperty({
    example: 'Financiamento do Carro',
    description: 'Nome do plano de financiamento',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 50000,
    description: 'Valor total financiado',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  financedAmount: number;

  @ApiProperty({
    example: 1200,
    description: 'Valor de cada parcela',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  installmentValue: number;

  @ApiProperty({
    example: 48,
    description: 'Número total de parcelas',
  })
  @IsNumber()
  @Min(1)
  totalInstallments: number;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Data de início do financiamento',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    example: 2.5,
    description: 'Taxa de juros mensal (percentual)',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  interestRate?: number;

  @ApiProperty({
    example: 'Financiamento do veículo popular',
    description: 'Descrição opcional do financiamento',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: { bank: 'Banco do Brasil', contract: '123456' },
    description: 'Metadados adicionais',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}