import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';
import { InvoiceSummary, InvoiceStatus } from '../../../../core/services/transaction.service';
import { parseLocalDate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-invoices-widget',
  templateUrl: './invoices-widget.component.html',
  styleUrls: ['./invoices-widget.component.scss'],
})
export class InvoicesWidgetComponent {
  @Input() invoices: InvoiceSummary[] = [];
  @Input() isLoading = false;
  @Input() selectedMonthName = '';
  @Input() selectedYear = new Date().getFullYear();

  constructor(
    private readonly utils: DashboardUtilsService,
    private readonly router: Router,
  ) {}

  get subtitleText(): string {
    if (this.selectedMonthName && this.selectedYear) {
      return `Vencimento em ${this.selectedMonthName} ${this.selectedYear}`;
    }
    return 'Faturas do mês';
  }

  get totalAmount(): number {
    if (!this.invoices || this.invoices.length === 0) {
      return 0;
    }
    return this.invoices.reduce((sum, invoice) => sum + (Number(invoice.totalAmount) || 0), 0);
  }

  formatCurrency(value: number): string {
    return this.utils.formatCurrency(value);
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const parsedDate = typeof date === 'string' ? parseLocalDate(date) : date;
    return parsedDate.toLocaleDateString('pt-BR');
  }

  getStatusLabel(status: InvoiceStatus): string {
    const labels: Record<InvoiceStatus, string> = {
      open: 'Aberta',
      closed: 'Fechada',
      paid: 'Paga',
    };
    return labels[status] || status;
  }

  getStatusClass(invoice: InvoiceSummary): string {
    if (invoice.status === 'paid') {
      return 'bg-green-100 text-green-700';
    }
    if (invoice.isOverdue) {
      return 'bg-red-100 text-red-700';
    }
    if (invoice.status === 'closed') {
      return 'bg-blue-100 text-blue-700';
    }
    return 'bg-yellow-100 text-yellow-700';
  }

  getStatusIcon(invoice: InvoiceSummary): string {
    if (invoice.status === 'paid') {
      return 'pi pi-check-circle';
    }
    if (invoice.isOverdue) {
      return 'pi pi-exclamation-triangle';
    }
    if (invoice.status === 'closed') {
      return 'pi pi-lock';
    }
    return 'pi pi-clock';
  }

  getStatusTooltip(invoice: InvoiceSummary): string {
    if (invoice.status === 'paid') {
      if (invoice.paidAt) {
        const paidDate = parseLocalDate(invoice.paidAt);
        return `Paga em ${paidDate.toLocaleDateString('pt-BR')}`;
      }
      return 'Paga';
    }
    if (invoice.isOverdue) {
      const dueDate = parseLocalDate(invoice.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return `Atrasada há ${daysOverdue} dia${daysOverdue > 1 ? 's' : ''}`;
    }
    if (invoice.status === 'closed') {
      return 'Fatura fechada - aguardando pagamento';
    }
    return 'Fatura em aberto';
  }

  navigateToInvoice(invoice: InvoiceSummary): void {
    this.router.navigate(['/credit-cards', invoice.creditCardId, 'transactions'], {
      queryParams: { period: invoice.period },
    });
  }
}
