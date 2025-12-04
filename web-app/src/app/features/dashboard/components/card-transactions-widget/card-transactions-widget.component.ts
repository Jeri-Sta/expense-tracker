import { Component, Input } from '@angular/core';
import { CardTransaction } from '../../../credit-cards/models/card-transaction.model';
import { normalizeIcon } from '../../../../shared/utils/icon.utils';

@Component({
  selector: 'app-card-transactions-widget',
  templateUrl: './card-transactions-widget.component.html',
  styleUrls: ['./card-transactions-widget.component.scss'],
})
export class CardTransactionsWidgetComponent {
  @Input() transactions: CardTransaction[] = [];
  @Input() currentPeriod: string = '';

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatPeriod(period: string): string {
    if (!period) return '';
    const [year, month] = period.split('-');
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return `${months[Number.parseInt(month, 10) - 1]}/${year}`;
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
