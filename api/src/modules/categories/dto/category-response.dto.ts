import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../../../common/enums';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ enum: CategoryType })
  type: CategoryType;

  @ApiProperty()
  color: string;

  @ApiProperty()
  icon?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ description: 'Number of transactions using this category' })
  transactionCount?: number;
}