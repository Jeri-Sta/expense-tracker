import { ApiProperty } from '@nestjs/swagger';
import { InstallmentStatus } from '../../../common/enums';

export class InstallmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  installmentNumber: number;

  @ApiProperty()
  originalAmount: number;

  @ApiProperty({ nullable: true })
  paidAmount?: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty({ nullable: true })
  paidDate?: Date;

  @ApiProperty({ enum: InstallmentStatus })
  status: InstallmentStatus;

  @ApiProperty({ nullable: true })
  notes?: string;

  @ApiProperty({ nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty()
  remainingAmount: number;

  @ApiProperty()
  effectiveAmount: number;

  @ApiProperty()
  isOverdue: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class InstallmentPlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  financedAmount: number;

  @ApiProperty()
  installmentValue: number;

  @ApiProperty()
  totalInstallments: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  totalInterest: number;

  @ApiProperty({ nullable: true })
  interestRate?: number;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty()
  totalPaid: number;

  @ApiProperty()
  totalDiscount: number;

  @ApiProperty()
  paidInstallments: number;

  @ApiProperty()
  remainingAmount: number;

  @ApiProperty()
  remainingInstallments: number;

  @ApiProperty()
  completionPercentage: number;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: [InstallmentResponseDto] })
  installments: InstallmentResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class InstallmentPlanSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  financedAmount: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  totalInterest: number;

  @ApiProperty()
  totalInstallments: number;

  @ApiProperty()
  paidInstallments: number;

  @ApiProperty()
  remainingInstallments: number;

  @ApiProperty()
  totalPaid: number;

  @ApiProperty()
  remainingAmount: number;

  @ApiProperty()
  completionPercentage: number;

  @ApiProperty()
  nextDueDate?: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}