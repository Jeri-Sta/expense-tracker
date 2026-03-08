import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { InstallmentPlanSummary } from '../../../installments/models';
import { formatCurrency } from '../../../../shared/utils/format.utils';
import { getDaysUntilDate } from '../../../../shared/utils/date.utils';
import { getProgressBarClass } from '../../../../shared/utils/ui.utils';

@Component({
  selector: 'app-installment-plans-widget',
  templateUrl: './installment-plans-widget.component.html',
  styleUrls: ['./installment-plans-widget.component.scss'],
})
export class InstallmentPlansWidgetComponent {
  @Input() installmentPlans: InstallmentPlanSummary[] = [];
  @Input() isLoading = false;
  @Input() selectedMonth!: number;
  @Input() selectedYear!: number;
  @Output() viewDetails = new EventEmitter<string>();

  formatCurrency = formatCurrency;
  getProgressBarClass = getProgressBarClass;
  readonly Math = Math;

  private readonly router = inject(Router);

  onViewDetails(planId: string): void {
    this.viewDetails.emit(planId);
    this.router.navigate(['/installments', planId]);
  }

  onViewAll(): void {
    this.router.navigate(['/installments']);
  }

  onNewInstallmentPlan(): void {
    this.router.navigate(['/installments/new']);
  }

  getDaysUntilDue(date?: Date | string): number | null {
    if (!date) return null;
    return getDaysUntilDate(date);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getDueDateClass(daysUntilDue: number | null): string {
    if (daysUntilDue === null) return '';
    if (daysUntilDue < 0) return 'text-danger';
    if (daysUntilDue <= 7) return 'text-warning';
    return 'text-success';
  }

  getPlans(): InstallmentPlanSummary[] {
    const startOfMonth = new Date(this.selectedYear, this.selectedMonth, 1);
    const endOfMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0, 23, 59, 59);

    return this.installmentPlans.filter((plan) => {
      const planStart = new Date(plan.startDate);
      const planEnd = new Date(plan.endDate);

      // Plano ativo se houver interseção de período
      return planStart <= endOfMonth && planEnd >= startOfMonth;
    });
  }
}
