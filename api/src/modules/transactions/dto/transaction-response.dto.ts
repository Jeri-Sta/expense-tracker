import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, PaymentStatus } from '../../../common/enums';
import { Transaction } from '../entities/transaction.entity';

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

  static fromEntity(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      amount: Number(transaction.amount),
      description: transaction.description,
      type: transaction.type,
      transactionDate: transaction.transactionDate,
      competencyPeriod: transaction.competencyPeriod,
      notes: transaction.notes,
      metadata: transaction.metadata,
      isRecurring: transaction.isRecurring,
      isProjected: transaction.isProjected ?? false,
      projectionSource: transaction.projectionSource,
      confidenceScore: transaction.confidenceScore
        ? Number(transaction.confidenceScore)
        : undefined,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      category: transaction.category
        ? {
            id: transaction.category.id,
            name: transaction.category.name,
            color: transaction.category.color,
            icon: transaction.category.icon,
          }
        : undefined,
      paymentStatus: transaction.paymentStatus ?? PaymentStatus.PENDING,
      paidDate: transaction.paidDate,
    };
  }
}
