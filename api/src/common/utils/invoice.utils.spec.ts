import { getInvoiceCompetencyPeriod, getInvoicePeriodFromDuePeriod } from './invoice.utils';
import { describe, expect, it } from '@jest/globals';

describe('getInvoiceCompetencyPeriod', () => {
  it('uses the same month when the invoice is due after closing', () => {
    expect(getInvoiceCompetencyPeriod('2026-08', 10, 20)).toBe('2026-08');
  });

  it('uses the next month when the invoice is due before closing', () => {
    expect(getInvoiceCompetencyPeriod('2026-12', 25, 5)).toBe('2027-01');
  });
});

describe('getInvoicePeriodFromDuePeriod', () => {
  it('crosses the year boundary when payment is due after closing', () => {
    expect(getInvoicePeriodFromDuePeriod('2027-01', 25, 5)).toBe('2026-12');
  });

  it('keeps the due month when payment is due after closing', () => {
    expect(getInvoicePeriodFromDuePeriod('2026-08', 10, 20)).toBe('2026-08');
  });
});
