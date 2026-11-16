import { describe, expect, it } from '@jest/globals';
import {
  NubankCsvParseError,
  parseNubankAmount,
  parseNubankCsv,
  splitCsvLine,
} from './nubank-csv.parser';

const SAMPLE = `date,title,amount
2026-11-16,Cooper,"48,82"
2026-11-13,IOF de compra internacional,"0,91"
2026-11-13,IOF de compra internacional,"0,91"
2026-11-06,Pagamento recebido,"- 1.993,24"
2026-11-02,Mercadolivre*Infinity - Parcela 2/4,"1.056,30"
`;

describe('parseNubankCsv', () => {
  it('parses the Nubank header and pt-BR amounts', () => {
    const rows = parseNubankCsv(SAMPLE);

    expect(rows).toHaveLength(5);
    expect(rows[0]).toMatchObject({ date: '2026-11-16', title: 'Cooper', amount: 48.82 });
    expect(rows[1].amount).toBe(0.91);
    expect(rows[3]).toMatchObject({ title: 'Pagamento recebido', amount: -1993.24 });
    expect(rows[4]).toMatchObject({
      title: 'Mercadolivre*Infinity - Parcela 2/4',
      amount: 1056.3,
    });
  });

  it('accepts BOM and CRLF line endings', () => {
    const content = '\uFEFFdate,title,amount\r\n2026-11-16,Cooper,"48,82"\r\n';
    const rows = parseNubankCsv(content);

    expect(rows).toHaveLength(1);
    expect(rows[0].amount).toBe(48.82);
  });

  it('throws a helpful error for an invalid header', () => {
    expect(() => parseNubankCsv('data,descricao,valor\n2026-11-16,Cooper,48,82')).toThrow(
      NubankCsvParseError,
    );
  });

  it('throws when a row has the wrong number of columns', () => {
    expect(() => parseNubankCsv('date,title,amount\n2026-11-16,Cooper')).toThrow(
      'Expected 3 columns',
    );
  });

  it('throws for an invalid date', () => {
    expect(() => parseNubankCsv('date,title,amount\n2026-02-30,Cooper,"48,82"')).toThrow(
      'Invalid date',
    );
  });

  it('throws for an empty file', () => {
    expect(() => parseNubankCsv('')).toThrow('CSV file is empty');
  });

  it('rejects transaction titles longer than the column limit', () => {
    const longTitle = 'A'.repeat(256);
    expect(() => parseNubankCsv(`date,title,amount\n2026-11-16,${longTitle},"1,00"`)).toThrow(
      'too long',
    );
  });

  it('rejects lines above the safety limit', () => {
    expect(() => splitCsvLine('A'.repeat(100_001))).toThrow('CSV line is too long');
  });
});

describe('parseNubankAmount', () => {
  it.each([
    ['"48,82"', 48.82],
    ['"1.993,24"', 1993.24],
    ['"- 1.993,24"', -1993.24],
    ['"0,91"', 0.91],
    ['27.50', 27.5],
  ])('parses %s as %s', (raw, expected) => {
    expect(parseNubankAmount(raw.replace(/"/g, ''))).toBe(expected);
  });

  it('throws for a non numeric amount', () => {
    expect(() => parseNubankAmount('abc')).toThrow('Invalid amount');
  });
});

describe('splitCsvLine', () => {
  it('splits quoted fields and keeps commas inside quotes', () => {
    expect(splitCsvLine('2026-11-16,"Mercado, Livre","48,82"')).toEqual([
      '2026-11-16',
      'Mercado, Livre',
      '48,82',
    ]);
  });

  it('handles escaped quotes', () => {
    expect(splitCsvLine('2026-11-16,"Loja ""X""",10,00')).toEqual([
      '2026-11-16',
      'Loja "X"',
      '10',
      '00',
    ]);
  });
});
