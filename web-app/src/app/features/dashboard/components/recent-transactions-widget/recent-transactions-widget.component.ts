import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';
import { parseLocalDate } from '../../../../shared/utils/date.utils';

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

  // Payment status methods
  getPaymentStatusLabel(status?: string): string {
    return status === 'paid' ? 'Pago' : 'Pendente';
  }

  getPaymentStatusClass(transaction: any): string {
    if (transaction.paymentStatus === 'paid') {
      return 'bg-green-100 text-green-700';
    }
    // Check if transaction is overdue (pending and transaction date has passed)
    if (this.isOverdue(transaction)) {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-yellow-100 text-yellow-700';
  }

  getPaymentStatusIcon(transaction: any): string {
    if (transaction.paymentStatus === 'paid') {
      return 'pi pi-check-circle';
    }
    if (this.isOverdue(transaction)) {
      return 'pi pi-exclamation-triangle';
    }
    return 'pi pi-clock';
  }

  getPaymentStatusTooltip(transaction: any): string {
    if (transaction.paymentStatus === 'paid') {
      if (transaction.paidDate) {
        const paidDate = parseLocalDate(transaction.paidDate);
        return `Pago em ${paidDate.toLocaleDateString('pt-BR')}`;
      }
      return 'Pago';
    }
    if (this.isOverdue(transaction)) {
      const transactionDate = parseLocalDate(transaction.transactionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysOverdue = Math.floor((today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
      return `Atrasado há ${daysOverdue} dia${daysOverdue > 1 ? 's' : ''}`;
    }
    return 'Pendente';
  }

  private isOverdue(transaction: any): boolean {
    if (transaction.paymentStatus === 'paid') return false;
    const transactionDate = parseLocalDate(transaction.transactionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactionDate < today;
  }
}
