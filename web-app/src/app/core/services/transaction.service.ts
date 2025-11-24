import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

export interface ProjectionFilters extends TransactionFilters {
  includeProjections?: boolean;
  onlyProjections?: boolean;
  projectionSource?: 'recurring' | 'manual' | 'ai';
  minConfidence?: number;
}

export interface GenerateProjectionsDto {
  startPeriod: string;
  endPeriod: string;
  overrideExisting?: boolean;
  defaultConfidence?: number;
}

export interface ProjectionResult {
  generated: number;
  period: string;
  projections: Transaction[];
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface Transaction extends BaseEntity {
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  transactionDate: string;
  competencyPeriod: string;
  notes?: string;
  metadata?: Record<string, any>;
  isProjected?: boolean;
  projectionSource?: string;
  confidenceScore?: number;
  isRecurring?: boolean;
}

export interface CreateTransactionDto {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  transactionDate: string;
  competencyPeriod: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTransactionDto {
  description?: string;
  amount?: number;
  type?: TransactionType;
  categoryId?: string;
  transactionDate?: string;
  competencyPeriod?: string;
  notes?: string;
  metadata?: Record<string, any>;
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

export interface MonthlyStats {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface MonthlyStatsWithProjections {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  hasProjections: boolean;
  transactionCount: number;
  projectedTransactionCount: number;
}

export interface DashboardStats {
  currentMonth: MonthlyStatsWithProjections;
  yearlyOverview: MonthlyStatsWithProjections[];
  recentTransactions: Transaction[];
  topCategories: any[];
  installments: {
    totalPlans: number;
    totalFinanced: number;
    totalPaid: number;
    totalRemaining: number;
    totalSavings: number;
    upcomingPayments: any[];
  };
}

export interface MonthlyNavigationStats {
  year: number;
  month: number;
  stats: MonthlyStatsWithProjections;
  recentTransactions: Transaction[];
  topCategories: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private readonly http: HttpClient) {}

  getTransactions(filters?: TransactionFilters): Observable<PaginatedResponse<Transaction>> {
    let params = new HttpParams();
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            params = params.set(key, value.toISOString().split('T')[0]);
          } else {
            params = params.set(key, value.toString());
          }
        }
      }
    }

    return this.http.get<PaginatedResponse<Transaction>>(this.apiUrl, { params });
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  createTransaction(transaction: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  updateTransaction(id: string, transaction: UpdateTransactionDto): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/${id}`, transaction);
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMonthlyStats(year?: number): Observable<MonthlyStats[]> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<MonthlyStats[]>(`${this.apiUrl}/stats/monthly`, { params });
  }

  exportTransactions(filters?: TransactionFilters): Observable<Blob> {
    let params = new HttpParams();
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            params = params.set(key, value.toISOString().split('T')[0]);
          } else {
            params = params.set(key, value.toString());
          }
        }
      }
    }

    return this.http.get(`${this.apiUrl}/export`, { 
      params, 
      responseType: 'blob' 
    });
  }

  // Projection methods
  generateProjections(dto: GenerateProjectionsDto): Observable<ProjectionResult> {
    return this.http.post<ProjectionResult>(`${this.apiUrl}/projections/generate`, dto);
  }

  getMonthlyProjections(year: number, month: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/projections/monthly/${year}/${month}`);
  }

  getStatsWithProjections(year: number, month?: number): Observable<MonthlyStatsWithProjections[]> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month.toString());
    }
    return this.http.get<MonthlyStatsWithProjections[]>(`${this.apiUrl}/projections/stats/${year}`, { params });
  }

  cleanupProjections(startPeriod?: string, endPeriod?: string): Observable<{deleted: number}> {
    let params = new HttpParams();
    if (startPeriod) params = params.set('startPeriod', startPeriod);
    if (endPeriod) params = params.set('endPeriod', endPeriod);
    
    return this.http.delete<{deleted: number}>(`${this.apiUrl}/projections/cleanup`, { params });
  }

  getTransactionsWithProjectionFilters(filters?: ProjectionFilters): Observable<PaginatedResponse<Transaction>> {
    let params = new HttpParams();
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            params = params.set(key, value.toISOString().split('T')[0]);
          } else {
            params = params.set(key, value.toString());
          }
        }
      }
    }

    return this.http.get<PaginatedResponse<Transaction>>(`${this.apiUrl}/projections/filter`, { params });
  }
}