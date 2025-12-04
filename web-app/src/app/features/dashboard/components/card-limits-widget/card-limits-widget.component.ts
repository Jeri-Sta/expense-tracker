import { Component, Input } from '@angular/core';
import { CreditCardSummary } from '../../../../core/services/transaction.service';

@Component({
  selector: 'app-card-limits-widget',
  templateUrl: './card-limits-widget.component.html',
  styleUrls: ['./card-limits-widget.component.scss'],
})
export class CardLimitsWidgetComponent {
  @Input() creditCards: CreditCardSummary[] = [];

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  getUsageSeverity(percentage: number): string {
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'success';
  }

  getProgressBarClass(percentage: number): string {
    if (percentage >= 90) return 'usage-danger';
    if (percentage >= 70) return 'usage-warning';
    return 'usage-success';
  }

  getTotalLimit(): number {
    return this.creditCards.reduce((sum, card) => sum + card.totalLimit, 0);
  }

  getTotalUsed(): number {
    return this.creditCards.reduce((sum, card) => sum + card.usedLimit, 0);
  }

  getTotalAvailable(): number {
    return this.creditCards.reduce((sum, card) => sum + card.availableLimit, 0);
  }

  getOverallUsagePercentage(): number {
    const totalLimit = this.getTotalLimit();
    if (totalLimit === 0) return 0;
    return (this.getTotalUsed() / totalLimit) * 100;
  }
}
