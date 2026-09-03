import { CardTransactionsService } from './card-transactions.service';
import { describe, expect, it, jest } from '@jest/globals';

describe('CardTransactionsService', () => {
  const card = {
    id: 'card',
    closingDay: 25,
    dueDay: 5,
    name: 'Card',
  };

  function createService(invoiceStatus?: 'open' | 'closed' | 'paid') {
    let id = 0;
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn<() => Promise<{ total: number }>>().mockResolvedValue({ total: 0 }),
    };
    const transactionRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value: any) => {
        const addId = (item: any) => ({ ...item, id: item.id || `transaction-${++id}` });
        return Array.isArray(value) ? value.map(addId) : addId(value);
      }),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const invoiceRepository = {
      findOne: jest.fn(async () =>
        invoiceStatus ? { status: invoiceStatus, totalAmount: 0 } : null,
      ),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    };
    const service = new CardTransactionsService(
      transactionRepository as never,
      invoiceRepository as never,
      { findOne: jest.fn(async () => card) } as never,
      { validateForTransaction: jest.fn(async () => undefined) } as never,
    );
    return { service, transactionRepository };
  }

  it('uses the selected invoice even when the purchase date is outside its cycle', async () => {
    const { service, transactionRepository } = createService();

    await service.create('user', 'workspace', {
      description: 'Purchase',
      amount: 10,
      transactionDate: '2026-01-30',
      invoiceDuePeriod: '2026-03',
      creditCardId: 'card',
    });

    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ invoicePeriod: '2026-02', competencyPeriod: '2026-03' }),
    );
  });

  it('creates consecutive installments across December with an exact total', async () => {
    const { service, transactionRepository } = createService();

    await service.create('user', 'workspace', {
      description: 'Purchase',
      amount: 100,
      transactionDate: '2026-01-01',
      invoiceDuePeriod: '2026-12',
      creditCardId: 'card',
      isInstallment: true,
      totalInstallments: 3,
    });

    const installments = transactionRepository.create.mock.calls
      .map(([value]) => value as any)
      .filter((value) => value.isInstallment);
    expect(installments.map((item) => item.invoicePeriod)).toEqual([
      '2026-11',
      '2026-12',
      '2027-01',
    ]);
    expect(installments.map((item) => item.competencyPeriod)).toEqual([
      '2026-12',
      '2027-01',
      '2027-02',
    ]);
    expect(installments.reduce((sum, item) => sum + item.amount, 0)).toBe(100);
  });

  it('rejects creation when an affected invoice is closed', async () => {
    const { service, transactionRepository } = createService('closed');

    await expect(
      service.create('user', 'workspace', {
        description: 'Purchase',
        amount: 10,
        transactionDate: '2026-01-01',
        invoiceDuePeriod: '2026-02',
        creditCardId: 'card',
      }),
    ).rejects.toThrow('Invoice 2026-01 is not open');
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('filters the selected month by the stored competency', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getCount: jest.fn<() => Promise<number>>().mockResolvedValue(0),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn<() => Promise<never[]>>().mockResolvedValue([]),
    };
    const transactionRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const creditCardRepository = { find: jest.fn() };
    const service = new CardTransactionsService(
      transactionRepository as never,
      {} as never,
      creditCardRepository as never,
      {} as never,
    );

    await service.findAllPaginated('workspace', { dueYear: 2026, dueMonth: 9 });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'transaction.competencyPeriod = :competencyPeriod',
      { competencyPeriod: '2026-09' },
    );
    expect(creditCardRepository.find).not.toHaveBeenCalled();
  });
});
