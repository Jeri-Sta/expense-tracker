import { Component, Input } from '@angular/core';
import { CardInstallmentSummary } from '../../../../core/services/transaction.service';
import { normalizeIcon } from '../../../../shared/utils/icon.utils';

@Component({
  selector: 'app-installments-widget',
  templateUrl: './installments-widget.component.html',
  styleUrls: ['./installments-widget.component.scss'],
})
export class InstallmentsWidgetComponent {
  @Input() installments: CardInstallmentSummary[] = [];

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  getTotalMonthlyAmount(): number {
    return this.installments.reduce((sum, inst) => sum + inst.installmentAmount, 0);
  }

  getTotalRemainingAmount(): number {
    return this.installments.reduce((sum, inst) => sum + inst.totalRemaining, 0);
  }

  getProgressPercentage(installment: CardInstallmentSummary): number {
    return (installment.currentInstallment / installment.totalInstallments) * 100;
  }

  normalizeIcon(icon: string): string {
    return normalizeIcon(icon);
  }
}
