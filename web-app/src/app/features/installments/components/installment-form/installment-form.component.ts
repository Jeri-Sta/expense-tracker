import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InstallmentService } from '../../services';
import { InstallmentPlan, CreateInstallmentPlan } from '../../models';

@Component({
  selector: 'app-installment-form',
  templateUrl: './installment-form.component.html',
  styleUrl: './installment-form.component.scss',
})
export class InstallmentFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEditMode = false;
  installmentPlan?: InstallmentPlan;

  constructor(
    private fb: FormBuilder,
    private installmentService: InstallmentService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadInstallmentPlan(id);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      financedAmount: [
        '',
        [Validators.required, Validators.min(0.01), Validators.max(999999999)],
      ],
      installmentValue: [
        '',
        [Validators.required, Validators.min(0.01), Validators.max(999999999)],
      ],
      totalInstallments: [
        '',
        [Validators.required, Validators.min(1), Validators.max(999)],
      ],
      startDate: [new Date(), Validators.required],
      description: [''],
    });

    // Listen for value changes to auto-calculate
    this.form.get('financedAmount')?.valueChanges.subscribe(() => this.autoCalculate());
    this.form.get('installmentValue')?.valueChanges.subscribe(() => this.autoCalculate());
    this.form.get('totalInstallments')?.valueChanges.subscribe(() => this.autoCalculate());
  }

  private loadInstallmentPlan(id: string): void {
    this.loading = true;
    this.installmentService.getById(id).subscribe({
      next: (plan) => {
        this.installmentPlan = plan;
        this.form.patchValue({
          name: plan.name,
          description: plan.description,
        });
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

  private autoCalculate(): void {
    // Não é necessário fazer nenhum cálculo automático aqui
    // Todos os cálculos são feitos nos métodos getter para exibição
  }

  getTotalAmount(): number {
    const installmentValue = this.form.get('installmentValue')?.value || 0;
    const totalInstallments = this.form.get('totalInstallments')?.value || 0;
    return this.installmentService.calculateTotalAmount(installmentValue, totalInstallments);
  }

  getTotalInterest(): number {
    const totalAmount = this.getTotalAmount();
    const financedAmount = this.form.get('financedAmount')?.value || 0;
    return this.installmentService.calculateInterest(totalAmount, financedAmount);
  }

  getEffectiveInterestRate(): number {
    const financedAmount = this.form.get('financedAmount')?.value || 0;
    const installmentValue = this.form.get('installmentValue')?.value || 0;
    const totalInstallments = this.form.get('totalInstallments')?.value || 0;
    
    if (financedAmount <= 0 || installmentValue <= 0 || totalInstallments <= 0) {
      return 0;
    }
    
    // Usa o método do service para cálculo consistente
    return this.installmentService.calculateAutoInterestRate(
      financedAmount,
      installmentValue,
      totalInstallments
    );
  }

  /**
   * Calcula a taxa de juros simples (total) para exibição
   */
  getSimpleInterestRate(): number {
    const financedAmount = this.form.get('financedAmount')?.value || 0;
    const installmentValue = this.form.get('installmentValue')?.value || 0;
    const totalInstallments = this.form.get('totalInstallments')?.value || 0;
    
    if (financedAmount <= 0 || installmentValue <= 0 || totalInstallments <= 0) {
      return 0;
    }
    
    return this.installmentService.calculateSimpleInterestRate(
      financedAmount,
      installmentValue,
      totalInstallments
    );
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      const data: CreateInstallmentPlan = {
        name: formData.name,
        financedAmount: formData.financedAmount,
        installmentValue: formData.installmentValue,
        totalInstallments: formData.totalInstallments,
        startDate: formData.startDate,
        description: formData.description || undefined,
      };

      this.loading = true;

      if (this.isEditMode && this.installmentPlan) {
        // Update mode (limited fields)
        const updateData = {
          name: data.name,
          description: data.description,
        };
        
        this.installmentService.update(this.installmentPlan.id, updateData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Financiamento atualizado com sucesso',
            });
            this.router.navigate(['/installments']);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: error.error?.message || 'Erro ao atualizar financiamento',
            });
            this.loading = false;
          },
        });
      } else {
        // Create mode
        this.installmentService.create(data).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Financiamento criado com sucesso',
            });
            this.router.navigate(['/installments']);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: error.error?.message || 'Erro ao criar financiamento',
            });
            this.loading = false;
          },
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/installments']);
  }

  private markFormGroupTouched(): void {
    for (const key of Object.keys(this.form.controls)) {
      const control = this.form.get(key);
      control?.markAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} é obrigatório`;
      if (field.errors['minlength']) return `${fieldName} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `${fieldName} deve ser maior que ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} deve ser menor que ${field.errors['max'].max}`;
    }
    return '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}