import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreditCard, CreateCreditCardDto, UpdateCreditCardDto } from '../models/credit-card.model';

@Injectable({
  providedIn: 'root'
})
export class CreditCardService {
  private readonly apiUrl = `${environment.apiUrl}/credit-cards`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<CreditCard[]> {
    return this.http.get<CreditCard[]>(this.apiUrl);
  }

  getById(id: string): Observable<CreditCard> {
    return this.http.get<CreditCard>(`${this.apiUrl}/${id}`);
  }

  create(creditCard: CreateCreditCardDto): Observable<CreditCard> {
    return this.http.post<CreditCard>(this.apiUrl, creditCard);
  }

  update(id: string, creditCard: UpdateCreditCardDto): Observable<CreditCard> {
    return this.http.patch<CreditCard>(`${this.apiUrl}/${id}`, creditCard);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Predefined colors for credit cards
  getCardColors(): string[] {
    return [
      '#8B5CF6', // Purple - Nubank style
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EC4899', // Pink
      '#6366F1', // Indigo
      '#14B8A6', // Teal
      '#F97316', // Orange
      '#6B7280', // Gray
      '#000000', // Black
      '#1E3A8A', // Navy
    ];
  }
}
