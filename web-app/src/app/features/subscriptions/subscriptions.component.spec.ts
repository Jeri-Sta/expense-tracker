import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { of, Subject, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription, SubscriptionService } from '../../core/services/subscription.service';
import { CreditCardService } from '../credit-cards/services/credit-card.service';
import { SubscriptionsComponent } from './subscriptions.component';

describe('SubscriptionsComponent', () => {
  let fixture: ComponentFixture<SubscriptionsComponent>;
  let component: SubscriptionsComponent;
  let service: jasmine.SpyObj<SubscriptionService>;
  let cards: jasmine.SpyObj<CreditCardService>;
  let confirm: jasmine.SpyObj<ConfirmationService>;
  let acceptCancel: (() => void) | undefined;

  const card = {
    id: 'card-1',
    name: 'Visa',
    isActive: true,
  } as unknown as import('../credit-cards/models/credit-card.model').CreditCard;
  const subscription = {
    id: 'sub-1',
    name: 'Streaming',
    amount: 12.5,
    chargeDay: 10,
    startDate: '2026-01-01',
    nextChargeDate: '2026-11-10',
    creditCardId: 'card-1',
    creditCardName: 'Visa',
    isActive: true,
  } as Subscription;

  beforeEach(async () => {
    service = jasmine.createSpyObj<SubscriptionService>('SubscriptionService', [
      'getAll',
      'create',
      'update',
      'delete',
    ]);
    cards = jasmine.createSpyObj<CreditCardService>('CreditCardService', ['getAll']);
    confirm = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);
    confirm.confirm.and.callFake((options) => {
      acceptCancel = options.accept as () => void;
      return confirm;
    });
    service.getAll.and.returnValue(of([]));
    service.create.and.returnValue(of(subscription));
    service.update.and.returnValue(of(subscription));
    service.delete.and.returnValue(of(void 0));
    cards.getAll.and.returnValue(of([card]));

    await TestBed.configureTestingModule({
      declarations: [SubscriptionsComponent],
      imports: [ReactiveFormsModule, CalendarModule, InputNumberModule],
      providers: [
        { provide: SubscriptionService, useValue: service },
        { provide: CreditCardService, useValue: cards },
        { provide: ConfirmationService, useValue: confirm },
        { provide: MessageService, useValue: { add: jasmine.createSpy('add') } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(SubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the empty state and nominal active monthly sum', () => {
    expect(fixture.nativeElement.textContent).toContain('Nenhuma assinatura cadastrada');
    component.cards = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhum cartão ativo disponível');
    component.subscriptions = [subscription, { ...subscription, id: 'sub-2', isActive: false }];
    expect(component.activeMonthlyTotal).toBe(12.5);
  });

  it('does not show the empty state after a failed list request', () => {
    service.getAll.and.returnValue(throwError(() => new Error('load failed')));
    component.loadSubscriptions();
    fixture.detectChanges();

    expect(component.loadError).toContain('Não foi possível carregar as assinaturas');
    expect(fixture.nativeElement.textContent).not.toContain('Nenhuma assinatura cadastrada');
  });

  it('validates amount and charge day, then submits the selected card once', () => {
    component.openNew();
    component.form.patchValue({
      name: 'S'.repeat(256),
      amount: 12.345,
      chargeDay: 32,
      creditCardId: 'card-1',
    });
    component.save();
    expect(component.form.controls.amount.invalid).toBeTrue();
    expect(component.form.controls.chargeDay.invalid).toBeTrue();
    expect(component.form.controls.name.hasError('maxlength')).toBeTrue();
    expect(service.create).not.toHaveBeenCalled();

    const pending = new Subject<Subscription>();
    service.create.and.returnValue(pending);
    component.form.patchValue({ name: 'Streaming', amount: 12.34, chargeDay: 10 });
    component.save();
    component.save();
    expect(service.create).toHaveBeenCalledTimes(1);
    expect(service.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'Streaming', creditCardId: 'card-1' }),
    );
    pending.next(subscription);
    pending.complete();
  });

  it('omits start date when editing and handles update and cancel errors', () => {
    const inactiveCard = { ...card, isActive: false };
    cards.getAll.and.returnValue(of([inactiveCard]));
    component.cards = [inactiveCard];
    component.edit(subscription);
    expect(component.form.controls.creditCardId.value).toBe('card-1');
    expect(component.cardOptions).toHaveSize(1);
    expect(component.cardOptions[0].isActive).toBeFalse();
    service.update.and.returnValue(throwError(() => new Error('update failed')));
    component.save();
    expect(service.update).toHaveBeenCalledWith(
      'sub-1',
      jasmine.objectContaining({ creditCardId: 'card-1' }),
    );
    expect(service.update.calls.mostRecent().args[1] as object).not.toEqual(
      jasmine.objectContaining({ startDate: jasmine.anything() }),
    );

    service.delete.and.returnValue(throwError(() => new Error('delete failed')));
    component.cancel(subscription);
    acceptCancel?.();
    expect(service.delete).toHaveBeenCalledWith('sub-1');
  });
});
