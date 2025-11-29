import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RecurringTransactionService, RecurringTransaction, CreateRecurringTransactionDto, UpdateRecurringTransactionDto } from '../../core/services/recurring-transaction.service';
import { CategoryService, Category } from '../../core/services/category.service';
import { TransactionType } from '../../core/types/common.types';
import { normalizeIcon } from '../../shared/utils/icon.utils';

@Component({
  selector: 'app-recurring-transactions',
  templateUrl: './recurring-transactions.component.html',
  styleUrls: ['./recurring-transactions.component.scss']
})
export class RecurringTransactionsComponent implements OnInit {
  normalizeIcon = normalizeIcon;
  recurringTransactions: RecurringTransaction[] = [];
  categories: Category[] = [];
  loading = false;
  
  // Dialog states
  transactionDialog = false;
  scheduleDialog = false;
  editMode = false;
  submitted = false;
  
  // Forms
  transactionForm!: FormGroup;
  
  // Selected transaction for operations
  selectedTransaction!: RecurringTransaction;
  
  // Transaction type options
  transactionTypes = [
    { label: 'Receita', value: 'income' as TransactionType },
    { label: 'Despesa', value: 'expense' as TransactionType }
  ];
  
  // Frequency options
  frequencyOptions: Array<{value: string, label: string}> = [];

  constructor(
    private fb: FormBuilder,
    private recurringTransactionService: RecurringTransactionService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadFrequencyOptions();
    this.loadCategories();
    this.loadRecurringTransactions();
  }

  initializeForm(): void {
    this.transactionForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(255)]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      type: ['expense' as TransactionType, Validators.required],
      categoryId: ['', Validators.required],
      frequency: ['monthly', Validators.required],
      interval: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      nextExecution: [new Date(), Validators.required],
      endDate: [''],
      maxExecutions: ['', [Validators.min(1)]],
      isActive: [true],
      notes: ['', Validators.maxLength(500)]
    });
  }

  loadFrequencyOptions(): void {
    this.frequencyOptions = this.recurringTransactionService.getFrequencyOptions();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter(cat => cat.isActive);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar categorias'
        });
      }
    });
  }

  loadRecurringTransactions(): void {
    this.loading = true;
    this.recurringTransactionService.getRecurringTransactions().subscribe({
      next: (transactions) => {
        this.recurringTransactions = transactions.sort((a, b) => {
          // Sort by next execution date, then by creation date
          if (a.nextExecution && b.nextExecution) {
            return new Date(a.nextExecution).getTime() - new Date(b.nextExecution).getTime();
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading recurring transactions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar transações recorrentes'
        });
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.selectedTransaction = {} as RecurringTransaction;
    this.editMode = false;
    this.submitted = false;
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    
    this.transactionForm.reset({
      type: 'expense',
      frequency: 'monthly',
      interval: 1,
      nextExecution: nextMonth,
      isActive: true,
      amount: 0
    });
    this.transactionDialog = true;
  }

  editTransaction(transaction: RecurringTransaction): void {
    this.selectedTransaction = { ...transaction };
    this.editMode = true;
    this.submitted = false;
    
    this.transactionForm.patchValue({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.category.id,
      frequency: transaction.frequency,
      interval: transaction.interval,
      nextExecution: new Date(transaction.nextExecution),
      endDate: transaction.endDate ? new Date(transaction.endDate) : null,
      maxExecutions: transaction.maxExecutions || '',
      isActive: transaction.isActive,
      notes: transaction.notes || ''
    });
    
    this.transactionDialog = true;
  }

  deleteTransaction(transaction: RecurringTransaction): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a transação recorrente "${transaction.description}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.recurringTransactionService.deleteRecurringTransaction(transaction.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Transação recorrente excluída com sucesso'
            });
            this.loadRecurringTransactions();
          },
          error: (error) => {
            console.error('Error deleting recurring transaction:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir transação recorrente'
            });
          }
        });
      }
    });
  }

  executeTransaction(transaction: RecurringTransaction): void {
    this.confirmationService.confirm({
      message: `Executar a transação "${transaction.description}" agora?`,
      header: 'Confirmar Execução',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.recurringTransactionService.executeRecurringTransaction(transaction.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Transação executada com sucesso'
            });
            this.loadRecurringTransactions();
          },
          error: (error) => {
            console.error('Error executing recurring transaction:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao executar transação'
            });
          }
        });
      }
    });
  }

  toggleActive(transaction: RecurringTransaction): void {
    const newStatus = !transaction.isActive;
    this.recurringTransactionService.updateRecurringTransaction(transaction.id, {
      isActive: newStatus
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Transação ${newStatus ? 'ativada' : 'desativada'} com sucesso`
        });
        this.loadRecurringTransactions();
      },
      error: (error) => {
        console.error('Error toggling transaction status:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao alterar status da transação'
        });
      }
    });
  }

  saveTransaction(): void {
    this.submitted = true;
    
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      
      if (this.editMode) {
        const updateDto: UpdateRecurringTransactionDto = {
          description: formValue.description,
          amount: formValue.amount,
          type: formValue.type,
          categoryId: formValue.categoryId,
          frequency: formValue.frequency,
          interval: formValue.interval,
          nextExecution: formValue.nextExecution,
          endDate: formValue.endDate || undefined,
          maxExecutions: formValue.maxExecutions || undefined,
          isActive: formValue.isActive,
          notes: formValue.notes
        };
        
        this.recurringTransactionService.updateRecurringTransaction(this.selectedTransaction.id, updateDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Transação recorrente atualizada com sucesso'
            });
            this.hideDialog();
            this.loadRecurringTransactions();
          },
          error: (error) => {
            console.error('Error updating recurring transaction:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao atualizar transação recorrente'
            });
          }
        });
      } else {
        const createDto: CreateRecurringTransactionDto = {
          description: formValue.description,
          amount: formValue.amount,
          type: formValue.type,
          categoryId: formValue.categoryId,
          frequency: formValue.frequency,
          interval: formValue.interval,
          nextExecution: formValue.nextExecution,
          endDate: formValue.endDate || undefined,
          maxExecutions: formValue.maxExecutions || undefined,
          isActive: formValue.isActive,
          notes: formValue.notes
        };
        
        this.recurringTransactionService.createRecurringTransaction(createDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Transação recorrente criada com sucesso'
            });
            this.hideDialog();
            this.loadRecurringTransactions();
          },
          error: (error) => {
            console.error('Error creating recurring transaction:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar transação recorrente'
            });
          }
        });
      }
    }
  }

  hideDialog(): void {
    this.transactionDialog = false;
    this.submitted = false;
    this.transactionForm.reset();
  }

  getCategoriesByType(type: TransactionType): Category[] {
    return this.categories.filter(cat => cat.type === type);
  }

  onTypeChange(): void {
    this.transactionForm.patchValue({ categoryId: '' });
  }

  calculateNextExecution(): void {
    const frequency = this.transactionForm.get('frequency')?.value;
    const interval = this.transactionForm.get('interval')?.value || 1;
    const currentNext = this.transactionForm.get('nextExecution')?.value;
    
    if (frequency && currentNext) {
      const nextDate = this.recurringTransactionService.calculateNextExecution(currentNext, frequency, interval);
      // Show preview or validation
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR');
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('pt-BR');
  }

  getTransactionTypeLabel(type: TransactionType): string {
    return type === 'income' ? 'Receita' : 'Despesa';
  }

  getTransactionTypeClass(type: TransactionType): string {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  }

  getStatusLabel(transaction: RecurringTransaction): string {
    if (transaction.isCompleted) return 'Concluída';
    if (!transaction.isActive) return 'Inativa';
    return 'Ativa';
  }

  getStatusSeverity(transaction: RecurringTransaction): 'success' | 'warning' | 'info' | 'danger' {
    if (transaction.isCompleted) return 'info';
    if (!transaction.isActive) return 'warning';
    return 'success';
  }

  formatFrequency(frequency: string, interval: number): string {
    return this.recurringTransactionService.formatFrequency(frequency, interval);
  }

  isOverdue(transaction: RecurringTransaction): boolean {
    if (!transaction.nextExecution || !transaction.isActive || transaction.isCompleted) {
      return false;
    }
    return new Date(transaction.nextExecution) < new Date();
  }

  getDaysUntilExecution(transaction: RecurringTransaction): number {
    if (!transaction.nextExecution) return 0;
    const today = new Date();
    const nextExecution = new Date(transaction.nextExecution);
    const diffTime = nextExecution.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getExecutionProgress(transaction: RecurringTransaction): number {
    if (!transaction.maxExecutions) return 0;
    return (transaction.executionCount / transaction.maxExecutions) * 100;
  }

  // Auxiliary methods for dropdowns
  getCategoryOptionsForCurrentType() {
    const type = this.transactionForm.get('type')?.value;
    if (!type) return [];
    return this.getCategoriesByType(type).map(c => ({
      label: c.name,
      value: c.id,
      icon: c.icon,
      color: c.color
    }));
  }

  getFrequencyOptions() {
    return [
      { label: 'Diário', value: 'daily' },
      { label: 'Semanal', value: 'weekly' },
      { label: 'Mensal', value: 'monthly' },
      { label: 'Anual', value: 'yearly' }
    ];
  }

  getIntervalOptions() {
    const intervals = [];
    for (let i = 1; i <= 30; i++) {
      intervals.push({ label: i.toString(), value: i });
    }
    return intervals;
  }

  getExecutionTypeOptions() {
    return [
      { label: 'Indefinido', value: 'indefinite' },
      { label: 'Número específico', value: 'count' },
      { label: 'Data limite', value: 'date' }
    ];
  }
}