import { describe, expect, it } from '@jest/globals';
import {
  addMonthsToPeriod,
  buildInstallmentFingerprint,
  buildRowFingerprint,
  buildSeriesKey,
  getSuggestedInvoicePeriod,
  roundMoney,
} from './import-key.utils';

describe('addMonthsToPeriod', () => {
  it('adds months across year boundaries', () => {
    expect(addMonthsToPeriod('2026-12', 1)).toBe('2027-01');
    expect(addMonthsToPeriod('2026-01', -1)).toBe('2025-12');
    expect(addMonthsToPeriod('2026-11', 3)).toBe('2027-02');
  });
});

describe('getSuggestedInvoicePeriod', () => {
  it('puts a transaction on the closing day in the next invoice', () => {
    expect(getSuggestedInvoicePeriod('2026-11-02', 2)).toBe('2026-12');
    expect(getSuggestedInvoicePeriod('2026-11-01', 2)).toBe('2026-11');
  });
});

describe('fingerprints', () => {
  const base = {
    creditCardId: 'card-1',
    invoicePeriod: '2026-12',
    date: '2026-11-13',
    normalizedTitle: 'iof de compra internacional',
    amount: 0.91,
  };

  it('uses the occurrence to distinguish identical rows', () => {
    const first = buildRowFingerprint({ ...base, occurrence: 0 });
    const second = buildRowFingerprint({ ...base, occurrence: 1 });

    expect(first).not.toBe(second);
    expect(buildRowFingerprint({ ...base, occurrence: 0 })).toBe(first);
  });

  it('creates the same series key regardless of the imported installment', () => {
    const startPeriod = '2026-11';
    const seriesKey = buildSeriesKey({
      creditCardId: 'card-1',
      normalizedTitle: 'mercadolivre infinity',
      totalInstallments: 4,
      startPeriod,
    });

    // December import: installment 2/4 -> startPeriod = 2026-11
    const decemberAnchor = addMonthsToPeriod('2026-12', -(2 - 1));
    // November import: installment 1/4 -> startPeriod = 2026-11
    const novemberAnchor = addMonthsToPeriod('2026-11', -(1 - 1));

    expect(decemberAnchor).toBe(novemberAnchor);
    expect(decemberAnchor).toBe(startPeriod);

    const fromDecember = buildSeriesKey({
      creditCardId: 'card-1',
      normalizedTitle: 'mercadolivre infinity',
      totalInstallments: 4,
      startPeriod: decemberAnchor,
    });

    expect(fromDecember).toBe(seriesKey);
  });

  it('creates different fingerprints per installment', () => {
    expect(buildInstallmentFingerprint('series', 2)).not.toBe(
      buildInstallmentFingerprint('series', 3),
    );
  });
});

describe('roundMoney', () => {
  it('rounds to cents', () => {
    expect(roundMoney(27.495)).toBe(27.5);
    expect(roundMoney(56.30000001)).toBe(56.3);
  });
});
