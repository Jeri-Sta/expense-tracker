import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateInstallmentPlanDto {
  @ApiProperty({
    example: 'Financiamento do Carro - Atualizado',
    description: 'Nome do plano de financiamento',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Financiamento do veículo popular - atualizado',
    description: 'Descrição do financiamento',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: { bank: 'Banco do Brasil', contract: '123456', updated: true },
    description: 'Metadados adicionais',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    example: false,
    description: 'Status do plano (ativo/inativo)',
    required: false,
  })
  @IsOptional()
  isActive?: boolean;
}