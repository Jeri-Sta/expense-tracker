import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardTransactionService } from '../../services/card-transaction.service';
import { CreditCardService } from '../../services/credit-card.service';
import { CategoryService, Category } from '../../../../core/services/category.service';
import { CardTransaction, CreateCardTransactionDto, UpdateCardTransactionDto, Invoice, InvoiceStatus } from '../../models/card-transaction.model';
import { CreditCard } from '../../models/credit-card.model';

@Component({
  selector: 'app-card-transactions',
  templateUrl: './card-transactions.component.html',
  styleUrls: ['./card-transactions.component.scss']
})
export class CardTransactionsComponent implements OnInit {
  transactions: CardTransaction[] = [];
  creditCards: CreditCard[] = [];
  categories: Category[] = [];
  invoices: Invoice[] = [];
  loading = false;
  
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
    value: i + 2 
  }));

  constructor(
    private readonly fb: FormBuilder,
    private readonly cardTransactionService: CardTransactionService,
    private readonly creditCardService: CreditCardService,
    private readonly categoryService: CategoryService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {
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
      totalInstallments: [{ value: 2, disabled: true }]
    });

    // Enable/disable installments field based on checkbox
    this.transactionForm.get('isInstallment')?.valueChanges.subscribe(isInstallment => {
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
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories('expense').subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadTransactions(): void {
    this.loading = true;
    this.cardTransactionService.getAll(
      this.selectedCardId || undefined, 
      this.selectedPeriod
    ).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loading = false;
        this.loadInvoices();
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar transações'
        });
        this.loading = false;
      }
    });
  }

  loadInvoices(): void {
    this.cardTransactionService.getInvoices(this.selectedCardId || undefined).subscribe({
      next: (invoices) => {
        this.invoices = invoices.filter(inv => inv.period === this.selectedPeriod);
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
      }
    });
  }

  onFilterChange(): void {
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
      totalInstallments: 2
    });
    this.transactionDialog = true;
  }

  editTransaction(transaction: CardTransaction): void {
    if (transaction.parentTransactionId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Edite a transação principal para alterar todas as parcelas'
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
      transactionDate: new Date(transaction.transactionDate),
      creditCardId: transaction.creditCardId,
      categoryId: transaction.categoryId || '',
      isInstallment: transaction.isInstallment,
      totalInstallments: transaction.totalInstallments || 2
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
      }
    });
  }

  private performDelete(transaction: CardTransaction): void {
    this.cardTransactionService.delete(transaction.id).subscribe({
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

  saveTransaction(): void {
    this.submitted = true;
    
    if (this.transactionForm.invalid) {
      return;
    }
    
    const formValue = this.transactionForm.getRawValue();
    
    if (this.editMode) {
      const updateData: UpdateCardTransactionDto = {
        description: formValue.description,
        amount: formValue.amount,
        transactionDate: this.formatDate(formValue.transactionDate),
        categoryId: formValue.categoryId || undefined
      };
      
      this.cardTransactionService.update(this.selectedTransaction.id, updateData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Transação atualizada com sucesso'
          });
          this.transactionDialog = false;
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
      const createData: CreateCardTransactionDto = {
        description: formValue.description,
        amount: formValue.amount,
        transactionDate: this.formatDate(formValue.transactionDate),
        creditCardId: formValue.creditCardId,
        categoryId: formValue.categoryId || undefined,
        isInstallment: formValue.isInstallment,
        totalInstallments: formValue.isInstallment ? formValue.totalInstallments : undefined
      };
      
      this.cardTransactionService.create(createData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: formValue.isInstallment 
              ? `Compra parcelada em ${formValue.totalInstallments}x criada com sucesso`
              : 'Transação criada com sucesso'
          });
          this.transactionDialog = false;
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

  hideDialog(): void {
    this.transactionDialog = false;
    this.submitted = false;
    // Re-enable disabled fields
    this.transactionForm.get('isInstallment')?.enable();
    this.transactionForm.get('creditCardId')?.enable();
  }

  updateInvoiceStatus(invoice: Invoice, status: InvoiceStatus): void {
    this.cardTransactionService.updateInvoiceStatus(invoice.creditCardId, invoice.period, { status }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: status === 'paid' ? 'Fatura marcada como paga' : 'Status da fatura atualizado'
        });
        this.loadInvoices();
      },
      error: (error) => {
        console.error('Error updating invoice status:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar status da fatura'
        });
      }
    });
  }

  // Helper methods
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
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
      paid: 'Paga'
    };
    return labels[status];
  }

  getInvoiceStatusSeverity(status: InvoiceStatus): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<InvoiceStatus, 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast'> = {
      open: 'info',
      closed: 'warning',
      paid: 'success'
    };
    return severities[status];
  }

  getTotalForPeriod(): number {
    return this.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }

  getInvoiceForCard(cardId: string): Invoice | undefined {
    return this.invoices.find(inv => inv.creditCardId === cardId);
  }

  getCardById(cardId: string): CreditCard | undefined {
    return this.creditCards.find(c => c.id === cardId);
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
