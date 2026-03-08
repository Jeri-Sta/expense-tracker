import { Component, Input } from '@angular/core';
import { CardInstallmentSummary } from '../../../../core/services/transaction.service';
import { normalizeIcon } from '../../../../shared/utils/icon.utils';
import { formatCurrency } from '../../../../shared/utils/format.utils';

@Component({
  selector: 'app-installments-widget',
  templateUrl: './installments-widget.component.html',
  styleUrls: ['./installments-widget.component.scss'],
})
export class InstallmentsWidgetComponent {
  @Input() installments: CardInstallmentSummary[] = [];

  readonly formatCurrency = formatCurrency;
  readonly normalizeIcon = normalizeIcon;

  getTotalMonthlyAmount(): number {
    return this.installments.reduce((sum, inst) => sum + inst.installmentAmount, 0);
  }

  getTotalRemainingAmount(): number {
    return this.installments.reduce((sum, inst) => sum + inst.totalRemaining, 0);
  }

  getProgressPercentage(installment: CardInstallmentSummary): number {
    return (installment.currentInstallment / installment.totalInstallments) * 100;
  }
}
