import { describe, expect, it } from '@jest/globals';
import { extractInstallment, normalizeMerchantTitle } from './merchant-normalizer';

describe('extractInstallment', () => {
  it.each([
    ['Mercadolivre*Infinity - Parcela 2/4', 'Mercadolivre*Infinity', 2, 4],
    ['Service Garagem - Parcela 2/4', 'Service Garagem', 2, 4],
    ['Amazon PSJ - NuPay - Parcela 1/2', 'Amazon PSJ - NuPay', 1, 2],
    ['Compra qualquer Parcela 3 de 6', 'Compra qualquer', 3, 6],
  ])('extracts "%s"', (title, baseTitle, number, total) => {
    expect(extractInstallment(title)).toEqual({
      baseTitle,
      installmentNumber: number,
      totalInstallments: total,
    });
  });

  it('returns null for a regular purchase', () => {
    expect(extractInstallment('Uber Uber *Trip Help.U')).toBeNull();
  });

  it('returns null for inconsistent installment numbers', () => {
    expect(extractInstallment('Compra - Parcela 5/4')).toBeNull();
  });
});

describe('normalizeMerchantTitle', () => {
  it('keeps the same key for volatile Nubank codes', () => {
    expect(normalizeMerchantTitle('Sqcloud* Inv 1d5fe0a40')).toBe('sqcloud');
    expect(normalizeMerchantTitle('Sqcloud* Inv 1bbb3ccf6')).toBe('sqcloud');
  });

  it('removes installment suffixes', () => {
    expect(normalizeMerchantTitle('Mercadolivre*Infinity - Parcela 2/4')).toBe(
      'mercadolivre infinity',
    );
  });

  it('removes order codes and accents', () => {
    expect(normalizeMerchantTitle('Dl*Spotify P4931')).toBe('dl spotify');
    expect(normalizeMerchantTitle('Farmácia Omino')).toBe('farmacia omino');
  });

  it('does not merge different merchants', () => {
    expect(normalizeMerchantTitle('Mercadolivre*Mercadol')).not.toBe(
      normalizeMerchantTitle('Mercadolivre*Infinity'),
    );
  });
});
