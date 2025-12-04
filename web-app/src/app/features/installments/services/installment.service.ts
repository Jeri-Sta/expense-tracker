import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  InstallmentPlan,
  InstallmentPlanSummary,
  CreateInstallmentPlan,
  UpdateInstallmentPlan,
  PayInstallment,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class InstallmentService {
  private readonly apiUrl = `${environment.apiUrl}/installments`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<InstallmentPlanSummary[]> {
    return this.http.get<InstallmentPlanSummary[]>(this.apiUrl);
  }

  getById(id: string): Observable<InstallmentPlan> {
    return this.http.get<InstallmentPlan>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateInstallmentPlan): Observable<InstallmentPlan> {
    return this.http.post<InstallmentPlan>(this.apiUrl, data);
  }

  update(id: string, data: UpdateInstallmentPlan): Observable<InstallmentPlan> {
    return this.http.patch<InstallmentPlan>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  payInstallment(installmentId: string, data: PayInstallment): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${installmentId}/pay`, data);
  }

  deletePayment(installmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${installmentId}/payment`);
  }

  calculateTotalAmount(installmentValue: number, totalInstallments: number): number {
    return installmentValue * totalInstallments;
  }

  calculateInterest(totalAmount: number, financedAmount: number): number {
    return totalAmount - financedAmount;
  }

  calculateInstallmentValue(financedAmount: number, totalInstallments: number): number {
    return financedAmount / totalInstallments;
  }

  /**
   * Calcula a taxa de juros automaticamente baseada nos valores informados
   * @param financedAmount Valor financiado original
   * @param installmentValue Valor de cada parcela
   * @param totalInstallments Número total de parcelas
   * @returns Taxa de juros efetiva mensal em percentual
   */
  calculateAutoInterestRate(
    financedAmount: number,
    installmentValue: number,
    totalInstallments: number,
  ): number {
    if (financedAmount <= 0 || installmentValue <= 0 || totalInstallments <= 0) {
      return 0;
    }

    const totalAmount = installmentValue * totalInstallments;
    const totalInterest = totalAmount - financedAmount;

    // Se não há juros, retorna 0
    if (totalInterest <= 0) {
      return 0;
    }

    // Cálculo da taxa efetiva mensal
    // Fórmula: ((Valor Total / Valor Financiado) ^ (1/n)) - 1) * 100
    // Onde n é o número de parcelas
    const rate = Math.pow(totalAmount / financedAmount, 1 / totalInstallments) - 1;
    return rate * 100;
  }

  /**
   * Calcula a taxa de juros simples para comparação
   * @param financedAmount Valor financiado original
   * @param installmentValue Valor de cada parcela
   * @param totalInstallments Número total de parcelas
   * @returns Taxa de juros simples em percentual
   */
  calculateSimpleInterestRate(
    financedAmount: number,
    installmentValue: number,
    totalInstallments: number,
  ): number {
    if (financedAmount <= 0 || installmentValue <= 0 || totalInstallments <= 0) {
      return 0;
    }

    const totalAmount = installmentValue * totalInstallments;
    const totalInterest = totalAmount - financedAmount;

    // Taxa simples total
    const simpleRate = (totalInterest / financedAmount) * 100;

    return simpleRate;
  }
}
