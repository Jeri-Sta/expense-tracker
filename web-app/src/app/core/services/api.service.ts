import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiConfig {
  headers?: HttpHeaders;
  params?: HttpParams;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  get<T>(endpoint: string, config?: ApiConfig): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, config);
  }

  post<T>(endpoint: string, data: any, config?: ApiConfig): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, config);
  }

  put<T>(endpoint: string, data: any, config?: ApiConfig): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, config);
  }

  patch<T>(endpoint: string, data: any, config?: ApiConfig): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, data, config);
  }

  delete<T>(endpoint: string, config?: ApiConfig): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, config);
  }
}