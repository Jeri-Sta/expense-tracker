import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PayInstallmentDto {
  @ApiProperty({
    example: 1200,
    description: 'Valor efetivamente pago',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  paidAmount: number;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Data do pagamento',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paidDate?: Date;

  @ApiProperty({
    example: 'Pagamento antecipado com desconto',
    description: 'Observações sobre o pagamento',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: { paymentMethod: 'PIX', bank: 'Banco do Brasil' },
    description: 'Metadados do pagamento',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
