import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InstallmentService } from '../../services';
import { InstallmentPlan, Installment, InstallmentStatus, PayInstallment } from '../../models';
import { formatCurrency } from '../../../../shared/utils/format.utils';
import { getDaysUntilDate } from '../../../../shared/utils/date.utils';
import { getProgressBarClass } from '../../../../shared/utils/ui.utils';
import { ResponsiveAction } from '../../../../shared/components/responsive-actions/responsive-actions.component';

@Component({
  selector: 'app-installment-details',
  templateUrl: './installment-details.component.html',
  styleUrl: './installment-details.component.scss',
})
export class InstallmentDetailsComponent implements OnInit {
  installmentPlan?: InstallmentPlan;
  loading = false;
  loadError: string | null = null;
  private planId = '';
  paymentDialogVisible = false;
  paymentSaving = false;
  selectedInstallment?: Installment;
  paymentForm: PayInstallment = {
    paidAmount: 0,
    paidDate: new Date(),
    notes: '',
  };
  @ViewChild('paymentNgForm') private paymentNgForm?: NgForm;

  // Enum for template
  InstallmentStatus = InstallmentStatus;

  formatCurrency = formatCurrency;
  getProgressBarClass = getProgressBarClass;
  readonly Math = Math;

  get primaryPageAction(): ResponsiveAction {
    return { label: 'Editar', icon: 'pi pi-pencil', command: () => this.onEdit() };
  }

  get secondaryPageActions(): ResponsiveAction[] {
    return [
      {
        label: 'Voltar',
        icon: 'pi pi-arrow-left',
        intent: 'secondary',
        command: () => this.onBack(),
      },
      { label: 'Excluir', icon: 'pi pi-trash', intent: 'danger', command: () => this.onDelete() },
    ];
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // Use Angular's `inject()` to satisfy @angular-eslint/prefer-inject
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly installmentService = inject(InstallmentService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.planId = id;
      this.loadInstallmentPlan(id);
    }
  }

  loadInstallmentPlan(id: string): void {
    this.loading = true;
    this.loadError = null;
    this.installmentService.getById(id).subscribe({
      next: (plan) => {
        this.installmentPlan = plan;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = 'Não foi possível carregar este financiamento. Tente novamente.';
      },
    });
  }

  retryLoad(): void {
    if (this.planId) this.loadInstallmentPlan(this.planId);
  }

  onPayInstallment(installment: Installment): void {
    if (installment.status === InstallmentStatus.PAID) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Esta parcela já foi paga',
      });
      return;
    }

    this.selectedInstallment = installment;
    this.paymentForm = {
      paidAmount: installment.originalAmount,
      paidDate: new Date(),
      notes: '',
    };
    this.paymentDialogVisible = true;
  }

  onConfirmPayment(): void {
    if (!this.selectedInstallment || this.paymentSaving || !this.paymentNgForm) return;
    this.paymentNgForm.form.markAllAsTouched();
    if (this.paymentNgForm.invalid) {
      const invalidControl = document.querySelector<HTMLElement>(
        '.payment-form .ng-invalid input, .payment-form .ng-invalid[tabindex]',
      );
      invalidControl?.focus();
      invalidControl?.scrollIntoView({ block: 'center', behavior: 'auto' });
      return;
    }

    this.paymentSaving = true;
    this.installmentService
      .payInstallment(this.selectedInstallment.id, this.paymentForm)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Parcela paga com sucesso',
          });
          this.paymentDialogVisible = false;
          this.paymentSaving = false;
          this.loadInstallmentPlan(this.installmentPlan!.id);
        },
        error: (error) => {
          this.paymentSaving = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Erro ao pagar parcela',
          });
        },
      });
  }

  onCancelPayment(): void {
    this.paymentDialogVisible = false;
    this.selectedInstallment = undefined;
  }

  onDeletePayment(installment: Installment): void {
    if (installment.status !== InstallmentStatus.PAID) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Esta parcela não está paga',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o pagamento da parcela ${installment.installmentNumber}? O valor pago de ${this.formatCurrency(installment.paidAmount || 0)} será removido.`,
      header: 'Confirmar Exclusão de Pagamento',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.installmentService.deletePayment(installment.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Pagamento excluído com sucesso',
            });
            this.loadInstallmentPlan(this.installmentPlan!.id);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: error.error?.message || 'Erro ao excluir pagamento',
            });
          },
        });
      },
    });
  }

  onEdit(): void {
    this.router.navigate(['/installments', this.installmentPlan!.id, 'edit']);
  }

  onDelete(): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o financiamento "${this.installmentPlan!.name}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.installmentService.delete(this.installmentPlan!.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Financiamento excluído com sucesso',
            });
            this.router.navigate(['/installments']);
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

  getStatusSeverity(status: InstallmentStatus): 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case InstallmentStatus.PAID:
        return 'success';
      case InstallmentStatus.OVERDUE:
        return 'danger';
      case InstallmentStatus.PENDING:
        return 'info';
      case InstallmentStatus.CANCELLED:
        return 'warning';
      default:
        return 'info';
    }
  }

  getStatusLabel(status: InstallmentStatus): string {
    switch (status) {
      case InstallmentStatus.PAID:
        return 'Paga';
      case InstallmentStatus.OVERDUE:
        return 'Vencida';
      case InstallmentStatus.PENDING:
        return 'Pendente';
      case InstallmentStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  }

  getDaysUntilDue(date: Date | string): number {
    return getDaysUntilDate(date);
  }

  getDueDateClass(installment: Installment): string {
    if (installment.status === InstallmentStatus.PAID) return 'text-green-500';
    if (installment.status === InstallmentStatus.OVERDUE) return 'text-red-500';

    const daysUntilDue = this.getDaysUntilDue(installment.dueDate);
    if (daysUntilDue < 0) return 'text-red-500';
    if (daysUntilDue <= 7) return 'text-orange-500';
    return 'text-gray-500';
  }

  getNextInstallment(): Installment | undefined {
    return this.installmentPlan?.installments
      ?.filter((i) => i.status === InstallmentStatus.PENDING)
      ?.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  }

  onBack(): void {
    this.router.navigate(['/installments']);
  }
}
