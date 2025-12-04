import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UpcomingPayment } from '../../../../shared/types/dashboard.types';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';

@Component({
  selector: 'app-upcoming-payments-widget',
  templateUrl: './upcoming-payments-widget.component.html',
  styleUrls: ['./upcoming-payments-widget.component.scss'],
})
export class UpcomingPaymentsWidgetComponent {
  @Input() upcomingPayments: UpcomingPayment[] = [];
  @Input() isLoading = false;

  constructor(
    private readonly utils: DashboardUtilsService,
    private readonly router: Router,
  ) {}

  get subtitleText(): string {
    return 'Próximas parcelas a vencer';
  }

  get totalAmount(): number {
    if (!this.upcomingPayments || this.upcomingPayments.length === 0) {
      return 0;
    }
    return this.upcomingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }

  formatCurrency(value: number): string {
    return this.utils.formatCurrency(value);
  }

  formatDate(date: string | Date): string {
    return this.utils.formatDate(date);
  }

  getDaysUntilDue(date: string | Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDueDateStatusClass(date: string | Date): string {
    const days = this.getDaysUntilDue(date);
    if (days < 0) return 'text-red-500';
    if (days <= 3) return 'text-orange-500';
    if (days <= 7) return 'text-yellow-600';
    return 'text-color-secondary';
  }

  getDueDateLabel(date: string | Date): string {
    const days = this.getDaysUntilDue(date);
    if (days < 0) return `Vencida há ${Math.abs(days)} dia(s)`;
    if (days === 0) return 'Vence hoje';
    if (days === 1) return 'Vence amanhã';
    return `${days} dias`;
  }

  navigateToInstallments(): void {
    this.router.navigate(['/installments']);
  }
}
