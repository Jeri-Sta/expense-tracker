import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, Matches } from 'class-validator';

export class PreviewNubankImportDto {
  @ApiProperty({ description: 'Credit card id', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  creditCardId: string;

  @ApiProperty({ description: 'Invoice period (YYYY-MM)', example: '2026-12' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'invoicePeriod must use YYYY-MM format' })
  invoicePeriod: string;
}
