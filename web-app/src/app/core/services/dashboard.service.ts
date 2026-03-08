import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardApiResponse, MonthlyNavigationStats } from './transaction.service';
import { DashboardStats, MonthlyExpenseBreakdownItem } from '../types/common.types';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  private readonly http = inject(HttpClient);

  getDashboard(year?: number): Observable<DashboardApiResponse> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<DashboardApiResponse>(this.apiUrl, { params });
  }

  getMonthlyStats(year: number, month: number): Observable<MonthlyNavigationStats> {
    return this.http.get<MonthlyNavigationStats>(`${this.apiUrl}/monthly/${year}/${month}`);
  }

  /**
   * Gets the actual total expenses from the breakdown data if available,
   * otherwise falls back to stats.totalExpenses.
   * This ensures consistency between the KPI cards widget and the dashboard.
   */
  getActualTotalExpenses(
    stats: DashboardStats,
    expenseBreakdown: MonthlyExpenseBreakdownItem[],
  ): number {
    if (expenseBreakdown && expenseBreakdown.length > 0) {
      const totalItem = expenseBreakdown.find((item) => item.type === 'total');
      if (totalItem) {
        return totalItem.amount;
      }
    }
    return stats.totalExpenses;
  }

  /**
   * Gets the actual balance calculated using the correct expenses from breakdown.
   * Balance = totalIncome - actualTotalExpenses
   */
  getActualBalance(
    stats: DashboardStats,
    expenseBreakdown: MonthlyExpenseBreakdownItem[],
  ): number {
    return stats.totalIncome - this.getActualTotalExpenses(stats, expenseBreakdown);
  }
}
