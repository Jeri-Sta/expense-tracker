// Common types for the expense tracker application

export type TransactionType = 'income' | 'expense';
export type CategoryType = 'income' | 'expense';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type PaymentStatus = 'pending' | 'paid';
export type InvoiceStatus = 'open' | 'closed' | 'paid';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  type: TransactionType;
  color: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Flat paginated response shape used by all API endpoints.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  competencyPeriod?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  paymentStatus?: PaymentStatus;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  validationErrors?: ValidationError[];
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  errors?: ValidationError[];
}

// Dashboard types

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  averageTransaction: number;
  monthlyGrowth: number;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  projectedTransactionCount: number;
  hasProjections: boolean;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface InstallmentStats {
  totalPlans: number;
  totalFinanced: number;
  totalPaid: number;
  totalRemaining: number;
  totalSavings: number;
  upcomingPayments: UpcomingPayment[];
  paidInMonth: PaidInstallment[];
}

export interface UpcomingPayment {
  installmentNumber: number;
  planName: string;
  dueDate: string;
  amount: number;
}

export interface PaidInstallment {
  id: string;
  planId: string;
  planName: string;
  installmentNumber: number;
  totalInstallments: number;
  paidAmount: number;
  paidDate: string;
  discountAmount: number;
}

export interface MonthlyExpenseBreakdownItem {
  type: 'transaction' | 'credit-card' | 'financing' | 'total';
  name: string;
  amount: number;
  color?: string;
  icon?: string;
  discountAmount?: number;
}
