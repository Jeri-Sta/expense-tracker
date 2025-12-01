import { Component, Input } from '@angular/core';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';

@Component({
  selector: 'app-recent-transactions-widget',
  templateUrl: './recent-transactions-widget.component.html',
  styleUrls: ['./recent-transactions-widget.component.scss']
})
export class RecentTransactionsWidgetComponent {
  @Input() transactions: any[] = [];
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
}
