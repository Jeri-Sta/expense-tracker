import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  CardTransaction, 
  CreateCardTransactionDto, 
  UpdateCardTransactionDto,
  Invoice,
  UpdateInvoiceStatusDto
} from '../models/card-transaction.model';

export interface CardTransactionFilterParams {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  creditCardId?: string;
  invoicePeriod?: string;
  dueYear?: number;
  dueMonth?: number;
}

export interface PaginatedCardTransactionsResponse {
  data: CardTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class CardTransactionService {
  private readonly apiUrl = `${environment.apiUrl}/card-transactions`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get all card transactions with pagination and sorting support
   */
  getTransactionsPaginated(params: CardTransactionFilterParams): Observable<PaginatedCardTransactionsResponse> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.sortField) httpParams = httpParams.set('sortField', params.sortField);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    if (params.creditCardId) httpParams = httpParams.set('creditCardId', params.creditCardId);
    if (params.invoicePeriod) httpParams = httpParams.set('invoicePeriod', params.invoicePeriod);
    if (params.dueYear) httpParams = httpParams.set('dueYear', params.dueYear.toString());
    if (params.dueMonth) httpParams = httpParams.set('dueMonth', params.dueMonth.toString());
    
    return this.http.get<PaginatedCardTransactionsResponse>(this.apiUrl, { params: httpParams });
  }

  getAll(creditCardId?: string, invoicePeriod?: string): Observable<CardTransaction[]> {
    let params = new HttpParams();
    if (creditCardId) {
      params = params.set('creditCardId', creditCardId);
    }
    if (invoicePeriod) {
      params = params.set('invoicePeriod', invoicePeriod);
    }
    return this.http.get<CardTransaction[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<CardTransaction> {
    return this.http.get<CardTransaction>(`${this.apiUrl}/${id}`);
  }

  create(transaction: CreateCardTransactionDto): Observable<CardTransaction> {
    return this.http.post<CardTransaction>(this.apiUrl, transaction);
  }

  update(id: string, transaction: UpdateCardTransactionDto): Observable<CardTransaction> {
    return this.http.patch<CardTransaction>(`${this.apiUrl}/${id}`, transaction);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPendingInstallments(period?: string): Observable<CardTransaction[]> {
    let params = new HttpParams();
    if (period) {
      params = params.set('period', period);
    }
    return this.http.get<CardTransaction[]>(`${this.apiUrl}/installments/pending`, { params });
  }

  // Invoice methods
  getInvoices(creditCardId?: string): Observable<Invoice[]> {
    let params = new HttpParams();
    if (creditCardId) {
      params = params.set('creditCardId', creditCardId);
    }
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices/all`, { params });
  }

  getInvoice(creditCardId: string, period: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/invoices/${creditCardId}/${period}`);
  }

  updateInvoiceStatus(creditCardId: string, period: string, status: UpdateInvoiceStatusDto): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/invoices/${creditCardId}/${period}/status`, status);
  }

  // Helper to format period for display
  formatPeriod(period: string): string {
    const [year, month] = period.split('-');
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[parseInt(month) - 1]}/${year}`;
  }

  /**
   * Get card transactions by the invoice due month.
   * This returns transactions from invoices that are due in the specified month.
   */
  getByDueMonth(year: number, month: number, creditCardId?: string): Observable<CardTransaction[]> {
    let params = new HttpParams();
    if (creditCardId) {
      params = params.set('creditCardId', creditCardId);
    }
    return this.http.get<CardTransaction[]>(`${this.apiUrl}/by-due-month/${year}/${month}`, { params });
  }

  /**
   * Get invoices by the invoice due month.
   * This returns invoices that have their due date in the specified month.
   */
  getInvoicesByDueMonth(year: number, month: number, creditCardId?: string): Observable<Invoice[]> {
    let params = new HttpParams();
    if (creditCardId) {
      params = params.set('creditCardId', creditCardId);
    }
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices/by-due-month/${year}/${month}`, { params });
  }

  // Helper to get current period
  getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Get available periods for filter (last 12 months + next 6 months)
  getAvailablePeriods(): { label: string; value: string }[] {
    const periods: { label: string; value: string }[] = [];
    const now = new Date();
    
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      periods.push({
        label: this.formatPeriod(period),
        value: period
      });
    }
    
    // Next 6 months
    for (let i = 1; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      periods.push({
        label: this.formatPeriod(period),
        value: period
      });
    }
    
    return periods;
  }
}
