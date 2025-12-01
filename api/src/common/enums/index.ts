export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum InstallmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum InvoiceStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PAID = 'paid',
}