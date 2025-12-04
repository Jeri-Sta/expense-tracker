import { Component, Input } from '@angular/core';
import { MonthlyExpenseBreakdownItem } from '../../../../shared/types/dashboard.types';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';

@Component({
  selector: 'app-monthly-expense-breakdown-widget',
  templateUrl: './monthly-expense-breakdown-widget.component.html',
  styleUrls: ['./monthly-expense-breakdown-widget.component.scss'],
})
export class MonthlyExpenseBreakdownWidgetComponent {
  @Input() breakdownItems: MonthlyExpenseBreakdownItem[] = [];
  @Input() isLoading = false;
  @Input() selectedMonthName = '';
  @Input() selectedYear = new Date().getFullYear();

  constructor(private readonly utils: DashboardUtilsService) {}

  formatCurrency(value: number): string {
    return this.utils.formatCurrency(value);
  }

  getIconForType(item: MonthlyExpenseBreakdownItem): string {
    switch (item.type) {
      case 'transaction':
        return 'pi pi-wallet';
      case 'credit-card':
        return 'pi pi-credit-card';
      case 'financing':
        return 'pi pi-building';
      case 'total':
        return 'pi pi-calculator';
      default:
        return 'pi pi-money-bill';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'transaction':
        return 'Transação';
      case 'credit-card':
        return 'Cartão de Crédito';
      case 'financing':
        return 'Financiamento';
      case 'total':
        return 'Total';
      default:
        return '';
    }
  }

  get hasItems(): boolean {
    return this.breakdownItems.length > 0;
  }

  get itemsWithoutTotal(): MonthlyExpenseBreakdownItem[] {
    return this.breakdownItems.filter((item) => item.type !== 'total');
  }

  get totalItem(): MonthlyExpenseBreakdownItem | undefined {
    return this.breakdownItems.find((item) => item.type === 'total');
  }
}
