import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../../common/enums';

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty()
  transactionDate: Date;

  @ApiProperty()
  competencyPeriod: string;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  metadata?: Record<string, any>;

  @ApiProperty()
  isRecurring: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  category?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
}