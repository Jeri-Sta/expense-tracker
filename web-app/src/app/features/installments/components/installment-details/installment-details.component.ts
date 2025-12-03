import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InstallmentService } from '../../services';
import { InstallmentPlan, Installment, InstallmentStatus, PayInstallment } from '../../models';

@Component({
  selector: 'app-installment-details',
  templateUrl: './installment-details.component.html',
  styleUrl: './installment-details.component.scss',
})
export class InstallmentDetailsComponent implements OnInit {
  installmentPlan?: InstallmentPlan;
  loading = false;
  paymentDialogVisible = false;
  selectedInstallment?: Installment;
  paymentForm: PayInstallment = {
    paidAmount: 0,
    paidDate: new Date(),
    notes: '',
  };

  // Enum for template
  InstallmentStatus = InstallmentStatus;
  
  // Math object for template
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private installmentService: InstallmentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadInstallmentPlan(id);
    }
  }

  private loadInstallmentPlan(id: string): void {
    this.loading = true;
    this.installmentService.getById(id).subscribe({
      next: (plan) => {
        this.installmentPlan = plan;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar financiamento',
        });
        this.router.navigate(['/installments']);
      },
    });
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
    if (!this.selectedInstallment) return;

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
          this.loadInstallmentPlan(this.installmentPlan!.id);
        },
        error: (error) => {
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getDaysUntilDue(date: Date | string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
      ?.filter(i => i.status === InstallmentStatus.PENDING)
      ?.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  }

  getProgressBarClass(percentage: number): string {
    if (percentage < 30) return 'progress-danger';
    if (percentage < 70) return 'progress-warning';
    return 'progress-success';
  }

  calculateSavings(): number {
    if (!this.installmentPlan) return 0;
    return this.installmentPlan.totalDiscount;
  }

  onBack(): void {
    this.router.navigate(['/installments']);
  }
}