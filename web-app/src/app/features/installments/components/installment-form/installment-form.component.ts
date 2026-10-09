import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InstallmentService } from '../../services';
import { InstallmentPlan, CreateInstallmentPlan } from '../../models';
import { CategoryService, Category } from '../../../../core/services/category.service';
import { formatCurrency } from '../../../../shared/utils/format.utils';
import { markFormGroupTouched } from '../../../../shared/utils/form.utils';
import { focusFirstInvalidControl } from '../../../../shared/utils/form.utils';

@Component({
  selector: 'app-installment-form',
  templateUrl: './installment-form.component.html',
  styleUrl: './installment-form.component.scss',
})
export class InstallmentFormComponent implements OnInit {
  @ViewChild('installmentFormElement') private installmentFormElement?: ElementRef<HTMLFormElement>;
  form!: FormGroup;
  loading = false;
  loadError: string | null = null;
  categoriesError: string | null = null;
  isEditMode = false;
  installmentPlan?: InstallmentPlan;
  expenseCategories: Category[] = [];
  private planId = '';

  // Use Angular's `inject()` to satisfy @angular-eslint/prefer-inject
  private readonly fb = inject(FormBuilder);
  private readonly installmentService = inject(InstallmentService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadExpenseCategories();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.planId = id;
      this.loadInstallmentPlan(id);
    }
  }

  loadExpenseCategories(): void {
    this.categoriesError = null;
    this.categoryService.getCategories('expense').subscribe({
      next: (categories) => {
        this.expenseCategories = categories;
      },
      error: () => {
        this.categoriesError = 'Não foi possível carregar as categorias. Tente novamente.';
      },
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      categoryId: [null, Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      financedAmount: ['', [Validators.required, Validators.min(0.01), Validators.max(999999999)]],
      installmentValue: [
        '',
        [Validators.required, Validators.min(0.01), Validators.max(999999999)],
      ],
      totalInstallments: ['', [Validators.required, Validators.min(1), Validators.max(999)]],
      startDate: [new Date(), Validators.required],
      description: [''],
    });
  }

  private loadInstallmentPlan(id: string): void {
    this.loading = true;
    this.loadError = null;
    this.installmentService.getById(id).subscribe({
      next: (plan) => {
        this.installmentPlan = plan;
        this.form.patchValue({
          categoryId: plan.categoryId,
          name: plan.name,
          description: plan.description,
          financedAmount: plan.financedAmount,
          installmentValue: plan.installmentValue,
          totalInstallments: plan.totalInstallments,
          startDate: plan.startDate ? new Date(plan.startDate) : new Date(),
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = 'Não foi possível carregar os dados do financiamento. Tente novamente.';
      },
    });
  }

  retryLoad(): void {
    if (this.planId) this.loadInstallmentPlan(this.planId);
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
      totalInstallments,
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
      totalInstallments,
    );
  }

  onSubmit(): void {
    if (this.loading) return;
    if (this.form.valid) {
      const formData = this.form.value;
      const data: CreateInstallmentPlan = {
        categoryId: formData.categoryId,
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
          categoryId: formData.categoryId,
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
      markFormGroupTouched(this.form);
      this.installmentFormElement &&
        focusFirstInvalidControl(this.installmentFormElement.nativeElement);
    }
  }

  onCancel(): void {
    this.router.navigate(['/installments']);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} é obrigatório`;
      if (field.errors['minlength'])
        return `${fieldName} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `${fieldName} deve ser maior que ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} deve ser menor que ${field.errors['max'].max}`;
    }
    return '';
  }

  formatCurrency = formatCurrency;
}
