import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'Streaming service' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ example: 29.9, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 28, minimum: 1, maximum: 31 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  @Max(31)
  chargeDay: number;

  @ApiProperty({ description: 'Start date (YYYY-MM-DD)', example: '2026-10-18' })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  startDate: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  creditCardId: string;
}
