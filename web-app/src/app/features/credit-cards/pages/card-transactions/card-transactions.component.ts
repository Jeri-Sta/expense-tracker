import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardTransactionService } from '../../services/card-transaction.service';
import { CreditCardService } from '../../services/credit-card.service';
import { CategoryService, Category } from '../../../../core/services/category.service';
import {
  CardTransaction,
  CreateCardTransactionDto,
  UpdateCardTransactionDto,
  Invoice,
  InvoiceStatus,
} from '../../models/card-transaction.model';
import { CreditCard } from '../../models/credit-card.model';
import { parseLocalDate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-card-transactions',
  templateUrl: './card-transactions.component.html',
  styleUrls: ['./card-transactions.component.scss'],
})
export class CardTransactionsComponent implements OnInit {
  transactions: CardTransaction[] = [];
  creditCards: CreditCard[] = [];
  categories: Category[] = [];
  invoices: Invoice[] = [];
  loading = false;

  // Pagination
  totalRecords = 0;
  rows = 10;
  first = 0;

  // Sorting
  sortField = 'transactionDate';
  sortOrder = -1; // -1 = DESC, 1 = ASC

  // Filters
  selectedCardId: string | null = null;
  selectedPeriod: string;
  periodOptions: { label: string; value: string }[] = [];

  // Dialog states
  transactionDialog = false;
  editMode = false;
  submitted = false;

  // Forms
  transactionForm!: FormGroup;

  // Selected transaction for operations
  selectedTransaction!: CardTransaction;

  // Installment options
  installmentOptions = Array.from({ length: 47 }, (_, i) => ({
    label: `${i + 2}x`,
    value: i + 2,
  }));

  private readonly fb = inject(FormBuilder);
  private readonly cardTransactionService = inject(CardTransactionService);
  private readonly creditCardService = inject(CreditCardService);
  private readonly categoryService = inject(CategoryService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  constructor() {
    this.selectedPeriod = this.cardTransactionService.getCurrentPeriod();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPeriodOptions();
    this.loadCreditCards();
    this.loadCategories();
    this.loadTransactions();
  }

  initializeForm(): void {
    this.transactionForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(255)]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      transactionDate: [new Date(), Validators.required],
      creditCardId: ['', Validators.required],
      categoryId: [''],
      isInstallment: [false],
      totalInstallments: [{ value: 2, disabled: true }],
    });

    // Enable/disable installments field based on checkbox
    this.transactionForm.get('isInstallment')?.valueChanges.subscribe((isInstallment) => {
      const installmentsControl = this.transactionForm.get('totalInstallments');
      if (isInstallment) {
        installmentsControl?.enable();
      } else {
        installmentsControl?.disable();
        installmentsControl?.setValue(2);
      }
    });
  }

  loadPeriodOptions(): void {
    this.periodOptions = this.cardTransactionService.getAvailablePeriods();
  }

  loadCreditCards(): void {
    this.creditCardService.getAll().subscribe({
      next: (cards) => {
        this.creditCards = cards;
      },
      error: (error) => {
        console.error('Error loading credit cards:', error);
      },
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories('expense').subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  loadTransactions(event?: any): void {
    this.loading = true;

    // Handle lazy load event
    if (event) {
      this.first = event.first || 0;
      this.rows = event.rows || 10;

      // Update sort properties if provided
      if (event.sortField) {
        this.sortField = event.sortField;
        this.sortOrder = event.sortOrder;
      }
    }

    const page = Math.floor(this.first / this.rows) + 1;
    const sortOrderStr = this.sortOrder === 1 ? 'ASC' : 'DESC';

    // Parse year and month from selectedPeriod (e.g., "2024-12")
    const [year, month] = this.selectedPeriod.split('-').map(Number);

    // Use paginated endpoint with sorting - filter by due month instead of invoice period
    this.cardTransactionService
      .getTransactionsPaginated({
        page,
        limit: this.rows,
        sortField: this.sortField,
        sortOrder: sortOrderStr,
        creditCardId: this.selectedCardId || undefined,
        dueYear: year,
        dueMonth: month,
      })
      .subscribe({
        next: (response) => {
          this.transactions = response.data;
          this.totalRecords = response.total;
          this.loading = false;
          this.loadInvoices();
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar transações',
          });
          this.loading = false;
        },
      });
  }

  onLazyLoad(event: any): void {
    this.loadTransactions(event);
  }

  loadInvoices(): void {
    // Parse year and month from selectedPeriod (e.g., "2024-12")
    const [year, month] = this.selectedPeriod.split('-').map(Number);

    // Use the due-month endpoint to get invoices with due date in selected month
    this.cardTransactionService
      .getInvoicesByDueMonth(year, month, this.selectedCardId || undefined)
      .subscribe({
        next: (invoices) => {
          this.invoices = invoices;
        },
        error: (error) => {
          console.error('Error loading invoices:', error);
        },
      });
  }

  onFilterChange(): void {
    this.first = 0; // Reset to first page on filter change
    this.loadTransactions();
  }

  openNew(): void {
    this.selectedTransaction = {} as CardTransaction;
    this.editMode = false;
    this.submitted = false;
    this.transactionForm.reset({
      transactionDate: new Date(),
      creditCardId: this.selectedCardId || '',
      isInstallment: false,
      totalInstallments: 2,
    });

    // Re-enable fields that were disabled in edit mode
    this.transactionForm.get('creditCardId')?.enable();
    this.transactionForm.get('isInstallment')?.enable();

    this.transactionDialog = true;
  }

  editTransaction(transaction: CardTransaction): void {
    if (transaction.parentTransactionId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Edite a transação principal para alterar todas as parcelas',
      });
      return;
    }

    this.selectedTransaction = { ...transaction };
    this.editMode = true;
    this.submitted = false;

    this.transactionForm.patchValue({
      description: transaction.description,
      amount: transaction.isInstallment
        ? transaction.amount * (transaction.totalInstallments || 1)
        : transaction.amount,
      transactionDate: parseLocalDate(transaction.transactionDate),
      creditCardId: transaction.creditCardId,
      categoryId: transaction.categoryId || '',
      isInstallment: transaction.isInstallment,
      totalInstallments: transaction.totalInstallments || 2,
    });

    // Disable installment fields in edit mode
    this.transactionForm.get('isInstallment')?.disable();
    this.transactionForm.get('totalInstallments')?.disable();
    this.transactionForm.get('creditCardId')?.disable();

    this.transactionDialog = true;
  }

  deleteTransaction(transaction: CardTransaction): void {
    const hasChildren = transaction.isInstallment && !transaction.parentTransactionId;
    const message = hasChildren
      ? `Tem certeza que deseja excluir "${transaction.description}"? Todas as ${transaction.totalInstallments} parcelas serão excluídas.`
      : `Tem certeza que deseja excluir "${transaction.description}"?`;

    this.confirmationService.confirm({
      message,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDelete(transaction);
      },
    });
  }

  private performDelete(transaction: CardTransaction): void {
    this.cardTransactionService.delete(transaction.id).subscribe({
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
  }

  saveTransaction(): void {
    this.submitted = true;

    if (this.transactionForm.invalid) {
      return;
    }

    const formValue = this.transactionForm.getRawValue();

    if (this.editMode) {
      // For installment transactions, divide the total amount by number of installments
      // because the form shows the total but we need to save the installment amount
      let amount = formValue.amount;
      if (this.selectedTransaction.isInstallment && this.selectedTransaction.totalInstallments) {
        amount = Number((formValue.amount / this.selectedTransaction.totalInstallments).toFixed(2));
      }

      const updateData: UpdateCardTransactionDto = {
        description: formValue.description,
        amount: amount,
        transactionDate: this.formatDate(formValue.transactionDate),
        categoryId: formValue.categoryId ? formValue.categoryId : null,
      };

      this.cardTransactionService.update(this.selectedTransaction.id, updateData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Transação atualizada com sucesso',
          });
          this.transactionDialog = false;
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
      const createData: CreateCardTransactionDto = {
        description: formValue.description,
        amount: formValue.amount,
        transactionDate: this.formatDate(formValue.transactionDate),
        creditCardId: formValue.creditCardId,
        categoryId: formValue.categoryId || undefined,
        isInstallment: formValue.isInstallment,
        totalInstallments: formValue.isInstallment ? formValue.totalInstallments : undefined,
      };

      this.cardTransactionService.create(createData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: formValue.isInstallment
              ? `Compra parcelada em ${formValue.totalInstallments}x criada com sucesso`
              : 'Transação criada com sucesso',
          });
          this.transactionDialog = false;
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

  hideDialog(): void {
    this.transactionDialog = false;
    this.submitted = false;
    // Re-enable disabled fields
    this.transactionForm.get('isInstallment')?.enable();
    this.transactionForm.get('creditCardId')?.enable();
  }

  updateInvoiceStatus(invoice: Invoice, status: InvoiceStatus): void {
    this.cardTransactionService
      .updateInvoiceStatus(invoice.creditCardId, invoice.period, { status })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: status === 'paid' ? 'Fatura marcada como paga' : 'Status da fatura atualizado',
          });
          this.loadInvoices();
        },
        error: (error) => {
          console.error('Error updating invoice status:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar status da fatura',
          });
        },
      });
  }

  // Helper methods
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatPeriod(period: string): string {
    return this.cardTransactionService.formatPeriod(period);
  }

  getInvoiceStatusLabel(status: InvoiceStatus): string {
    const labels: Record<InvoiceStatus, string> = {
      open: 'Aberta',
      closed: 'Fechada',
      paid: 'Paga',
    };
    return labels[status];
  }

  getInvoiceStatusSeverity(
    status: InvoiceStatus,
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<
      InvoiceStatus,
      'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast'
    > = {
      open: 'info',
      closed: 'warning',
      paid: 'success',
    };
    return severities[status];
  }

  getTotalForPeriod(): number {
    // Sum totalAmount from all invoices in the period (not just paginated transactions)
    if (this.invoices.length > 0) {
      return this.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    }
    // Fallback to transactions sum if no invoices loaded
    return this.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }

  getInvoiceForCard(cardId: string): Invoice | undefined {
    return this.invoices.find((inv) => inv.creditCardId === cardId);
  }

  getCardById(cardId: string): CreditCard | undefined {
    return this.creditCards.find((c) => c.id === cardId);
  }

  // Group transactions by card
  getTransactionsByCard(): Map<string, CardTransaction[]> {
    const grouped = new Map<string, CardTransaction[]>();

    for (const transaction of this.transactions) {
      const cardId = transaction.creditCardId;
      if (!grouped.has(cardId)) {
        grouped.set(cardId, []);
      }
      grouped.get(cardId)!.push(transaction);
    }

    return grouped;
  }
}
