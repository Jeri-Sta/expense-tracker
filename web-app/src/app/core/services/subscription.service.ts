import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Subscription {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  amount: number;
  chargeDay: number;
  startDate: string;
  nextChargeDate: string;
  creditCardId: string;
  creditCardName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionDto {
  name: string;
  amount: number;
  chargeDay: number;
  startDate: string;
  creditCardId: string;
}

export type UpdateSubscriptionDto = Omit<CreateSubscriptionDto, 'startDate'>;

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly apiUrl = `${environment.apiUrl}/subscriptions`;
  private readonly http = inject(HttpClient);

  getAll(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(this.apiUrl);
  }

  create(dto: CreateSubscriptionDto): Observable<Subscription> {
    return this.http.post<Subscription>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateSubscriptionDto): Observable<Subscription> {
    return this.http.patch<Subscription>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
