import { Component, inject, Input } from '@angular/core';
import {
  DashboardStats,
  MonthlyExpenseBreakdownItem,
} from '../../../../core/types/common.types';
import { formatCurrency } from '../../../../shared/utils/format.utils';
import { DashboardService } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-kpi-cards-widget',
  templateUrl: './kpi-cards-widget.component.html',
  styleUrls: ['./kpi-cards-widget.component.scss'],
})
export class KpiCardsWidgetComponent {
  @Input() dashboardData: DashboardStats = {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
    averageTransaction: 0,
    monthlyGrowth: 0,
    projectedIncome: 0,
    projectedExpenses: 0,
    projectedBalance: 0,
    projectedTransactionCount: 0,
    hasProjections: false,
  };
  @Input() showProjections = false;
  @Input() isLoading = false;
  @Input() isCurrentMonth = true;
  @Input() selectedMonthName = '';
  @Input() expenseBreakdown: MonthlyExpenseBreakdownItem[] = [];

  readonly formatCurrency = formatCurrency;
  private readonly dashboardService = inject(DashboardService);

  getBalanceClass(): string {
    const balance = this.showProjections
      ? this.getTotalProjectedBalance()
      : this.getActualBalance();
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
  }

  getProjectionClass(value: number): string {
    return value >= 0 ? 'text-blue-600' : 'text-orange-600';
  }

  getTotalProjectedIncome(): number {
    return this.dashboardData.totalIncome + this.dashboardData.projectedIncome;
  }

  getTotalProjectedExpenses(): number {
    return this.getActualTotalExpenses() + this.dashboardData.projectedExpenses;
  }

  getActualTotalExpenses(): number {
    return this.dashboardService.getActualTotalExpenses(this.dashboardData, this.expenseBreakdown);
  }

  getActualBalance(): number {
    return this.dashboardService.getActualBalance(this.dashboardData, this.expenseBreakdown);
  }

  getTotalProjectedBalance(): number {
    return this.getActualBalance() + this.dashboardData.projectedBalance;
  }

  getTotalTransactionCount(): number {
    return this.showProjections
      ? this.dashboardData.transactionCount + this.dashboardData.projectedTransactionCount
      : this.dashboardData.transactionCount;
  }

  getMonthLabel(): string {
    return this.isCurrentMonth ? 'do Mês' : 'de ' + this.selectedMonthName;
  }

  getExpenseBreakdownTooltip(): string {
    if (!this.expenseBreakdown || this.expenseBreakdown.length === 0) {
      return '';
    }

    // Group items by type (excluding 'total')
    const transactionItems = this.expenseBreakdown.filter((item) => item.type === 'transaction');
    const creditCardItems = this.expenseBreakdown.filter((item) => item.type === 'credit-card');
    const financingItems = this.expenseBreakdown.filter((item) => item.type === 'financing');

    const lines: string[] = [];

    // Sum transactions
    const transactionTotal = transactionItems.reduce((sum, item) => sum + item.amount, 0);
    if (transactionTotal > 0) {
      lines.push(`Transações: ${this.formatCurrency(transactionTotal)}`);
    }

    // Sum credit cards
    const creditCardTotal = creditCardItems.reduce((sum, item) => sum + item.amount, 0);
    if (creditCardTotal > 0) {
      lines.push(`Cartões de Crédito: ${this.formatCurrency(creditCardTotal)}`);
    }

    // Sum financing
    const financingTotal = financingItems.reduce((sum, item) => sum + item.amount, 0);
    if (financingTotal > 0) {
      lines.push(`Financiamentos: ${this.formatCurrency(financingTotal)}`);
    }

    return lines.length > 0 ? lines.join('\n') : '';
  }
}
