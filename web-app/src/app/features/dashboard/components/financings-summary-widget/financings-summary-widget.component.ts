import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { InstallmentStats } from '../../../../shared/types/dashboard.types';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';

@Component({
  selector: 'app-financings-summary-widget',
  templateUrl: './financings-summary-widget.component.html',
  styleUrls: ['./financings-summary-widget.component.scss'],
})
export class FinancingsSummaryWidgetComponent {
  @Input() installmentStats: InstallmentStats = {
    totalPlans: 0,
    totalFinanced: 0,
    totalPaid: 0,
    totalRemaining: 0,
    totalSavings: 0,
    upcomingPayments: [],
    paidInMonth: [],
  };
  @Input() isLoading = false;
  @Output() navigateToInstallments = new EventEmitter<void>();

  private readonly utils = inject(DashboardUtilsService);

  formatCurrency(value: number): string {
    return this.utils.formatCurrency(value);
  }

  formatDate(date: string | Date): string {
    return this.utils.formatDate(date);
  }

  getInstallmentProgress(): number {
    if (this.installmentStats.totalPlans === 0) return 0;
    const total = this.installmentStats.totalFinanced + this.installmentStats.totalPaid;
    return total > 0 ? (this.installmentStats.totalPaid / total) * 100 : 0;
  }

  getDaysUntilDue(date: string | Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  onNavigateClick(): void {
    this.navigateToInstallments.emit();
  }
}
