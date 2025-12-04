import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InstallmentService } from '../../services';
import { InstallmentPlanSummary } from '../../models';

@Component({
  selector: 'app-installment-list',
  templateUrl: './installment-list.component.html',
  styleUrl: './installment-list.component.scss',
})
export class InstallmentListComponent implements OnInit {
  installmentPlans: InstallmentPlanSummary[] = [];
  loading = false;

  // Math object for template
  Math = Math;

  constructor(
    private installmentService: InstallmentService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

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

  getProgressBarClass(percentage: number): string {
    if (percentage < 30) return 'progress-danger';
    if (percentage < 70) return 'progress-warning';
    return 'progress-success';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getDaysUntilDue(date?: Date): number | null {
    if (!date) return null;
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDueDateClass(daysUntilDue: number | null): string {
    if (daysUntilDue === null) return '';
    if (daysUntilDue < 0) return 'text-red-500';
    if (daysUntilDue <= 7) return 'text-orange-500';
    return 'text-green-500';
  }
}
