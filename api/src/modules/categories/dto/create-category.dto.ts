import { IsNotEmpty, IsEnum, IsString, IsOptional, IsHexColor, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../../../common/enums';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Alimentação',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Category description',
    required: false,
    example: 'Gastos com supermercado e restaurantes',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @ApiProperty({
    enum: CategoryType,
    description: 'Category type',
  })
  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;

  @ApiProperty({
    description: 'Category color (hex format)',
    example: '#3B82F6',
    default: '#6B7280',
  })
  @IsHexColor()
  @IsOptional()
  color?: string = '#6B7280';

  @ApiProperty({
    description: 'PrimeNG icon name',
    required: false,
    example: 'pi-shopping-cart',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;
}
