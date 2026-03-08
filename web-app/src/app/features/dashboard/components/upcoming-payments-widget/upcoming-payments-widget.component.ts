import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UpcomingPayment } from '../../../../core/types/common.types';
import { formatCurrency } from '../../../../shared/utils/format.utils';
import { getDaysUntilDate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-upcoming-payments-widget',
  templateUrl: './upcoming-payments-widget.component.html',
  styleUrls: ['./upcoming-payments-widget.component.scss'],
})
export class UpcomingPaymentsWidgetComponent {
  @Input() upcomingPayments: UpcomingPayment[] = [];
  @Input() isLoading = false;

  formatCurrency = formatCurrency;

  private readonly router = inject(Router);

  get subtitleText(): string {
    return 'Próximas parcelas a vencer';
  }

  get totalAmount(): number {
    if (!this.upcomingPayments || this.upcomingPayments.length === 0) {
      return 0;
    }
    return this.upcomingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }

  getDaysUntilDue(date: string | Date): number {
    return getDaysUntilDate(date);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
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
