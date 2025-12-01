import { Component, Input } from '@angular/core';
import { RecurringTransaction } from '../../../../core/services/recurring-transaction.service';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';
import { parseLocalDate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-upcoming-recurring-widget',
  templateUrl: './upcoming-recurring-widget.component.html',
  styleUrls: ['./upcoming-recurring-widget.component.scss']
})
export class UpcomingRecurringWidgetComponent {
  @Input() upcomingRecurring: RecurringTransaction[] = [];
  @Input() isLoading = false;

  constructor(private readonly utils: DashboardUtilsService) {}

  formatCurrency(value: number): string {
    return this.utils.formatCurrency(value);
  }

  formatDate(date: string | Date): string {
    return this.utils.formatDate(date);
  }

  normalizeIcon(icon: string): string {
    return this.utils.normalizeIcon(icon);
  }

  getTransactionColorClass(type: string): string {
    return this.utils.getTransactionColorClass(type);
  }

  getTransactionSign(type: string): string {
    return this.utils.getTransactionSign(type);
  }

  getDaysUntilExecution(transaction: RecurringTransaction): number {
    if (!transaction.nextExecution) return 0;
    const today = new Date();
    const nextExecution = parseLocalDate(transaction.nextExecution);
    const diffTime = nextExecution.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(transaction: RecurringTransaction): boolean {
    if (!transaction.nextExecution || !transaction.isActive || transaction.isCompleted) {
      return false;
    }
    return parseLocalDate(transaction.nextExecution) < new Date();
  }

  getFrequencyLabel(frequency: string): string {
    const labels: Record<string, string> = {
      'daily': 'Diário',
      'weekly': 'Semanal',
      'monthly': 'Mensal',
      'quarterly': 'Trimestral',
      'yearly': 'Anual'
    };
    return labels[frequency] || frequency;
  }
}
