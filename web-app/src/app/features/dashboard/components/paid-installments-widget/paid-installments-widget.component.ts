import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PaidInstallment } from '../../../../core/types/common.types';
import { formatCurrency } from '../../../../shared/utils/format.utils';

@Component({
  selector: 'app-paid-installments-widget',
  templateUrl: './paid-installments-widget.component.html',
  styleUrls: ['./paid-installments-widget.component.scss'],
})
export class PaidInstallmentsWidgetComponent {
  @Input() paidInstallments: PaidInstallment[] = [];
  @Input() isLoading = false;
  @Input() selectedMonthName = '';
  @Input() selectedYear = new Date().getFullYear();

  // Use Angular's `inject()` to satisfy @angular-eslint/prefer-inject
  private readonly router = inject(Router);

  readonly formatCurrency = formatCurrency;

  get subtitleText(): string {
    if (this.selectedMonthName && this.selectedYear) {
      return `${this.selectedMonthName} ${this.selectedYear}`;
    }
    return 'Parcelas pagas no mês';
  }

  get totalAmount(): number {
    if (!this.paidInstallments || this.paidInstallments.length === 0) {
      return 0;
    }
    return this.paidInstallments.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
  }

  get totalDiscount(): number {
    if (!this.paidInstallments || this.paidInstallments.length === 0) {
      return 0;
    }
    return this.paidInstallments.reduce((sum, p) => sum + (Number(p.discountAmount) || 0), 0);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  navigateToInstallments(): void {
    this.router.navigate(['/installments']);
  }
}
