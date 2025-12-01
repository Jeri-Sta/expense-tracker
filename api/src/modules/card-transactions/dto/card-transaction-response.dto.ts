import { ApiProperty } from '@nestjs/swagger';

export class CardTransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  transactionDate: Date;

  @ApiProperty({ description: 'Invoice period in YYYY-MM format' })
  invoicePeriod: string;

  @ApiProperty()
  isInstallment: boolean;

  @ApiProperty({ required: false })
  installmentNumber?: number;

  @ApiProperty({ required: false })
  totalInstallments?: number;

  @ApiProperty({ required: false })
  installmentLabel?: string;

  @ApiProperty({ required: false })
  parentTransactionId?: string;

  @ApiProperty()
  creditCardId: string;

  @ApiProperty({ required: false })
  creditCardName?: string;

  @ApiProperty({ required: false })
  creditCardColor?: string;

  @ApiProperty({ required: false })
  categoryId?: string;

  @ApiProperty({ required: false })
  categoryName?: string;

  @ApiProperty({ required: false })
  categoryColor?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => [CardTransactionResponseDto], required: false })
  childTransactions?: CardTransactionResponseDto[];
}

export class CardTransactionSummaryDto {
  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  transactionCount: number;

  @ApiProperty()
  installmentCount: number;
}
