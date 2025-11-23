import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TransactionService, Transaction, CreateTransactionDto, UpdateTransactionDto, TransactionFilters } from '../../core/services/transaction.service';
import { CategoryService, Category } from '../../core/services/category.service';
import { TransactionType } from '../../core/types/common.types';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  loading = false;
  
  // Pagination
  totalRecords = 0;
  rows = 10;
  first = 0;
  
  // Dialog states
  transactionDialog = false;
  editMode = false;
  submitted = false;
  
  // Forms
  transactionForm!: FormGroup;
  filterForm!: FormGroup;
  
  // Selected transaction for operations
  selectedTransaction!: Transaction;
  
  // Transaction type options
  transactionTypes = [
    { label: 'Receita', value: 'income' as TransactionType },
    { label: 'Despesa', value: 'expense' as TransactionType }
  ];
  
  // Current filters
  currentFilters: TransactionFilters = {
    page: 1,
    limit: 10
  };

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadCategories();
    
    // Verificar se estamos autenticados antes de carregar transações
    this.checkAuthAndLoadData();
  }

  private checkAuthAndLoadData(): void {
    const hasToken = localStorage.getItem('auth_token');
    
    if (!hasToken) {
      this.loading = false;
      this.transactions = [];
      this.totalRecords = 0;
      
      this.messageService.add({
        severity: 'info',
        summary: 'Informação',
        detail: 'Faça login para visualizar suas transações'
      });
      return;
    }
    
    // Carregar transações
    this.loadTransactionsInitial();
  }

  private loadTransactionsInitial(): void {
    this.loading = true;
    
    // Configurar filtros iniciais
    this.currentFilters = {
      page: 1,
      limit: this.rows
    };
    
    this.transactionService.getTransactions(this.currentFilters).subscribe({
      next: (response) => {
        if (response?.data && Array.isArray(response.data)) {
          this.transactions = response.data;
          this.totalRecords = response.meta?.total || 0;
        } else {
          this.transactions = [];
          this.totalRecords = 0;
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.transactions = [];
        this.totalRecords = 0;
        this.loading = false;
        
        if (error.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro de Autenticação',
            detail: 'Sessão expirada. Faça login novamente.'
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar transações'
          });
        }
      }
    });
  }

  initializeForms(): void {
    this.transactionForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(255)]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      type: ['expense' as TransactionType, Validators.required],
      categoryId: ['', Validators.required],
      transactionDate: [new Date(), Validators.required],
      competencyMonth: [new Date(), Validators.required],
      notes: ['', Validators.maxLength(500)]
    });

    this.filterForm = this.fb.group({
      type: [''],
      categoryId: [''],
      startDate: [''],
      endDate: [''],
      competencyMonth: [''],
      search: ['']
    });
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

  loadTransactions(event?: any): void {
    this.loading = true;
    
    // Timeout de segurança para evitar loading infinito
    setTimeout(() => {
      if (this.loading) {
        console.warn('Loading timeout reached, stopping loading indicator');
        this.loading = false;
      }
    }, 15000); // 15 segundos de timeout
    
    // Se há um evento de lazy loading, atualizar os filtros
    if (event) {
      this.first = event.first || 0;
      this.rows = event.rows || 10;
      this.currentFilters.page = Math.floor(this.first / this.rows) + 1;
      this.currentFilters.limit = this.rows;
      
      // Aplicar ordenação se presente
      if (event.sortField) {
        this.currentFilters.sortBy = event.sortField;
        this.currentFilters.sortOrder = event.sortOrder === 1 ? 'ASC' : 'DESC';
      }
    } else {
      // Inicialização sem evento - garantir que os valores básicos estão definidos
      this.currentFilters.page = this.currentFilters.page || 1;
      this.currentFilters.limit = this.currentFilters.limit || this.rows;
    }
    
    this.transactionService.getTransactions(this.currentFilters).subscribe({
      next: (response) => {
        // Verificar se a resposta tem a estrutura esperada
        if (response && response.data && Array.isArray(response.data)) {
          this.transactions = response.data;
          this.totalRecords = response.meta?.total || 0;
        } else {
          this.transactions = [];
          this.totalRecords = 0;
          this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Estrutura de resposta inválida'
          });
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.transactions = [];
        this.totalRecords = 0;
        this.loading = false;
        
        // Verificar se é erro de autenticação
        if (error.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro de Autenticação',
            detail: 'Sessão expirada. Faça login novamente.'
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar transações'
          });
        }
      }
    });
  }

  applyFilters(): void {
    const filterValues = this.filterForm.value;
    
    this.currentFilters = {
      ...this.currentFilters,
      page: 1,
      type: filterValues.type || undefined,
      categoryId: filterValues.categoryId || undefined,
      startDate: filterValues.startDate || undefined,
      endDate: filterValues.endDate || undefined,
      competencyMonth: filterValues.competencyMonth || undefined,
      search: filterValues.search || undefined
    };
    
    this.first = 0;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentFilters = {
      page: 1,
      limit: this.rows
    };
    this.first = 0;
    this.loadTransactions();
  }

  onLazyLoad(event: any): void {
    this.loadTransactions(event);
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.currentFilters = {
      ...this.currentFilters,
      page: Math.floor(event.first / event.rows) + 1,
      limit: event.rows
    };
    this.loadTransactions();
  }

  openNew(): void {
    this.selectedTransaction = {} as Transaction;
    this.editMode = false;
    this.submitted = false;
    this.transactionForm.reset({
      type: 'expense',
      transactionDate: new Date(),
      competencyMonth: new Date(),
      amount: 0
    });
    this.transactionDialog = true;
  }

  editTransaction(transaction: Transaction): void {
    this.selectedTransaction = { ...transaction };
    this.editMode = true;
    this.submitted = false;
    
    this.transactionForm.patchValue({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.category.id,
      transactionDate: new Date(transaction.transactionDate),
      competencyMonth: new Date(transaction.competencyMonth),
      notes: transaction.notes || ''
    });
    
    this.transactionDialog = true;
  }

  deleteTransaction(transaction: Transaction): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a transação "${transaction.description}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.transactionService.deleteTransaction(transaction.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Transação excluída com sucesso'
            });
            this.loadTransactions();
          },
          error: (error) => {
            console.error('Error deleting transaction:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir transação'
            });
          }
        });
      }
    });
  }

  saveTransaction(): void {
    this.submitted = true;
    
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      
      if (this.editMode) {
        const updateDto: UpdateTransactionDto = {
          description: formValue.description,
          amount: formValue.amount,
          type: formValue.type,
          categoryId: formValue.categoryId,
          transactionDate: formValue.transactionDate,
          competencyMonth: formValue.competencyMonth,
          notes: formValue.notes
        };
        
        this.transactionService.updateTransaction(this.selectedTransaction.id, updateDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Transação atualizada com sucesso'
            });
            this.hideDialog();
            this.loadTransactions();
          },
          error: (error) => {
            console.error('Error updating transaction:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao atualizar transação'
            });
          }
        });
      } else {
        const createDto: CreateTransactionDto = {
          description: formValue.description,
          amount: formValue.amount,
          type: formValue.type,
          categoryId: formValue.categoryId,
          transactionDate: formValue.transactionDate,
          competencyMonth: formValue.competencyMonth,
          notes: formValue.notes
        };
        
        this.transactionService.createTransaction(createDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Transação criada com sucesso'
            });
            this.hideDialog();
            this.loadTransactions();
          },
          error: (error) => {
            console.error('Error creating transaction:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar transação'
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

  openTransactionDialog(): void {
    this.openNew();
  }

  get editingTransaction(): boolean {
    return this.editMode;
  }

  get showTransactionDialog(): boolean {
    return this.transactionDialog;
  }

  set showTransactionDialog(value: boolean) {
    this.transactionDialog = value;
  }

  closeTransactionDialog(): void {
    this.hideDialog();
  }

  getCategoryDropdownOptions(): any[] {
    const currentType = this.transactionForm.get('type')?.value;
    if (!currentType) return [];
    
    return this.getCategoriesByType(currentType).map(cat => ({
      label: cat.name,
      value: cat.id,
      icon: cat.icon,
      color: cat.color
    }));
  }

  exportTransactions(): void {
    this.transactionService.exportTransactions(this.currentFilters).subscribe({
      next: (blob) => {
        const url = globalThis.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transacoes_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        globalThis.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Transações exportadas com sucesso'
        });
      },
      error: (error) => {
        console.error('Error exporting transactions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao exportar transações'
        });
      }
    });
  }

  getCategoriesByType(type: TransactionType): Category[] {
    return this.categories.filter(cat => cat.type === type);
  }

  onTypeChange(): void {
    // Reset category when type changes
    this.transactionForm.patchValue({ categoryId: '' });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getTransactionTypeLabel(type: TransactionType): string {
    return type === 'income' ? 'Receita' : 'Despesa';
  }

  getTransactionTypeClass(type: TransactionType): string {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  }

  getTypeOptions() {
    return [
      {label: 'Receita', value: 'income', icon: 'pi pi-arrow-up'},
      {label: 'Despesa', value: 'expense', icon: 'pi pi-arrow-down'}
    ];
  }
}