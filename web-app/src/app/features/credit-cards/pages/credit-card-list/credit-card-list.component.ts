import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CreditCardService } from '../../services/credit-card.service';
import {
  CreditCard,
  CreateCreditCardDto,
  UpdateCreditCardDto,
} from '../../models/credit-card.model';

@Component({
  selector: 'app-credit-card-list',
  templateUrl: './credit-card-list.component.html',
  styleUrls: ['./credit-card-list.component.scss'],
})
export class CreditCardListComponent implements OnInit {
  creditCards: CreditCard[] = [];
  loading = false;

  // Dialog states
  cardDialog = false;
  editMode = false;
  submitted = false;

  // Forms
  cardForm!: FormGroup;

  // Selected card for operations
  selectedCard!: CreditCard;

  // Predefined colors
  availableColors: string[] = [];

  // Color picker
  showColorPicker = false;

  // Days options (1-31)
  daysOptions = Array.from({ length: 31 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }));

  constructor(
    private fb: FormBuilder,
    private creditCardService: CreditCardService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPredefinedOptions();
    this.loadCreditCards();
  }

  initializeForm(): void {
    this.cardForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      color: ['#3B82F6', Validators.required],
      closingDay: [15, [Validators.required, Validators.min(1), Validators.max(31)]],
      dueDay: [22, [Validators.required, Validators.min(1), Validators.max(31)]],
      totalLimit: [0, [Validators.required, Validators.min(0)]],
    });
  }

  loadPredefinedOptions(): void {
    this.availableColors = this.creditCardService.getCardColors();
  }

  loadCreditCards(): void {
    this.loading = true;
    this.creditCardService.getAll().subscribe({
      next: (cards) => {
        this.creditCards = cards;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading credit cards:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar cartões de crédito',
        });
        this.loading = false;
      },
    });
  }

  openNew(): void {
    this.selectedCard = {} as CreditCard;
    this.editMode = false;
    this.submitted = false;
    this.cardForm.reset({
      color: '#3B82F6',
      closingDay: 15,
      dueDay: 22,
      totalLimit: 0,
    });
    this.cardDialog = true;
  }

  editCard(card: CreditCard): void {
    this.selectedCard = { ...card };
    this.editMode = true;
    this.submitted = false;

    this.cardForm.patchValue({
      name: card.name,
      color: card.color,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      totalLimit: card.totalLimit,
    });

    this.cardDialog = true;
  }

  deleteCard(card: CreditCard): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o cartão "${card.name}"? Todas as transações associadas serão removidas.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDelete(card);
      },
    });
  }

  private performDelete(card: CreditCard): void {
    this.creditCardService.delete(card.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Cartão excluído com sucesso',
        });
        this.loadCreditCards();
      },
      error: (error) => {
        console.error('Error deleting credit card:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao excluir cartão',
        });
      },
    });
  }

  saveCard(): void {
    this.submitted = true;

    if (this.cardForm.invalid) {
      return;
    }

    const formValue = this.cardForm.value;

    if (this.editMode) {
      const updateData: UpdateCreditCardDto = {
        name: formValue.name,
        color: formValue.color,
        closingDay: formValue.closingDay,
        dueDay: formValue.dueDay,
        totalLimit: formValue.totalLimit,
      };

      this.creditCardService.update(this.selectedCard.id, updateData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cartão atualizado com sucesso',
          });
          this.cardDialog = false;
          this.loadCreditCards();
        },
        error: (error) => {
          console.error('Error updating credit card:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar cartão',
          });
        },
      });
    } else {
      const createData: CreateCreditCardDto = {
        name: formValue.name,
        color: formValue.color,
        closingDay: formValue.closingDay,
        dueDay: formValue.dueDay,
        totalLimit: formValue.totalLimit,
      };

      this.creditCardService.create(createData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cartão criado com sucesso',
          });
          this.cardDialog = false;
          this.loadCreditCards();
        },
        error: (error) => {
          console.error('Error creating credit card:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar cartão',
          });
        },
      });
    }
  }

  hideDialog(): void {
    this.cardDialog = false;
    this.submitted = false;
  }

  selectColor(color: string): void {
    this.cardForm.patchValue({ color });
    this.showColorPicker = false;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  getUsagePercentage(card: CreditCard): number {
    if (!card.totalLimit || card.totalLimit === 0) return 0;
    return ((card.usedLimit || 0) / card.totalLimit) * 100;
  }

  getUsageSeverity(percentage: number): string {
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'success';
  }
}
