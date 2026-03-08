import { Component, Input, Output, EventEmitter } from '@angular/core';
import { InstallmentStats } from '../../../../core/types/common.types';
import { formatCurrency } from '../../../../shared/utils/format.utils';
import { getDaysUntilDate } from '../../../../shared/utils/date.utils';
import { getProgressBarClass } from '../../../../shared/utils/ui.utils';

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

  formatCurrency = formatCurrency;
  getDaysUntilDue = getDaysUntilDate;
  getProgressBarClass = getProgressBarClass;

  getInstallmentProgress(): number {
    if (this.installmentStats.totalPlans === 0) return 0;
    const total = this.installmentStats.totalFinanced + this.installmentStats.totalPaid;
    return total > 0 ? (this.installmentStats.totalPaid / total) * 100 : 0;
  }

  onNavigateClick(): void {
    this.navigateToInstallments.emit();
  }
}
