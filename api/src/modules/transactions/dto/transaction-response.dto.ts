import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, PaymentStatus } from '../../../common/enums';

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
  isProjected: boolean;

  @ApiProperty({ required: false })
  projectionSource?: string;

  @ApiProperty({ required: false })
  confidenceScore?: number;

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

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ required: false })
  paidDate?: Date;
}