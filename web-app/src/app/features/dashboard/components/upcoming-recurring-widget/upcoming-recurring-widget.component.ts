import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { RecurringTransaction } from '../../../../core/services/recurring-transaction.service';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';
import { parseLocalDate } from '../../../../shared/utils/date.utils';

type TransactionViewType = 'income' | 'expense';

interface ViewTypeOption {
  label: string;
  value: TransactionViewType;
}

@Component({
  selector: 'app-upcoming-recurring-widget',
  templateUrl: './upcoming-recurring-widget.component.html',
  styleUrls: ['./upcoming-recurring-widget.component.scss'],
})
export class UpcomingRecurringWidgetComponent implements OnInit, OnChanges {
  private readonly STORAGE_KEY = 'upcoming_recurring_view_type';

  @Input() upcomingRecurring: RecurringTransaction[] = [];
  @Input() isLoading = false;

  // View type state
  viewType: TransactionViewType = 'expense';
  viewTypeOptions: ViewTypeOption[] = [
    { label: 'Despesas', value: 'expense' },
    { label: 'Receitas', value: 'income' },
  ];

  // Filtered recurring transactions
  filteredRecurring: RecurringTransaction[] = [];

  private readonly utils = inject(DashboardUtilsService);

  ngOnInit(): void {
    this.loadViewTypeFromStorage();
    this.filterRecurring();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['upcomingRecurring']) {
      this.filterRecurring();
    }
  }

  private loadViewTypeFromStorage(): void {
    const savedType = localStorage.getItem(this.STORAGE_KEY);
    if (savedType === 'income' || savedType === 'expense') {
      this.viewType = savedType;
    }
  }

  onViewTypeChange(): void {
    localStorage.setItem(this.STORAGE_KEY, this.viewType);
    this.filterRecurring();
  }

  private filterRecurring(): void {
    this.filteredRecurring = this.upcomingRecurring.filter((r) => r.type === this.viewType);
  }

  get totalAmount(): number {
    if (!this.filteredRecurring || this.filteredRecurring.length === 0) {
      return 0;
    }
    return this.filteredRecurring.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }

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
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      yearly: 'Anual',
    };
    return labels[frequency] || frequency;
  }
}
