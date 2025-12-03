import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';

type TransactionViewType = 'income' | 'expense';

interface ViewTypeOption {
  label: string;
  value: TransactionViewType;
}

@Component({
  selector: 'app-recent-transactions-widget',
  templateUrl: './recent-transactions-widget.component.html',
  styleUrls: ['./recent-transactions-widget.component.scss']
})
export class RecentTransactionsWidgetComponent implements OnInit, OnChanges {
  private readonly STORAGE_KEY = 'monthly_transactions_view_type';

  @Input() transactions: any[] = [];
  @Input() isLoading = false;
  @Input() selectedMonthName = '';
  @Input() selectedYear = new Date().getFullYear();

  // View type state
  viewType: TransactionViewType = 'expense';
  viewTypeOptions: ViewTypeOption[] = [
    { label: 'Despesas', value: 'expense' },
    { label: 'Receitas', value: 'income' }
  ];

  // Filtered transactions
  filteredTransactions: any[] = [];

  constructor(private readonly utils: DashboardUtilsService) {}

  ngOnInit(): void {
    this.loadViewTypeFromStorage();
    this.filterTransactions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactions']) {
      this.filterTransactions();
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
    this.filterTransactions();
  }

  private filterTransactions(): void {
    this.filteredTransactions = this.transactions.filter(
      (t) => t.type === this.viewType
    );
  }

  get subtitleText(): string {
    if (this.selectedMonthName && this.selectedYear) {
      return `${this.selectedMonthName} ${this.selectedYear}`;
    }
    return 'Movimentações do mês';
  }

  get totalAmount(): number {
    if (!this.filteredTransactions || this.filteredTransactions.length === 0) {
      return 0;
    }
    return this.filteredTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
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
}
