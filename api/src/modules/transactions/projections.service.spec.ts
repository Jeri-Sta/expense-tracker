import { describe, expect, it, jest } from '@jest/globals';
import { RecurrenceFrequency } from '../../common/enums';
import { RecurringTransaction } from '../recurring-transactions/entities/recurring-transaction.entity';
import { ProjectionsService } from './projections.service';

describe('ProjectionsService', () => {
  it('advances quarterly projections by three months', () => {
    const service = new ProjectionsService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const recurring = {
      frequency: RecurrenceFrequency.QUARTERLY,
      interval: 1,
    } as RecurringTransaction;

    const getNextExecutionDate = Reflect.get(service, 'getNextExecutionDate') as (
      recurring: RecurringTransaction,
      currentDate: Date,
    ) => Date;
    const next = getNextExecutionDate.call(service, recurring, new Date(2026, 0, 15, 12));

    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(3);
    expect(next.getDate()).toBe(15);
  });

  it('projects an anchored charge into its invoice period and excludes it after charging', async () => {
    const queries: string[] = [];
    let actualCharges: { subscriptionId: string; subscriptionChargeDate: string }[] = [];
    let cardTotal: string | number = '0';
    const sub = {
      id: 'subscription-1',
      workspaceId: 'workspace-1',
      amount: 30,
      chargeDay: 28,
      nextChargeDate: '2026-02-28',
      isActive: true,
      creditCard: { closingDay: 25 },
    };
    const subscriptionRepository = { find: jest.fn(async () => [sub]) };
    const cardTransactionRepository = {
      find: jest.fn(async () => actualCharges),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn((condition: string) => {
          queries.push(condition);
          return { getRawOne: async () => ({ total: cardTotal }) };
        }),
      })),
    };
    const service = new ProjectionsService(
      { find: jest.fn(async () => []) } as never,
      {} as never,
      {
        createQueryBuilder: jest.fn(() => ({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn(async () => []),
        })),
      } as never,
      cardTransactionRepository as never,
      subscriptionRepository as never,
    );
    const calculateMonthStats = Reflect.get(service, 'calculateMonthStats') as (
      workspaceId: string,
      year: number,
      month: number,
    ) => Promise<{
      projectedExpenses: number;
      projectedBalance: number;
      hasProjections: boolean;
      projectedTransactionCount: number;
      totalExpenses: number;
    }>;

    const forecast = await calculateMonthStats.call(service, 'workspace-1', 2026, 3);
    expect(forecast.projectedExpenses).toBe(30);
    expect(forecast.projectedBalance).toBe(-30);
    expect(forecast.projectedTransactionCount).toBe(1);
    expect(forecast.hasProjections).toBe(true);
    expect(subscriptionRepository.find).toHaveBeenCalledWith({
      where: { workspaceId: 'workspace-1', isActive: true },
      relations: ['creditCard'],
    });

    actualCharges = [{ subscriptionId: sub.id, subscriptionChargeDate: '2026-02-28' }];
    cardTotal = '30';
    cardTransactionRepository.createQueryBuilder.mockImplementationOnce(
      () =>
        ({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn((condition: string) => {
            queries.push(condition);
            return { getRawOne: async () => ({ total: cardTotal }) };
          }),
        }) as never,
    );
    const charged = await calculateMonthStats.call(service, 'workspace-1', 2026, 3);
    expect(charged.projectedExpenses).toBe(0);
    expect(charged.projectedTransactionCount).toBe(0);
    expect(charged.hasProjections).toBe(false);
    expect(charged.totalExpenses).toBe(30);
    expect(queries).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'transaction.subscriptionId IS NOT NULL AND transaction.invoicePeriod',
        ),
      ]),
    );
  });

  it('clamps day 31 and projects across the year boundary', async () => {
    const service = new ProjectionsService(
      { find: jest.fn(async () => []) } as never,
      {} as never,
      {
        createQueryBuilder: jest.fn(() => ({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn(async () => []),
        })),
      } as never,
      {
        find: jest.fn(async () => []),
        createQueryBuilder: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnValue({ getRawOne: async () => ({ total: 0 }) }),
        })),
      } as never,
      {
        find: jest.fn(async () => [
          {
            id: 'sub-31',
            name: 'Subscription 31',
            amount: 12,
            chargeDay: 31,
            nextChargeDate: '2025-12-31',
            creditCard: { closingDay: 25 },
          },
        ]),
      } as never,
    );
    const getSubscriptionProjections = Reflect.get(service, 'getSubscriptionProjections') as (
      workspaceId: string,
      year: number,
      month: number,
    ) => Promise<{ name: string; chargeDate: string; amount: number }[]>;

    await expect(getSubscriptionProjections.call(service, 'workspace-1', 2026, 1)).resolves.toEqual(
      [{ name: 'Subscription 31', chargeDate: '2025-12-31', amount: 12 }],
    );
  });
});
