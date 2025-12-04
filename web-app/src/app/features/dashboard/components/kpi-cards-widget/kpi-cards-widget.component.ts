import { Component, Input } from '@angular/core';
import {
  DashboardStats,
  MonthlyExpenseBreakdownItem,
} from '../../../../shared/types/dashboard.types';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';

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

  constructor(private readonly utils: DashboardUtilsService) {}

  formatCurrency(value: number): string {
    return this.utils.formatCurrency(value);
  }

  getBalanceClass(): string {
    const balance = this.showProjections
      ? this.getTotalProjectedBalance()
      : this.getActualBalance();
    return this.utils.getBalanceClass(balance);
  }

  getProjectionClass(value: number): string {
    return this.utils.getProjectionClass(value);
  }

  getTotalProjectedIncome(): number {
    return this.dashboardData.totalIncome + this.dashboardData.projectedIncome;
  }

  getTotalProjectedExpenses(): number {
    return this.getActualTotalExpenses() + this.dashboardData.projectedExpenses;
  }

  /**
   * Gets the actual total expenses from the breakdown data if available,
   * otherwise falls back to dashboardData.totalExpenses
   */
  getActualTotalExpenses(): number {
    if (this.expenseBreakdown && this.expenseBreakdown.length > 0) {
      const totalItem = this.expenseBreakdown.find((item) => item.type === 'total');
      if (totalItem) {
        return totalItem.amount;
      }
    }
    return this.dashboardData.totalExpenses;
  }

  /**
   * Gets the actual balance calculated using the correct expenses from breakdown.
   * Balance = totalIncome - actualTotalExpenses
   */
  getActualBalance(): number {
    return this.dashboardData.totalIncome - this.getActualTotalExpenses();
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
