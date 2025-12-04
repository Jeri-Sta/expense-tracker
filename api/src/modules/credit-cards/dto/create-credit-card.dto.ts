import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsHexColor,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCreditCardDto {
  @ApiProperty({
    description: 'Credit card name/identifier',
    example: 'Nubank',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Card color (hex format)',
    example: '#8B5CF6',
    default: '#3B82F6',
  })
  @IsHexColor()
  @IsOptional()
  color?: string = '#3B82F6';

  @ApiProperty({
    description: 'Invoice closing day (1-31)',
    example: 15,
  })
  @IsNumber()
  @Min(1)
  @Max(31)
  closingDay: number;

  @ApiProperty({
    description: 'Invoice due day (1-31)',
    example: 22,
  })
  @IsNumber()
  @Min(1)
  @Max(31)
  dueDay: number;

  @ApiProperty({
    description: 'Total credit limit',
    example: 5000.0,
  })
  @IsNumber()
  @Min(0)
  totalLimit: number;
}
