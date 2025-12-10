import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { InstallmentPlanSummary } from '../../../installments/models';

@Component({
  selector: 'app-installment-plans-widget',
  templateUrl: './installment-plans-widget.component.html',
  styleUrls: ['./installment-plans-widget.component.scss'],
})
export class InstallmentPlansWidgetComponent {
  @Input() installmentPlans: InstallmentPlanSummary[] = [];
  @Input() isLoading = false;
  @Output() viewDetails = new EventEmitter<string>();

  // Math object for template
  Math = Math;

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

  getProgressBarClass(percentage: number): string {
    if (percentage < 30) return 'progress-danger';
    if (percentage < 70) return 'progress-warning';
    return 'progress-success';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getDaysUntilDue(date?: Date | string): number | null {
    if (!date) return null;
    const dueDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDueDateClass(daysUntilDue: number | null): string {
    if (daysUntilDue === null) return '';
    if (daysUntilDue < 0) return 'text-danger';
    if (daysUntilDue <= 7) return 'text-warning';
    return 'text-success';
  }

  getActivePlans(): InstallmentPlanSummary[] {
    return this.installmentPlans.filter((plan) => plan.isActive);
  }
}
