export enum InstallmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export interface Installment {
  id: string;
  installmentNumber: number;
  originalAmount: number;
  paidAmount?: number;
  discountAmount: number;
  dueDate: Date;
  paidDate?: Date;
  status: InstallmentStatus;
  notes?: string;
  metadata?: Record<string, any>;
  remainingAmount: number;
  effectiveAmount: number;
  isOverdue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstallmentPlan {
  id: string;
  name: string;
  financedAmount: number;
  installmentValue: number;
  totalInstallments: number;
  totalAmount: number;
  totalInterest: number;
  interestRate?: number;
  startDate: Date;
  endDate: Date;
  description?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  totalPaid: number;
  totalDiscount: number;
  paidInstallments: number;
  remainingAmount: number;
  remainingInstallments: number;
  completionPercentage: number;
  userId: string;
  installments: Installment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InstallmentPlanSummary {
  id: string;
  name: string;
  financedAmount: number;
  totalAmount: number;
  totalInterest: number;
  totalInstallments: number;
  paidInstallments: number;
  remainingInstallments: number;
  totalPaid: number;
  totalDiscount: number;
  remainingAmount: number;
  completionPercentage: number;
  nextDueDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateInstallmentPlan {
  name: string;
  financedAmount: number;
  installmentValue: number;
  totalInstallments: number;
  startDate: Date;
  interestRate?: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateInstallmentPlan {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
}

export interface PayInstallment {
  paidAmount: number;
  paidDate?: Date;
  notes?: string;
  metadata?: Record<string, any>;
}