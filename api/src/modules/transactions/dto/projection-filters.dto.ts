import { IsOptional, IsBoolean, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionsFilterDto } from './transactions-filter.dto';

export class ProjectionFiltersDto extends TransactionsFilterDto {
  @ApiProperty({
    description: 'Include projected transactions in results',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeProjections?: boolean;

  @ApiProperty({
    description: 'Show only projected transactions',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  onlyProjections?: boolean;

  @ApiProperty({
    description: 'Filter by projection source',
    enum: ['recurring', 'manual', 'ai'],
    required: false,
  })
  @IsOptional()
  @IsString()
  projectionSource?: string;

  @ApiProperty({
    description: 'Minimum confidence score for projections (0-100)',
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  minConfidence?: number;
}
