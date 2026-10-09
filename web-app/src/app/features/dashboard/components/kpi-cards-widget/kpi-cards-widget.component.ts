import { Component, inject, Input } from '@angular/core';
import { DashboardStats, MonthlyExpenseBreakdownItem } from '../../../../core/types/common.types';
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
    monthlyGrowth: null,
    projectedIncome: 0,
    projectedExpenses: 0,
    projectedBalance: 0,
    projectedTransactionCount: 0,
    hasProjections: false,
  };
  @Input() showProjections = false;
  @Input() selectedMonthName = '';
  @Input() selectedYear = new Date().getFullYear();
  @Input() expenseBreakdown: MonthlyExpenseBreakdownItem[] = [];
  @Input() upcomingObligationsTotal = 0;
  @Input() upcomingObligationsCount = 0;

  readonly formatCurrency = formatCurrency;
  private readonly dashboardService = inject(DashboardService);

  getBalanceClass(): string {
    const balance = this.showProjections
      ? this.getTotalProjectedBalance()
      : this.getActualBalance();
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
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

  getPeriodLabel(): string {
    return `${this.selectedMonthName} de ${this.selectedYear}`;
  }
}
