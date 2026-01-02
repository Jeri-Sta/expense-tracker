import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from './category.service';

export type TransactionType = 'income' | 'expense';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringTransaction extends BaseEntity {
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  frequency: RecurrenceFrequency;
  interval: number;
  nextExecution: string;
  endDate?: string;
  maxExecutions?: number;
  executionCount: number;
  isActive: boolean;
  isCompleted: boolean;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface CreateRecurringTransactionDto {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  frequency: RecurrenceFrequency;
  nextExecution: Date;
  interval?: number;
  endDate?: Date;
  maxExecutions?: number;
  isActive?: boolean;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateRecurringTransactionDto {
  description?: string;
  amount?: number;
  type?: TransactionType;
  categoryId?: string;
  frequency?: RecurrenceFrequency;
  nextExecution?: Date;
  interval?: number;
  endDate?: Date;
  maxExecutions?: number;
  isActive?: boolean;
  notes?: string;
  metadata?: Record<string, any>;
  executionCount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class RecurringTransactionService {
  private readonly apiUrl = `${environment.apiUrl}/recurring-transactions`;

  private readonly http = inject(HttpClient);

  getRecurringTransactions(): Observable<RecurringTransaction[]> {
    return this.http.get<RecurringTransaction[]>(this.apiUrl);
  }

  getRecurringTransactionById(id: string): Observable<RecurringTransaction> {
    return this.http.get<RecurringTransaction>(`${this.apiUrl}/${id}`);
  }

  createRecurringTransaction(
    transaction: CreateRecurringTransactionDto,
  ): Observable<RecurringTransaction> {
    return this.http.post<RecurringTransaction>(this.apiUrl, transaction);
  }

  updateRecurringTransaction(
    id: string,
    transaction: UpdateRecurringTransactionDto,
  ): Observable<RecurringTransaction> {
    return this.http.patch<RecurringTransaction>(`${this.apiUrl}/${id}`, transaction);
  }

  deleteRecurringTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  executeRecurringTransaction(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/execute`, {});
  }

  // Helper method to get frequency options with labels
  getFrequencyOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'daily', label: 'Diário' },
      { value: 'weekly', label: 'Semanal' },
      { value: 'monthly', label: 'Mensal' },
      { value: 'quarterly', label: 'Trimestral' },
      { value: 'yearly', label: 'Anual' },
    ];
  }

  // Helper method to format frequency display
  formatFrequency(frequency: string, interval: number): string {
    const intervalText = interval > 1 ? ` (a cada ${interval})` : '';

    switch (frequency) {
      case 'daily':
        return `Diário${intervalText}`;
      case 'weekly':
        return `Semanal${intervalText}`;
      case 'monthly':
        return `Mensal${intervalText}`;
      case 'quarterly':
        return `Trimestral${intervalText}`;
      case 'yearly':
        return `Anual${intervalText}`;
      default:
        return frequency;
    }
  }

  // Helper method to calculate next execution date
  calculateNextExecution(currentDate: Date, frequency: string, interval: number): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + interval * 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + interval * 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
    }

    return nextDate;
  }

  skipRecurringTransaction(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/skip`, {});
  }
}
