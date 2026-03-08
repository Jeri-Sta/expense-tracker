import { Component, Input } from '@angular/core';
import { CardTransaction } from '../../../credit-cards/models/card-transaction.model';
import { normalizeIcon } from '../../../../shared/utils/icon.utils';
import { formatCurrency, formatPeriod } from '../../../../shared/utils/format.utils';

@Component({
  selector: 'app-card-transactions-widget',
  templateUrl: './card-transactions-widget.component.html',
  styleUrls: ['./card-transactions-widget.component.scss'],
})
export class CardTransactionsWidgetComponent {
  @Input() transactions: CardTransaction[] = [];
  @Input() currentPeriod: string = '';

  readonly formatCurrency = formatCurrency;

  formatPeriod(period: string): string {
    if (!period) return '';
    return formatPeriod(period);
  }

  getTotalAmount(): number {
    return this.transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  getInstallmentLabel(transaction: CardTransaction): string {
    if (!transaction.isInstallment) return '';
    return `${transaction.installmentNumber}/${transaction.totalInstallments}`;
  }

  normalizeIcon(icon: string): string {
    return normalizeIcon(icon);
  }
}
