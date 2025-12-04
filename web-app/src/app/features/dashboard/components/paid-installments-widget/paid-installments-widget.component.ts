import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PaidInstallment } from '../../../../shared/types/dashboard.types';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';

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

  constructor(
    private readonly utils: DashboardUtilsService,
    private readonly router: Router,
  ) {}

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

  formatCurrency(value: number): string {
    return this.utils.formatCurrency(value);
  }

  formatDate(date: string | Date): string {
    return this.utils.formatDate(date);
  }

  navigateToInstallments(): void {
    this.router.navigate(['/installments']);
  }
}
