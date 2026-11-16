import { createHash } from 'crypto';
import { calculateInvoicePeriod } from '../../common/utils/invoice.utils';
import { parseLocalDate } from '../../common/utils/date.utils';

export const NUBANK_IMPORT_SOURCE = 'nubank_csv';

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Adds (or subtracts, with negative months) months to a YYYY-MM period. */
export function addMonthsToPeriod(period: string, months: number): string {
  const [year, month] = period.split('-').map(Number);
  const totalMonths = year * 12 + (month - 1) + months;
  const nextYear = Math.floor(totalMonths / 12);
  const nextMonth = (totalMonths % 12) + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
}

export function getSuggestedInvoicePeriod(date: string, closingDay: number): string {
  return calculateInvoicePeriod(parseLocalDate(date), closingDay);
}

export interface RowFingerprintInput {
  creditCardId: string;
  invoicePeriod: string;
  date: string;
  normalizedTitle: string;
  amount: number;
  occurrence: number;
}

/**
 * Fingerprint of a plain CSV row. `occurrence` disambiguates identical rows
 * inside the same file (Nubank often repeats "IOF de compra internacional").
 */
export function buildRowFingerprint(input: RowFingerprintInput): string {
  return sha256(
    [
      NUBANK_IMPORT_SOURCE,
      input.creditCardId,
      input.invoicePeriod,
      input.date,
      input.normalizedTitle,
      input.amount.toFixed(2),
      input.occurrence,
    ].join('|'),
  );
}

export interface SeriesKeyInput {
  creditCardId: string;
  normalizedTitle: string;
  totalInstallments: number;
  /** Invoice period of installment 1. */
  startPeriod: string;
}

/**
 * Identifies an installment series independently of which installment is being
 * imported. The anchor is the first installment's invoice period, so importing
 * December first or November first produces the same key.
 */
export function buildSeriesKey(input: SeriesKeyInput): string {
  return sha256(
    [
      NUBANK_IMPORT_SOURCE,
      input.creditCardId,
      input.normalizedTitle,
      input.totalInstallments,
      input.startPeriod,
    ].join('|'),
  );
}

export function buildInstallmentFingerprint(seriesKey: string, installmentNumber: number): string {
  return sha256(`${seriesKey}|${installmentNumber}`);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
