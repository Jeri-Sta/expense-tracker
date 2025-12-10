import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats, MonthlyNavigationStats } from './transaction.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  private readonly http = inject(HttpClient);

  getDashboard(year?: number): Observable<DashboardStats> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<DashboardStats>(this.apiUrl, { params });
  }

  getMonthlyStats(year: number, month: number): Observable<MonthlyNavigationStats> {
    return this.http.get<MonthlyNavigationStats>(`${this.apiUrl}/monthly/${year}/${month}`);
  }
}
