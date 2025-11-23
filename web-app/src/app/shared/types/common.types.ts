export type TransactionType = 'income' | 'expense';

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
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    perPage: number;
  };
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  errors?: ValidationError[];
}