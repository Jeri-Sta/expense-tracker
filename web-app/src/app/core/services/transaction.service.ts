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
  competencyMonth?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
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
  competencyMonth: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface CreateTransactionDto {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  transactionDate: Date;
  competencyMonth: Date;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTransactionDto {
  description?: string;
  amount?: number;
  type?: TransactionType;
  categoryId?: string;
  transactionDate?: Date;
  competencyMonth?: Date;
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

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

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
}