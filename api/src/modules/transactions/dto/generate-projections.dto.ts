import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateProjectionsDto {
  @ApiProperty({
    description: 'Start period for projections (YYYY-MM format)',
    example: '2024-12',
  })
  @IsString()
  @IsNotEmpty()
  startPeriod: string;

  @ApiProperty({
    description: 'End period for projections (YYYY-MM format)',
    example: '2025-03',
  })
  @IsString()
  @IsNotEmpty()
  endPeriod: string;

  @ApiProperty({
    description: 'Override existing projections',
    required: false,
    default: false,
  })
  @IsOptional()
  overrideExisting?: boolean;

  @ApiProperty({
    description: 'Default confidence score for generated projections',
    required: false,
    default: 80,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultConfidence?: number;
}
