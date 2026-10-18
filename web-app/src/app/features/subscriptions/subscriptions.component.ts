import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable, timeout } from 'rxjs';
import { CreditCardService } from '../credit-cards/services/credit-card.service';
import { CreditCard } from '../credit-cards/models/credit-card.model';
import { formatCurrency } from '../../shared/utils/format.utils';
import { formatDateToString, parseLocalDate } from '../../shared/utils/date.utils';
import {
  CreateSubscriptionDto,
  Subscription,
  SubscriptionService,
  UpdateSubscriptionDto,
} from '../../core/services/subscription.service';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
})
export class SubscriptionsComponent implements OnInit {
  readonly formatCurrency = formatCurrency;
  subscriptions: Subscription[] = [];
  cards: CreditCard[] = [];
  loading = false;
  subscriptionsLoaded = false;
  saving = false;
  submitted = false;
  dialogVisible = false;
  editMode = false;
  loadError: string | null = null;
  cardsError: string | null = null;
  selectedSubscription?: Subscription;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SubscriptionService);
  private readonly cardService = inject(CreditCardService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255), this.nonBlank]],
    amount: [
      null as number | null,
      [Validators.required, Validators.min(0.01), this.maxTwoDecimals],
    ],
    chargeDay: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
    startDate: [parseLocalDate(this.today()), Validators.required],
    creditCardId: ['', Validators.required],
  });

  get activeMonthlyTotal(): number {
    return this.subscriptions
      .filter((subscription) => subscription.isActive)
      .reduce((total, subscription) => total + Number(subscription.amount), 0);
  }

  get hasActiveCard(): boolean {
    return this.cards.some((card) => card.isActive);
  }

  get cardOptions(): CreditCard[] {
    const selectedCardId = this.selectedSubscription?.creditCardId;
    const options = this.cards.filter((card) => card.isActive || card.id === selectedCardId);
    if (this.selectedSubscription && !options.some((card) => card.id === selectedCardId)) {
      options.push({
        id: this.selectedSubscription.creditCardId,
        name: this.selectedSubscription.creditCardName,
        isActive: false,
      } as CreditCard);
    }
    return options;
  }

  formatDate(date: string): string {
    return parseLocalDate(date).toLocaleDateString('pt-BR');
  }

  ngOnInit(): void {
    this.loadCards();
    this.loadSubscriptions();
  }

  loadCards(): void {
    this.cardsError = null;
    this.cardService
      .getAll()
      .pipe(timeout(15000))
      .subscribe({
        next: (cards) => (this.cards = cards),
        error: () => (this.cardsError = 'Não foi possível carregar os cartões. Tente novamente.'),
      });
  }

  loadSubscriptions(): void {
    this.loading = true;
    this.subscriptionsLoaded = false;
    this.loadError = null;
    this.service
      .getAll()
      .pipe(timeout(15000))
      .subscribe({
        next: (subscriptions) => {
          this.subscriptions = subscriptions;
          this.subscriptionsLoaded = true;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.loadError =
            'Não foi possível carregar as assinaturas. Verifique a conexão e tente novamente.';
        },
      });
  }

  openNew(): void {
    this.selectedSubscription = undefined;
    this.editMode = false;
    this.submitted = false;
    this.form.reset({
      name: '',
      amount: null,
      chargeDay: 1,
      startDate: parseLocalDate(this.today()),
      creditCardId: '',
    });
    this.dialogVisible = true;
  }

  edit(subscription: Subscription): void {
    this.selectedSubscription = subscription;
    this.editMode = true;
    this.submitted = false;
    this.form.reset({
      name: subscription.name,
      amount: Number(subscription.amount),
      chargeDay: subscription.chargeDay,
      startDate: parseLocalDate(subscription.startDate),
      creditCardId: subscription.creditCardId,
    });
    this.dialogVisible = true;
  }

  save(): void {
    if (this.saving) return;
    this.submitted = true;
    if (this.form.invalid || (this.editMode && !this.selectedSubscription)) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const common = {
      name: value.name!.trim(),
      amount: Number(value.amount),
      chargeDay: Number(value.chargeDay),
      creditCardId: value.creditCardId!,
    };
    const request: Observable<Subscription> = this.editMode
      ? this.service.update(this.selectedSubscription!.id, common as UpdateSubscriptionDto)
      : this.service.create({
          ...common,
          startDate: formatDateToString(value.startDate!),
        } as CreateSubscriptionDto);

    this.saving = true;
    request.subscribe({
      next: () => {
        this.saving = false;
        this.dialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Assinatura salva.',
        });
        this.loadSubscriptions();
      },
      error: () => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível salvar a assinatura.',
        });
      },
    });
  }

  cancel(subscription: Subscription): void {
    this.confirmationService.confirm({
      message: `Cancelar a assinatura "${subscription.name}"? As cobranças anteriores serão mantidas.`,
      header: 'Cancelar assinatura',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
        this.service.delete(subscription.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Assinatura cancelada.',
            });
            this.loadSubscriptions();
          },
          error: () =>
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível cancelar a assinatura.',
            }),
        }),
    });
  }

  private today(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private maxTwoDecimals(control: AbstractControl): ValidationErrors | null {
    const amount = Number(control.value);
    if (!Number.isFinite(amount)) return null;

    const cents = amount * 100;
    return Math.abs(Math.round(cents) - cents) > Number.EPSILON * Math.abs(cents)
      ? { maxTwoDecimals: true }
      : null;
  }

  private nonBlank(control: AbstractControl): ValidationErrors | null {
    return typeof control.value === 'string' && control.value.trim() ? null : { nonBlank: true };
  }
}
