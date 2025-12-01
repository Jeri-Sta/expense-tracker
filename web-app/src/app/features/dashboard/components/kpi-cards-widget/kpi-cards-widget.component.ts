import { Component, Input } from '@angular/core';
import { DashboardStats } from '../../../../shared/types/dashboard.types';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';

@Component({
  selector: 'app-kpi-cards-widget',
  templateUrl: './kpi-cards-widget.component.html',
  styleUrls: ['./kpi-cards-widget.component.scss']
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
    hasProjections: false
  };
  @Input() showProjections = false;
  @Input() isLoading = false;
  @Input() isCurrentMonth = true;
  @Input() selectedMonthName = '';

  constructor(private readonly utils: DashboardUtilsService) {}

  formatCurrency(value: number): string {
    return this.utils.formatCurrency(value);
  }

  getBalanceClass(): string {
    return this.utils.getBalanceClass(this.dashboardData.balance);
  }

  getProjectionClass(value: number): string {
    return this.utils.getProjectionClass(value);
  }

  getTotalProjectedIncome(): number {
    return this.dashboardData.totalIncome + this.dashboardData.projectedIncome;
  }

  getTotalProjectedExpenses(): number {
    return this.dashboardData.totalExpenses + this.dashboardData.projectedExpenses;
  }

  getTotalProjectedBalance(): number {
    return this.dashboardData.balance + this.dashboardData.projectedBalance;
  }

  getTotalTransactionCount(): number {
    return this.showProjections 
      ? this.dashboardData.transactionCount + this.dashboardData.projectedTransactionCount
      : this.dashboardData.transactionCount;
  }

  getMonthLabel(): string {
    return this.isCurrentMonth ? 'do Mês' : 'de ' + this.selectedMonthName;
  }
}
