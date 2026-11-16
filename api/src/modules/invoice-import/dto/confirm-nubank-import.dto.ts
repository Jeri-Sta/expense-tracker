import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
  Matches,
} from 'class-validator';

export class ConfirmNubankImportRowDto {
  @ApiProperty({ description: 'Index returned by the preview endpoint', example: 0 })
  @IsInt()
  @Min(0)
  rowIndex: number;

  @ApiProperty({ description: 'Transaction date (YYYY-MM-DD)', example: '2026-11-16' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Original title from the CSV', example: 'Mercadolivre*Infinity' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Amount in BRL', example: 89.49 })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Occurrence index for identical rows (returned by the preview)',
    example: 0,
  })
  @IsInt()
  @Min(0)
  occurrence: number;

  @ApiProperty({ description: 'Description to store', example: 'Mercadolivre*Infinity' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @ApiProperty({ description: 'Category to assign', required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @ApiProperty({ description: 'Whether this row should be imported' })
  @IsBoolean()
  include: boolean;
}

export class ConfirmNubankImportDto {
  @ApiProperty({ description: 'Credit card id', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  creditCardId: string;

  @ApiProperty({ description: 'Invoice period (YYYY-MM)', example: '2026-12' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'invoicePeriod must use YYYY-MM format' })
  invoicePeriod: string;

  @ApiProperty({ type: [ConfirmNubankImportRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmNubankImportRowDto)
  rows: ConfirmNubankImportRowDto[];
}
