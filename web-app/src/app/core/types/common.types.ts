// Common types for the expense tracker application

export type TransactionType = 'income' | 'expense';
export type CategoryType = 'income' | 'expense';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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