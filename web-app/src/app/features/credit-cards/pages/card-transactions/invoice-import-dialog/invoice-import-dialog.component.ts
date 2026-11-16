import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardTransactionService } from '../../../services/card-transaction.service';
import { CreditCard } from '../../../models/credit-card.model';
import { Category } from '../../../../../core/services/category.service';
import {
  ConfirmImportRequest,
  ImportConfirmResponse,
  ImportPreviewResponse,
  ImportPreviewRow,
  ImportRowStatus,
  MerchantCategoryRule,
} from '../../../models/card-transaction.model';
import { formatCurrency, formatPeriod } from '../../../../../shared/utils/format.utils';

type TagSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-invoice-import-dialog',
  templateUrl: './invoice-import-dialog.component.html',
  styleUrls: ['./invoice-import-dialog.component.scss'],
})
export class InvoiceImportDialogComponent {
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  @Input() creditCards: CreditCard[] = [];
  @Input() categories: Category[] = [];
  @Input() defaultCardId: string | null = null;
  @Input() defaultPeriod = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() imported = new EventEmitter<void>();

  private visibleValue = false;

  @Input()
  set visible(value: boolean) {
    this.visibleValue = value;
    if (value) this.onOpen();
  }

  get visible(): boolean {
    return this.visibleValue;
  }

  step: 1 | 2 | 3 = 1;
  selectedCardId = '';
  selectedPeriod = '';
  file: File | null = null;
  fileName = '';
  loading = false;
  saving = false;

  preview: ImportPreviewResponse | null = null;
  result: ImportConfirmResponse | null = null;

  rules: MerchantCategoryRule[] = [];
  rulesVisible = false;
  rulesLoading = false;

  periodOptions: { label: string; value: string }[] = [];
  categoryOptions: { label: string; value: string }[] = [];

  readonly formatCurrency = formatCurrency;
  readonly formatPeriod = formatPeriod;

  private readonly cardTransactionService = inject(CardTransactionService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  get canAnalyze(): boolean {
    return !!this.selectedCardId && !!this.selectedPeriod && !!this.file && !this.loading;
  }

  get selectedRows(): ImportPreviewRow[] {
    return this.preview?.rows.filter((row) => row.include) ?? [];
  }

  get selectedCount(): number {
    return this.selectedRows.length;
  }

  get selectedAmount(): number {
    return this.selectedRows.reduce((sum, row) => sum + Number(row.amount), 0);
  }

  get hasMissingCategory(): boolean {
    return this.selectedRows.some((row) => !row.categoryId);
  }

  get transactionsToCreate(): number {
    return this.selectedRows.reduce(
      (sum, row) =>
        sum +
        (row.installmentNumber
          ? row.generatedInstallments.filter((installment) => !installment.exists).length
          : 1),
      0,
    );
  }

  get projectedAmount(): number {
    return this.selectedRows.reduce(
      (sum, row) =>
        sum +
        (row.installmentNumber
          ? row.generatedInstallments
              .filter((installment) => !installment.exists)
              .reduce((installmentSum, installment) => installmentSum + installment.amount, 0)
          : row.amount),
      0,
    );
  }

  onDialogVisibility(value: boolean): void {
    this.visibleValue = value;
    this.visibleChange.emit(value);
  }

  close(): void {
    this.onDialogVisibility(false);
  }

  onOpen(): void {
    this.step = 1;
    this.preview = null;
    this.result = null;
    this.file = null;
    this.fileName = '';
    this.loading = false;
    this.saving = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.periodOptions = this.cardTransactionService.getAvailablePeriods();
    this.categoryOptions = this.categories
      .filter((category) => category.type === 'expense')
      .map((category) => ({ label: category.name, value: category.id }));
    const nubankCard = this.creditCards.find((card) => card.name.toLowerCase().includes('nubank'));
    this.selectedCardId = this.defaultCardId ?? nubankCard?.id ?? this.creditCards[0]?.id ?? '';
    this.selectedPeriod = this.defaultPeriod || this.cardTransactionService.getCurrentPeriod();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Arquivo inválido',
        detail: 'Selecione um arquivo .csv exportado do Nubank.',
      });
      input.value = '';
      return;
    }

    this.file = file;
    this.fileName = file.name;

    const match = file.name.match(/(\d{4})-(\d{2})-\d{2}/);
    if (match) {
      this.selectedPeriod = `${match[1]}-${match[2]}`;
    }
  }

  analyze(): void {
    if (!this.canAnalyze || !this.file) return;

    const card = this.creditCards.find((item) => item.id === this.selectedCardId);
    const invoicePeriod = this.toInvoicePeriod(this.selectedPeriod, card);

    this.loading = true;
    this.cardTransactionService
      .previewNubankImport(this.file, this.selectedCardId, invoicePeriod)
      .subscribe({
        next: (response) => {
          this.preview = response;
          this.step = 2;
          this.loading = false;
        },
        error: (error: unknown) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao ler o CSV',
            detail: this.extractError(error),
          });
        },
      });
  }

  backToSelection(): void {
    this.step = 1;
    this.preview = null;
  }

  confirmImport(): void {
    if (!this.preview || this.saving) return;

    if (this.selectedCount === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nada selecionado',
        detail: 'Marque ao menos uma transação para importar.',
      });
      return;
    }

    if (this.hasMissingCategory) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Categoria obrigatória',
        detail: 'Classifique todas as transações selecionadas.',
      });
      return;
    }

    const card = this.creditCards.find((item) => item.id === this.selectedCardId);
    const invoicePeriod = this.toInvoicePeriod(this.selectedPeriod, card);

    const payload: ConfirmImportRequest = {
      creditCardId: this.selectedCardId,
      invoicePeriod,
      rows: this.preview.rows.map((row) => ({
        rowIndex: row.rowIndex,
        date: row.date,
        title: row.title,
        amount: row.amount,
        occurrence: row.occurrence,
        description: row.description,
        categoryId: row.categoryId,
        include: row.include,
      })),
    };

    this.saving = true;
    this.cardTransactionService.confirmNubankImport(payload).subscribe({
      next: (response) => {
        this.saving = false;
        this.result = response;
        this.step = 3;
        this.imported.emit();
        this.messageService.add({
          severity: 'success',
          summary: 'Importação concluída',
          detail: `${response.created} transação(ões) criada(s).`,
        });
      },
      error: (error: unknown) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao importar',
          detail: this.extractError(error),
        });
      },
    });
  }

  openRules(): void {
    this.rulesLoading = true;
    this.cardTransactionService.getImportRules().subscribe({
      next: (rules) => {
        this.rules = rules;
        this.rulesLoading = false;
        this.rulesVisible = true;
      },
      error: (error: unknown) => {
        this.rulesLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: this.extractError(error),
        });
      },
    });
  }

  deleteRule(rule: MerchantCategoryRule): void {
    this.confirmationService.confirm({
      message: `Remover o vínculo de "${rule.pattern}" com ${rule.categoryName ?? 'a categoria'}?`,
      header: 'Remover regra',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cardTransactionService.deleteImportRule(rule.id).subscribe({
          next: () => {
            this.rules = this.rules.filter((item) => item.id !== rule.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Regra removida',
              detail: 'As próximas importações não usarão mais este vínculo.',
            });
          },
          error: (error: unknown) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: this.extractError(error),
            });
          },
        });
      },
    });
  }

  getStatusLabel(status: ImportRowStatus): string {
    const labels: Record<ImportRowStatus, string> = {
      new: 'Nova',
      imported: 'Já importada',
      possible_duplicate: 'Possível duplicata',
      payment: 'Pagamento',
      period_mismatch: 'Outra fatura',
    };
    return labels[status];
  }

  getStatusSeverity(status: ImportRowStatus): TagSeverity {
    const severities: Record<ImportRowStatus, TagSeverity> = {
      new: 'success',
      imported: 'secondary',
      possible_duplicate: 'warning',
      payment: 'info',
      period_mismatch: 'danger',
    };
    return severities[status];
  }

  isRowDisabled(row: ImportPreviewRow): boolean {
    return row.status === 'imported' || row.status === 'payment';
  }

  missingInstallmentsCount(row: ImportPreviewRow): number {
    return row.generatedInstallments.filter((installment) => !installment.exists).length;
  }

  generatedInstallmentsLabel(row: ImportPreviewRow): string {
    return row.generatedInstallments
      .filter((installment) => !installment.exists)
      .map(
        (installment) =>
          `${installment.installmentNumber}/${row.totalInstallments} (${formatPeriod(
            installment.invoicePeriod,
          )})`,
      )
      .join(', ');
  }

  formatDateLabel(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  private toInvoicePeriod(duePeriod: string, card: CreditCard | undefined): string {
    if (card && card.dueDay <= card.closingDay) {
      return this.addMonths(duePeriod, -1);
    }
    return duePeriod;
  }

  private addMonths(period: string, months: number): string {
    const [year, month] = period.split('-').map(Number);
    const total = year * 12 + (month - 1) + months;
    return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
  }

  private extractError(error: unknown): string {
    const payload = error as { error?: { message?: string | string[] } };
    const message = payload?.error?.message;

    if (Array.isArray(message)) return message.join(' ');
    return message || 'Não foi possível concluir a operação.';
  }
}
