import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import {
  TransactionService,
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  ProjectionFilters,
  PaymentStatus,
} from '../../core/services/transaction.service';
import { CategoryService, Category } from '../../core/services/category.service';
import { TransactionType } from '../../core/types/common.types';
import { normalizeIcon } from '../../shared/utils/icon.utils';
import {
  parseLocalDate,
  parseCompetencyPeriod,
  formatDateToString,
  formatCompetencyPeriod,
} from '../../shared/utils/date.utils';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  loading = false;

  // Pagination
  totalRecords = 0;
  rows = 10;
  first = 0;

  // Sorting
  sortField = 'transactionDate';
  sortOrder = -1; // -1 = DESC, 1 = ASC

  // Dialog states
  transactionDialog = false;
  newMode = false;
  editMode = false;
  cloneMode = false;
  submitted = false;

  // Forms
  transactionForm!: FormGroup;
  filterForm!: FormGroup;

  // Selected transaction for operations
  selectedTransaction!: Transaction;

  // Transaction type options
  transactionTypes = [
    { label: 'Receita', value: 'income' as TransactionType },
    { label: 'Despesa', value: 'expense' as TransactionType },
  ];

  // Current filters
  currentFilters: ProjectionFilters = {
    page: 1,
    limit: 10,
  };

  // Period filter
  selectedPeriod: string = '';
  periodOptions: { label: string; value: string }[] = [];

  // Payment status filter
  selectedPaymentStatus: PaymentStatus | null = null;
  paymentStatusOptions = [
    { label: 'Pendente', value: 'pending' as PaymentStatus },
    { label: 'Pago', value: 'paid' as PaymentStatus },
  ];

  // Projection settings
  showProjectionFilters = false;
  showProjectionManager = false;
  projectionSources = [
    { label: 'Transações Recorrentes', value: 'recurring' },
    { label: 'Manual', value: 'manual' },
  ];

  // Use Angular's `inject()` to satisfy @angular-eslint/prefer-inject
  private readonly fb = inject(FormBuilder);
  private readonly transactionService = inject(TransactionService);
  private readonly categoryService = inject(CategoryService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.initializeForms();
    this.loadCategories();
    this.loadPeriodOptions();

    // Verificar se estamos autenticados antes de carregar transações
    this.checkAuthAndLoadData();
  }

  loadPeriodOptions(): void {
    this.periodOptions = this.transactionService.getAvailablePeriods();
    // Default to current competency period
    this.selectedPeriod = this.transactionService.getCurrentPeriod();
    if (this.filterForm) {
      this.filterForm.patchValue({ competencyPeriod: this.selectedPeriod });
    }
  }

  onPeriodChange(): void {
    // Update filter and reload
    this.currentFilters.competencyPeriod = this.selectedPeriod || undefined;
    this.filterForm.patchValue({ competencyPeriod: this.selectedPeriod || '' });
    this.first = 0;
    this.currentFilters.page = 1;
    this.loadTransactions();
  }

  onPaymentStatusChange(): void {
    // Update filter and reload
    this.currentFilters.paymentStatus = this.selectedPaymentStatus || undefined;
    this.first = 0;
    this.currentFilters.page = 1;
    this.loadTransactions();
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
        detail: 'Faça login para visualizar suas transações',
      });
      return;
    }

    // Carregar transações
    this.loadTransactionsInitial();
  }

  private loadTransactionsInitial(): void {
    this.loading = true;

    // Configurar filtros iniciais (sem filtro de período para mostrar tudo)
    this.currentFilters = {
      page: 1,
      limit: this.rows,
      competencyPeriod: this.selectedPeriod || undefined,
    };

    this.transactionService.getTransactions(this.currentFilters).subscribe({
      next: (response) => {
        if (response?.data && Array.isArray(response.data)) {
          this.transactions = response.data;
          this.totalRecords = response.total || 0;
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
            detail: 'Sessão expirada. Faça login novamente.',
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar transações',
          });
        }
      },
    });
  }

  initializeForms(): void {
    this.transactionForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(255)]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      type: ['expense' as TransactionType, Validators.required],
      categoryId: ['', Validators.required],
      transactionDate: [new Date(), Validators.required],
      competencyPeriod: [new Date(), Validators.required],
      notes: ['', Validators.maxLength(500)],
      isProjected: [false],
      projectionSource: ['manual'],
      confidenceScore: [80, [Validators.min(0), Validators.max(100)]],
    });

    this.filterForm = this.fb.group({
      type: [''],
      categoryId: [''],
      startDate: [''],
      endDate: [''],
      competencyPeriod: [''],
      search: [''],
      includeProjections: [true],
      onlyProjections: [false],
      projectionSource: [''],
      minConfidence: [''],
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter((cat) => cat.isActive);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar categorias',
        });
      },
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
        this.sortField = event.sortField;
        this.sortOrder = event.sortOrder;
        this.currentFilters.sortBy = event.sortField;
        this.currentFilters.sortOrder = event.sortOrder === 1 ? 'ASC' : 'DESC';
      }
    } else {
      // Inicialização sem evento - garantir que os valores básicos estão definidos
      this.currentFilters.page = this.currentFilters.page || 1;
      this.currentFilters.limit = this.currentFilters.limit || this.rows;
    }

    // Check if we have projection-specific filters
    const hasProjectionFilters =
      this.currentFilters.includeProjections !== undefined ||
      this.currentFilters.onlyProjections ||
      this.currentFilters.projectionSource ||
      this.currentFilters.minConfidence;

    this.currentFilters.competencyPeriod = this.selectedPeriod || undefined;

    const serviceCall = hasProjectionFilters
      ? this.transactionService.getTransactionsWithProjectionFilters(this.currentFilters)
      : this.transactionService.getTransactions(this.currentFilters);

    serviceCall.subscribe({
      next: (response) => {
        // Verificar se a resposta tem a estrutura esperada
        if (response && response.data && Array.isArray(response.data)) {
          this.transactions = response.data;
          this.totalRecords = response.total || 0;
        } else {
          this.transactions = [];
          this.totalRecords = 0;
          this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Estrutura de resposta inválida',
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
            detail: 'Sessão expirada. Faça login novamente.',
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar transações',
          });
        }
      },
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
      competencyPeriod: filterValues.competencyPeriod || undefined,
      search: filterValues.search || undefined,
      includeProjections: filterValues.includeProjections,
      onlyProjections: filterValues.onlyProjections,
      projectionSource: filterValues.projectionSource || undefined,
      minConfidence: filterValues.minConfidence || undefined,
    };

    this.first = 0;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.selectedPeriod = this.transactionService.getCurrentPeriod();
    this.filterForm.patchValue({ competencyPeriod: this.selectedPeriod });
    this.selectedPaymentStatus = null;
    this.currentFilters = {
      page: 1,
      limit: this.rows,
    };
    this.first = 0;
    this.loadTransactions();
  }

  toggleProjectionFilters(): void {
    this.showProjectionFilters = !this.showProjectionFilters;
  }

  onProjectionFilterChange(): void {
    this.applyFilters();
  }

  // Projection helper methods
  isProjectedTransaction(transaction: Transaction): boolean {
    return transaction.isProjected === true;
  }

  getProjectionIcon(transaction: Transaction): string {
    if (!this.isProjectedTransaction(transaction)) return '';

    switch (transaction.projectionSource) {
      case 'recurring':
        return 'pi-refresh';
      case 'manual':
        return 'pi-user';
      case 'ai':
        return 'pi-sparkles';
      default:
        return 'pi-clock';
    }
  }

  getProjectionTooltip(transaction: Transaction): string {
    if (!this.isProjectedTransaction(transaction)) return '';

    let tooltip = `Transação Projetada (${this.getProjectionSourceLabel(transaction.projectionSource)})`;
    if (transaction.confidenceScore) {
      tooltip += `\nConfiança: ${transaction.confidenceScore}%`;
    }
    return tooltip;
  }

  getProjectionSourceLabel(source?: string): string {
    switch (source) {
      case 'recurring':
        return 'Recorrente';
      case 'manual':
        return 'Manual';
      case 'ai':
        return 'IA';
      default:
        return 'Desconhecida';
    }
  }

  getProjectionClass(transaction: Transaction): string {
    if (!this.isProjectedTransaction(transaction)) return '';

    const baseClass = 'projection-indicator';
    const sourceClass = transaction.projectionSource
      ? `projection-${transaction.projectionSource}`
      : '';
    return `${baseClass} ${sourceClass}`;
  }

  getConfidenceColor(confidenceScore?: number): string {
    if (!confidenceScore) return '#6B7280';

    if (confidenceScore >= 80) return '#10B981'; // High confidence - green
    if (confidenceScore >= 60) return '#F59E0B'; // Medium confidence - yellow
    return '#EF4444'; // Low confidence - red
  }

  // Projection Management Methods
  toggleProjectionManager(): void {
    this.showProjectionManager = !this.showProjectionManager;
  }

  generateProjectionsFromRecurring(): void {
    const currentDate = new Date();
    const startPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 2).padStart(2, '0')}`;
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 7, 0); // 6 months ahead
    const endPeriod = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;

    const generateDto = {
      startPeriod,
      endPeriod,
      overrideExisting: true,
      defaultConfidence: 85,
    };

    this.loading = true;
    this.transactionService.generateProjections(generateDto).subscribe({
      next: (result) => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `${result.generated} projeções geradas para o período ${result.period}`,
        });
        this.loadTransactions(); // Refresh the list
      },
      error: (error) => {
        this.loading = false;
        console.error('Error generating projections:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao gerar projeções automáticas',
        });
      },
    });
  }

  cleanupSystemProjections(): void {
    this.confirmationService.confirm({
      message:
        'Tem certeza que deseja limpar todas as projeções geradas pelo sistema? Esta ação não pode ser desfeita.',
      header: 'Confirmar Limpeza',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.transactionService.cleanupProjections(undefined, undefined, false).subscribe({
          next: (result) => {
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `${result.deleted} projeções removidas`,
            });
            this.loadTransactions(); // Refresh the list
          },
          error: (error) => {
            this.loading = false;
            console.error('Error cleaning projections:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao limpar projeções',
            });
          },
        });
      },
    });
  }

  cleanupAllProjections(): void {
    this.confirmationService.confirm({
      message:
        'Tem certeza que deseja remover TODAS as projeções? Esta ação não pode ser desfeita.',
      header: 'Confirmar Remoção Total',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.loading = true;
        this.transactionService.cleanupProjections().subscribe({
          next: (result) => {
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `${result.deleted} projeções removidas`,
            });
            this.loadTransactions(); // Refresh the list
          },
          error: (error) => {
            this.loading = false;
            console.error('Error cleaning all projections:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao remover todas as projeções',
            });
          },
        });
      },
    });
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
      limit: event.rows,
    };
    this.loadTransactions();
  }

  openNew(): void {
    this.selectedTransaction = {} as Transaction;
    this.newMode = true;
    this.editMode = false;
    this.cloneMode = false;
    this.submitted = false;
    this.transactionForm.reset({
      type: 'expense',
      transactionDate: new Date(),
      competencyPeriod: new Date(),
      amount: 0,
      isProjected: false,
      projectionSource: 'manual',
      confidenceScore: 80,
    });
    this.transactionDialog = true;
  }

  editTransaction(transaction: Transaction): void {
    this.selectedTransaction = { ...transaction };
    this.editMode = true;
    this.cloneMode = false;
    this.newMode = false;
    this.submitted = false;

    this.transactionForm.patchValue({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.category.id,
      transactionDate: parseLocalDate(transaction.transactionDate),
      competencyPeriod: parseCompetencyPeriod(transaction.competencyPeriod),
      notes: transaction.notes || '',
      isProjected: transaction.isProjected || false,
      projectionSource: transaction.projectionSource || 'manual',
      confidenceScore: transaction.confidenceScore || 80,
    });

    this.transactionDialog = true;
  }

  cloneTransaction(transaction: Transaction): void {
    this.cloneMode = true;
    this.editMode = false;
    this.newMode = false;
    this.submitted = false;

    this.transactionForm.patchValue({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.category.id,
      transactionDate: parseLocalDate(transaction.transactionDate),
      competencyPeriod: parseCompetencyPeriod(transaction.competencyPeriod),
      notes: transaction.notes || '',
      isProjected: transaction.isProjected || false,
      projectionSource: transaction.projectionSource || 'manual',
      confidenceScore: transaction.confidenceScore || 80,
    });

    this.transactionDialog = true;
  }

  openProjectionDialog(): void {
    this.selectedTransaction = {} as Transaction;
    this.editMode = false;
    this.submitted = false;

    // Set form for projection with future date
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);

    this.transactionForm.reset({
      type: 'expense',
      transactionDate: futureDate,
      competencyPeriod: futureDate,
      amount: 0,
      isProjected: true,
      projectionSource: 'manual',
      confidenceScore: 80,
      description: '',
      notes: '',
    });
    this.transactionDialog = true;
  }

  isProjectedFormEnabled(): boolean {
    return this.transactionForm.get('isProjected')?.value === true;
  }

  onProjectedToggle(): void {
    const isProjected = this.transactionForm.get('isProjected')?.value;

    if (isProjected) {
      // Enable projection fields with default values
      this.transactionForm.patchValue({
        projectionSource: 'manual',
        confidenceScore: 80,
      });
    }
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
              detail: 'Transação excluída com sucesso',
            });
            this.loadTransactions();
          },
          error: (error) => {
            console.error('Error deleting transaction:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir transação',
            });
          },
        });
      },
    });
  }

  saveTransaction(): void {
    this.submitted = true;

    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;

      // Format competencyPeriod from Date to YYYY-MM string using local timezone
      const competencyDate =
        formValue.competencyPeriod instanceof Date
          ? formValue.competencyPeriod
          : parseLocalDate(formValue.competencyPeriod);
      const competencyPeriod = formatCompetencyPeriod(competencyDate);

      // Format transactionDate properly for API using local timezone
      const transactionDate =
        formValue.transactionDate instanceof Date
          ? formValue.transactionDate
          : parseLocalDate(formValue.transactionDate);
      const transactionDateStr = formatDateToString(transactionDate);

      console.log('Saving transaction:', {
        transactionDate: transactionDateStr,
        competencyPeriod: competencyPeriod,
        formTransactionDate: formValue.transactionDate,
        formCompetencyPeriod: formValue.competencyPeriod,
      });

      if (this.editMode) {
        const updateDto: UpdateTransactionDto = {
          description: formValue.description,
          amount: formValue.amount,
          type: formValue.type,
          categoryId: formValue.categoryId,
          transactionDate: transactionDateStr,
          competencyPeriod: competencyPeriod,
          notes: formValue.notes,
          isProjected: formValue.isProjected || false,
          projectionSource: formValue.isProjected ? formValue.projectionSource : undefined,
          confidenceScore: formValue.isProjected ? formValue.confidenceScore : undefined,
        };

        this.transactionService
          .updateTransaction(this.selectedTransaction.id, updateDto)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Transação atualizada com sucesso',
              });
              this.hideDialog();
              this.loadTransactions();
            },
            error: (error) => {
              console.error('Error updating transaction:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao atualizar transação',
              });
            },
          });
      } else {
        const createDto: CreateTransactionDto = {
          description: formValue.description,
          amount: formValue.amount,
          type: formValue.type,
          categoryId: formValue.categoryId,
          transactionDate: transactionDateStr,
          competencyPeriod: competencyPeriod,
          notes: formValue.notes,
          isProjected: formValue.isProjected || false,
          projectionSource: formValue.isProjected ? formValue.projectionSource : undefined,
          confidenceScore: formValue.isProjected ? formValue.confidenceScore : undefined,
        };

        this.transactionService.createTransaction(createDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Transação criada com sucesso',
            });
            this.hideDialog();
            this.loadTransactions();
          },
          error: (error) => {
            console.error('Error creating transaction:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar transação',
            });
          },
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

    return this.getCategoriesByType(currentType).map((cat) => ({
      label: cat.name,
      value: cat.id,
      icon: this.normalizeIcon(cat.icon),
      color: cat.color,
    }));
  }

  normalizeIcon(icon: string): string {
    return normalizeIcon(icon);
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
          detail: 'Transações exportadas com sucesso',
        });
      },
      error: (error) => {
        console.error('Error exporting transactions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao exportar transações',
        });
      },
    });
  }

  getCategoriesByType(type: TransactionType): Category[] {
    return this.categories.filter((cat) => cat.type === type);
  }

  onTypeChange(): void {
    // Reset category when type changes
    this.transactionForm.patchValue({ categoryId: '' });
  }

  onTransactionDateChange(): void {
    // Auto-update competency period when transaction date changes
    const transactionDate = this.transactionForm.get('transactionDate')?.value;
    if (transactionDate) {
      this.transactionForm.patchValue({ competencyPeriod: new Date(transactionDate) });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
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
      { label: 'Receita', value: 'income', icon: 'pi pi-arrow-up' },
      { label: 'Despesa', value: 'expense', icon: 'pi pi-arrow-down' },
    ];
  }

  // Payment status methods
  getPaymentStatusLabel(status?: PaymentStatus): string {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
      default:
        return 'Pendente';
    }
  }

  getPaymentStatusSeverity(
    transaction: Transaction,
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    if (transaction.paymentStatus === 'paid') {
      return 'success';
    }
    // Check if transaction is overdue (pending and transaction date has passed)
    if (transaction.paymentStatus === 'pending' || !transaction.paymentStatus) {
      const transactionDate = parseLocalDate(transaction.transactionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (transactionDate < today) {
        return 'danger'; // Overdue
      }
    }
    return 'warning'; // Pending but not overdue
  }

  getPaymentStatusTooltip(transaction: Transaction): string {
    if (transaction.paymentStatus === 'paid') {
      if (transaction.paidDate) {
        const paidDate = parseLocalDate(transaction.paidDate);
        return `Pago em ${paidDate.toLocaleDateString('pt-BR')}`;
      }
      return 'Pago';
    }
    // Check if overdue
    const transactionDate = parseLocalDate(transaction.transactionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (transactionDate < today) {
      const daysOverdue = Math.floor(
        (today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return `Atrasado há ${daysOverdue} dia${daysOverdue > 1 ? 's' : ''}`;
    }
    return 'Pendente';
  }

  canMarkAsPaid(transaction: Transaction): boolean {
    // Can only mark as paid if:
    // 1. Not a projected transaction
    // 2. Status is pending (or undefined/null)
    return (
      !transaction.isProjected &&
      (transaction.paymentStatus === 'pending' || !transaction.paymentStatus)
    );
  }

  confirmPayTransaction(transaction: Transaction): void {
    this.confirmationService.confirm({
      message: `Confirma o pagamento da transação "${transaction.description}" no valor de ${this.formatCurrency(transaction.amount)}?`,
      header: 'Confirmar Pagamento',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Sim, Pagar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.payTransaction(transaction);
      },
    });
  }

  payTransaction(transaction: Transaction): void {
    this.transactionService.payTransaction(transaction.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Transação marcada como paga',
        });
        this.loadTransactions();
      },
      error: (error) => {
        console.error('Error marking transaction as paid:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao marcar transação como paga',
        });
      },
    });
  }

  canRevertPayment(transaction: Transaction): boolean {
    // Can only revert payment if:
    // 1. Not a projected transaction
    // 2. Status is paid
    return !transaction.isProjected && transaction.paymentStatus === 'paid';
  }

  confirmRevertPayment(transaction: Transaction): void {
    this.confirmationService.confirm({
      message: `Confirma a reversão do pagamento da transação "${transaction.description}" no valor de ${this.formatCurrency(transaction.amount)}?`,
      header: 'Confirmar Reversão de Pagamento',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Reverter',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.revertPayment(transaction);
      },
    });
  }

  revertPayment(transaction: Transaction): void {
    this.transactionService.revertPayment(transaction.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Pagamento revertido com sucesso',
        });
        this.loadTransactions();
      },
      error: (error) => {
        console.error('Error reverting payment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao reverter pagamento',
        });
      },
    });
  }

  getDialogHeader(): string {
    if (this.editMode) {
      return 'Editar Transação';
    } else if (this.cloneMode) {
      return 'Duplicar Transação';
    } else if (this.newMode) {
      return 'Nova Transação';
    }
    return 'Transação';
  }
}
