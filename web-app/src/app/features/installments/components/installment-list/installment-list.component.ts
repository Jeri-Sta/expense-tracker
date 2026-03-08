import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InstallmentService } from '../../services';
import { InstallmentPlanSummary } from '../../models';
import { formatCurrency } from '../../../../shared/utils/format.utils';
import { getDaysUntilDate } from '../../../../shared/utils/date.utils';
import { getProgressBarClass } from '../../../../shared/utils/ui.utils';

@Component({
  selector: 'app-installment-list',
  templateUrl: './installment-list.component.html',
  styleUrl: './installment-list.component.scss',
})
export class InstallmentListComponent implements OnInit {
  installmentPlans: InstallmentPlanSummary[] = [];
  loading = false;

  formatCurrency = formatCurrency;
  getProgressBarClass = getProgressBarClass;
  readonly Math = Math;

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // Use Angular's `inject()` to satisfy @angular-eslint/prefer-inject
  private readonly installmentService = inject(InstallmentService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadInstallmentPlans();
  }

  loadInstallmentPlans(): void {
    this.loading = true;
    this.installmentService.getAll().subscribe({
      next: (plans) => {
        this.installmentPlans = plans;
        this.loading = false;
      },
      error: (_error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar financiamentos',
        });
        this.loading = false;
      },
    });
  }

  onNewInstallmentPlan(): void {
    this.router.navigate(['/installments/new']);
  }

  onViewDetails(id: string): void {
    this.router.navigate(['/installments', id]);
  }

  onEdit(id: string): void {
    this.router.navigate(['/installments', id, 'edit']);
  }

  onDelete(plan: InstallmentPlanSummary): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o financiamento "${plan.name}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.installmentService.delete(plan.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Financiamento excluído com sucesso',
            });
            this.loadInstallmentPlans();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: error.error?.message || 'Erro ao excluir financiamento',
            });
          },
        });
      },
    });
  }

  getDaysUntilDue(date?: Date): number | null {
    if (!date) return null;
    return getDaysUntilDate(date);
  }

  getDueDateClass(daysUntilDue: number | null): string {
    if (daysUntilDue === null) return '';
    if (daysUntilDue < 0) return 'text-red-500';
    if (daysUntilDue <= 7) return 'text-orange-500';
    return 'text-green-500';
  }
}
