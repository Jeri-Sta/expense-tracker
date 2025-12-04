import { Injectable } from '@angular/core';
import { normalizeIcon } from '../utils/icon.utils';

@Injectable({
  providedIn: 'root',
})
export class DashboardUtilsService {
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getBalanceClass(balance: number): string {
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
  }

  getGrowthClass(growth: number): string {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  }

  getGrowthIcon(growth: number): string {
    return growth >= 0 ? 'pi-trending-up' : 'pi-trending-down';
  }

  getProjectionClass(value: number): string {
    return value >= 0 ? 'text-blue-600' : 'text-orange-600';
  }

  normalizeIcon(icon: string): string {
    return normalizeIcon(icon);
  }

  getTransactionColorClass(type: string): string {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  }

  getTransactionSign(type: string): string {
    return type === 'income' ? '+' : '-';
  }
}
