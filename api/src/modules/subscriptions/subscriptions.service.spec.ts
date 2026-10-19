import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import { InvoiceStatus } from '../../common/enums';
import { CardTransaction } from '../card-transactions/entities/card-transaction.entity';
import { Invoice } from '../card-transactions/entities/invoice.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionsService } from './subscriptions.service';

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

describe('SubscriptionsService', () => {
  it.each([
    ['2024-01-31', 31, '2024-01-31'],
    ['2024-02-01', 31, '2024-02-29'],
    ['2023-02-01', 31, '2023-02-28'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2026-02-28', 31, '2026-02-28'],
  ])('anchors day %i from %s as %s', (target, day, expected) => {
    const service = new SubscriptionsService({} as never, {} as never, {} as never);
    expect((service as any).nextOccurrence(target, day)).toBe(expected);
  });

  it('starts a past-dated subscription at the first charge day on or after today', async () => {
    let savedSubscription: any;
    const subscriptionRepo: any = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value: any) => {
        savedSubscription = { ...value, id: 'sub' };
        return savedSubscription;
      }),
      findOne: jest.fn(async () => ({ ...savedSubscription, creditCard: { name: 'Card' } })),
    };
    const cardRepo = { findOne: jest.fn(async () => ({ isActive: true })) };
    const service = new SubscriptionsService(
      subscriptionRepo as never,
      cardRepo as never,
      {} as never,
    );
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    const past = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const chargeDay = Math.min(31, new Date().getDate() + 1);

    const result = await service.create('user', 'workspace', {
      name: 'Subscription',
      amount: 12,
      chargeDay,
      startDate: past,
      creditCardId: 'card',
    });

    expect(result.nextChargeDate >= today()).toBe(true);
    expect(subscriptionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: past, userId: 'user', workspaceId: 'workspace' }),
    );
  });

  it('does not skip an overdue charge when changing the billing day', async () => {
    const subscription = {
      id: 'sub',
      name: 'Subscription',
      amount: 12,
      chargeDay: 1,
      nextChargeDate: '2024-01-01',
      startDate: '2024-01-01',
      creditCardId: 'card',
      userId: 'user',
      workspaceId: 'workspace',
      isActive: true,
    };
    const subscriptions = {
      findOne: jest.fn(async () => ({ ...subscription, creditCard: { name: 'Card' } })),
      save: jest.fn(async (value: typeof subscription) => Object.assign(subscription, value)),
    };
    const service = new SubscriptionsService(
      subscriptions as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.update('sub', 'user', 'workspace', { chargeDay: 31 }),
    ).rejects.toThrow('Cannot change charge day while a charge is pending');

    expect(subscriptions.save).not.toHaveBeenCalled();
    expect(subscription.nextChargeDate).toBe('2024-01-01');
  });

  it('rejects cards outside the workspace or inactive cards', async () => {
    const service = new SubscriptionsService(
      {} as never,
      { findOne: jest.fn(async () => null) } as never,
      {} as never,
    );
    await expect((service as any).findActiveCard('foreign-card', 'workspace')).rejects.toThrow(
      'Active credit card not found',
    );
  });

  it('scopes reads and deactivates instead of deleting', async () => {
    const subscriptions = {
      findOne: jest.fn(async () => null),
      update: jest.fn(async () => ({ affected: 1 })),
    };
    const service = new SubscriptionsService(subscriptions as never, {} as never, {} as never);

    await expect(service.findOne('sub', 'workspace')).rejects.toThrow('Subscription not found');
    await service.remove('sub', 'workspace');

    expect(subscriptions.findOne).toHaveBeenCalledWith({
      where: { id: 'sub', workspaceId: 'workspace' },
      relations: ['creditCard'],
    });
    expect(subscriptions.update).toHaveBeenCalledWith(
      { id: 'sub', workspaceId: 'workspace' },
      { isActive: false },
    );
  });

  it('keeps a closed invoice and the pending date unchanged when a charge fails', async () => {
    const sub = {
      id: 'sub',
      isActive: true,
      nextChargeDate: today(),
      creditCardId: 'card',
      chargeDay: new Date().getDate(),
      userId: 'user',
    } as Subscription;
    const invoice = { status: InvoiceStatus.PAID } as Invoice;
    const lockQuery = (result: unknown) => ({
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(async () => result),
      getOneOrFail: jest.fn(async () => result),
    });
    const subscriptionQuery = lockQuery(sub);
    const invoiceQuery = lockQuery(invoice);
    const subscriptionRepo = {
      createQueryBuilder: jest.fn(() => subscriptionQuery),
      save: jest.fn(),
    };
    let invoiceQueryCount = 0;
    const invoiceRepo: any = {
      createQueryBuilder: jest.fn(() => {
        invoiceQueryCount++;
        return invoiceQueryCount === 1
          ? {
              insert: jest.fn().mockReturnThis(),
              values: jest.fn().mockReturnThis(),
              orIgnore: jest.fn().mockReturnThis(),
              execute: jest.fn(async () => undefined),
            }
          : invoiceQuery;
      }),
    };
    const transactionRepo = {
      findOne: jest.fn(async () => null),
      create: jest.fn((value) => value),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    const manager = {
      getRepository: (entity: unknown) =>
        entity === Subscription
          ? subscriptionRepo
          : entity === Invoice
            ? invoiceRepo
            : entity === CardTransaction
              ? transactionRepo
              : { findOne: jest.fn(async () => ({ id: 'card', closingDay: 25, dueDay: 5 })) },
    };
    const service = new SubscriptionsService(
      {} as never,
      {} as never,
      { transaction: (callback: (manager: unknown) => unknown) => callback(manager) } as never,
    );

    await expect((service as any).chargeOccurrence('sub', 'workspace')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(transactionRepo.save).not.toHaveBeenCalled();
    expect(subscriptionRepo.save).not.toHaveBeenCalled();
    expect(sub.nextChargeDate).toBe(today());
  });

  it('writes a card charge, invoice total, and next date as one idempotent occurrence', async () => {
    const sub = {
      id: 'sub',
      name: 'Subscription',
      amount: 15,
      isActive: true,
      nextChargeDate: today(),
      chargeDay: new Date().getDate(),
      creditCardId: 'card',
      userId: 'user',
    } as Subscription;
    const invoice = { status: InvoiceStatus.OPEN, totalAmount: 0 } as Invoice;
    const query = (result: unknown) => ({
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(async () => result),
      getOneOrFail: jest.fn(async () => result),
    });
    const subscriptionQuery = query(sub);
    const invoiceQuery = query(invoice);
    const subscriptionRepo = {
      createQueryBuilder: jest.fn(() => subscriptionQuery),
      save: jest.fn(async (value: Subscription) => value),
    };
    const invoiceRepo = {
      createQueryBuilder: jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: jest.fn(async () => undefined),
      })),
      save: jest.fn(async (value: Invoice) => value),
    };
    let invoiceQueries = 0;
    invoiceRepo.createQueryBuilder = jest.fn(() => {
      invoiceQueries++;
      return invoiceQueries === 1
        ? {
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            orIgnore: jest.fn().mockReturnThis(),
            execute: jest.fn(async () => undefined),
          }
        : invoiceQuery;
    }) as never;
    const transactionRepo = {
      findOne: jest.fn(async () => null),
      create: jest.fn((value: CardTransaction) => value),
      save: jest.fn(async (value: CardTransaction) => value),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(async () => ({ total: '15' })),
      })),
    };
    const cardRepo = { findOne: jest.fn(async () => ({ id: 'card', closingDay: 25, dueDay: 5 })) };
    const manager = {
      getRepository: (entity: unknown) =>
        entity === Subscription
          ? subscriptionRepo
          : entity === Invoice
            ? invoiceRepo
            : entity === CardTransaction
              ? transactionRepo
              : cardRepo,
    };
    const service = new SubscriptionsService(
      {} as never,
      {} as never,
      { transaction: (callback: (manager: unknown) => unknown) => callback(manager) } as never,
    );

    await (service as any).chargeOccurrence('sub', 'workspace');
    await (service as any).chargeOccurrence('sub', 'workspace');

    expect(transactionRepo.save).toHaveBeenCalledTimes(1);
    expect(transactionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriptionId: 'sub',
        subscriptionChargeDate: today(),
        invoicePeriod: expect.any(String),
        competencyPeriod: expect.any(String),
      }),
    );
    expect(invoice.totalAmount).toBe(15);
    expect(sub.nextChargeDate > today()).toBe(true);
    expect(subscriptionRepo.save).toHaveBeenCalledTimes(1);
  });
});
