/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Repository } from 'typeorm';
import { InvoiceImportService } from './invoice-import.service';
import { CardTransaction } from '../card-transactions/entities/card-transaction.entity';
import { CreditCard } from '../credit-cards/entities/credit-card.entity';
import { MerchantCategoryRule } from './entities/merchant-category-rule.entity';
import { CardTransactionsService } from '../card-transactions/card-transactions.service';
import { CategoriesService } from '../categories/categories.service';
import { ConfirmNubankImportDto } from './dto/confirm-nubank-import.dto';

const CARD = {
  id: 'card-1',
  name: 'Nubank',
  closingDay: 2,
  dueDay: 10,
  workspaceId: 'ws-1',
} as CreditCard;

const CSV = `date,title,amount
2026-11-16,Cooper,"48,82"
2026-11-02,Mercadolivre*Infinity - Parcela 2/4,"56,30"
`;

describe('InvoiceImportService', () => {
  let transactionRepository: any;
  let creditCardRepository: any;
  let ruleRepository: any;
  let cardTransactionsService: any;
  let categoriesService: any;
  let service: InvoiceImportService;

  beforeEach(() => {
    transactionRepository = {
      find: jest.fn(async (): Promise<CardTransaction[]> => []),
      count: jest.fn(async (): Promise<number> => 0),
      create: jest.fn((data: Partial<CardTransaction>) => ({ ...data })),
      save: jest.fn(async (data: CardTransaction | CardTransaction[]) =>
        Array.isArray(data)
          ? data.map((item, index) => ({ ...item, id: item.id ?? `tx-${index}` }))
          : { ...data, id: data.id ?? 'tx-single' },
      ),
    };

    creditCardRepository = {
      findOne: jest.fn(async () => CARD),
    };

    ruleRepository = {
      find: jest.fn(async () => []),
      findOne: jest.fn(async () => null),
      create: jest.fn((data: Partial<MerchantCategoryRule>) => ({ ...data })),
      save: jest.fn(async (data: MerchantCategoryRule) => ({ ...data, id: 'rule-1' })),
      softDelete: jest.fn(async () => undefined),
    };

    cardTransactionsService = {
      recalculateInvoiceTotals: jest.fn(async () => undefined),
      getInvoice: jest.fn(async () => ({ totalAmount: 225.2 })),
    };

    categoriesService = {
      validateForTransaction: jest.fn(async () => undefined),
    };

    service = new InvoiceImportService(
      transactionRepository as unknown as Repository<CardTransaction>,
      creditCardRepository as unknown as Repository<CreditCard>,
      ruleRepository as unknown as Repository<MerchantCategoryRule>,
      cardTransactionsService as unknown as CardTransactionsService,
      categoriesService as unknown as CategoriesService,
    );
  });

  it('previews a plain row and expands installments into future invoices', async () => {
    const result = await service.preview(
      'ws-1',
      { creditCardId: 'card-1', invoicePeriod: '2026-12' },
      {
        originalname: 'Nubank_2026-12-09.csv',
        size: CSV.length,
        buffer: Buffer.from(CSV),
      },
    );

    expect(result.rows).toHaveLength(2);

    const plain = result.rows[0];
    expect(plain).toMatchObject({
      title: 'Cooper',
      amount: 48.82,
      status: 'new',
      include: true,
      suggestedPeriod: '2026-12',
    });

    const installment = result.rows[1];
    expect(installment).toMatchObject({
      installmentNumber: 2,
      totalInstallments: 4,
      status: 'new',
      include: true,
    });
    expect(installment.generatedInstallments.map((item) => item.invoicePeriod)).toEqual([
      '2026-12',
      '2027-01',
      '2027-02',
    ]);
    expect(installment.generatedInstallments.map((item) => item.amount)).toEqual([
      56.3, 56.3, 56.3,
    ]);
    expect(result.summary.transactionsToCreate).toBe(4);
  });

  it('marks negative rows as payments and does not select them', async () => {
    const csv = 'date,title,amount\n2026-11-06,Pagamento recebido,"- 1.993,24"\n';

    const result = await service.preview(
      'ws-1',
      { creditCardId: 'card-1', invoicePeriod: '2026-12' },
      { originalname: 'x.csv', size: csv.length, buffer: Buffer.from(csv) },
    );

    expect(result.rows[0]).toMatchObject({ status: 'payment', include: false });
    expect(result.summary.transactionsToCreate).toBe(0);
  });

  it('skips a row whose fingerprint was already imported', async () => {
    transactionRepository.count.mockResolvedValue(1);

    const dto: ConfirmNubankImportDto = {
      creditCardId: 'card-1',
      invoicePeriod: '2026-12',
      rows: [
        {
          rowIndex: 0,
          date: '2026-11-16',
          title: 'Cooper',
          amount: 48.82,
          occurrence: 0,
          description: 'Cooper',
          categoryId: 'cat-1',
          include: true,
        },
      ],
    };

    const result = await service.confirm('user-1', 'ws-1', dto);

    expect(result.created).toBe(0);
    expect(result.skipped).toBe(1);
    expect(transactionRepository.save).not.toHaveBeenCalled();
    expect(cardTransactionsService.recalculateInvoiceTotals).not.toHaveBeenCalled();
  });

  it('creates the whole installment series from the imported installment', async () => {
    const dto: ConfirmNubankImportDto = {
      creditCardId: 'card-1',
      invoicePeriod: '2026-12',
      rows: [
        {
          rowIndex: 0,
          date: '2026-11-02',
          title: 'Mercadolivre*Infinity - Parcela 2/4',
          amount: 56.3,
          occurrence: 0,
          description: 'Mercadolivre*Infinity',
          categoryId: 'cat-1',
          include: true,
        },
      ],
    };

    const result = await service.confirm('user-1', 'ws-1', dto);

    expect(result.created).toBe(3);
    expect(result.periods.map((period) => period.period)).toEqual([
      '2026-12',
      '2027-01',
      '2027-02',
    ]);

    const created = transactionRepository.save.mock.calls[0][0] as CardTransaction[];
    expect(created.map((transaction) => transaction.installmentNumber)).toEqual([2, 3, 4]);
    expect(created.map((transaction) => transaction.amount)).toEqual([56.3, 56.3, 56.3]);
    expect(created.map((transaction) => transaction.invoicePeriod)).toEqual([
      '2026-12',
      '2027-01',
      '2027-02',
    ]);
    expect(created.every((transaction) => transaction.importSeriesKey)).toBe(true);
    expect(result.rulesSaved).toBe(1);
    expect(ruleRepository.save).toHaveBeenCalled();
  });

  it('does not duplicate installments that already exist in the series', async () => {
    transactionRepository.find.mockImplementation(
      async (options: { where: Record<string, unknown> }) => {
        if (options.where.importSeriesKey) {
          return [3, 4].map((number) => ({
            id: `existing-${number}`,
            installmentNumber: number,
            importSeriesKey: options.where.importSeriesKey,
            parentTransactionId: null,
          }));
        }
        return [];
      },
    );

    const dto: ConfirmNubankImportDto = {
      creditCardId: 'card-1',
      invoicePeriod: '2026-12',
      rows: [
        {
          rowIndex: 0,
          date: '2026-11-02',
          title: 'Mercadolivre*Infinity - Parcela 2/4',
          amount: 56.3,
          occurrence: 0,
          description: 'Mercadolivre*Infinity',
          categoryId: 'cat-1',
          include: true,
        },
      ],
    };

    const result = await service.confirm('user-1', 'ws-1', dto);

    expect(result.created).toBe(1);
    expect(result.skipped).toBe(2);
    const created = transactionRepository.save.mock.calls[0][0] as CardTransaction[];
    expect(created.map((transaction) => transaction.installmentNumber)).toEqual([2]);
  });
});
