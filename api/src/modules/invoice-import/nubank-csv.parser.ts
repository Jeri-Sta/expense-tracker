export interface ParsedNubankRow {
  /** 1-based line number in the original file (useful for error messages). */
  line: number;
  /** Transaction date in YYYY-MM-DD format. */
  date: string;
  /** Original Nubank title, e.g. "Mercadolivre*Infinity - Parcela 2/4". */
  title: string;
  /** Amount in BRL. Negative values are payments/refunds. */
  amount: number;
}

export class NubankCsvParseError extends Error {
  constructor(
    message: string,
    public readonly line?: number,
  ) {
    super(line ? `Line ${line}: ${message}` : message);
    this.name = 'NubankCsvParseError';
  }
}

const EXPECTED_HEADER = ['date', 'title', 'amount'];

/**
 * Parses the CSV exported by Nubank (date,title,amount).
 *
 * The values are formatted in pt-BR ("48,82", "- 1.993,24") and some fields are
 * quoted, so a small RFC-4180-ish field splitter is used instead of splitting
 * on commas directly.
 */
export function parseNubankCsv(content: string): ParsedNubankRow[] {
  if (!content || !content.trim()) {
    throw new NubankCsvParseError('CSV file is empty');
  }

  const lines = content
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n');
  const rows: ParsedNubankRow[] = [];
  let headerSeen = false;

  for (let index = 0; index < lines.length; index++) {
    const rawLine = lines[index];
    if (!rawLine.trim()) continue;

    const lineNumber = index + 1;
    const fields = splitCsvLine(rawLine).map((field) => field.trim());

    if (!headerSeen) {
      const header = fields.map((field) => field.toLowerCase());
      const isValidHeader =
        header.length === EXPECTED_HEADER.length &&
        EXPECTED_HEADER.every((expected, position) => header[position] === expected);

      if (!isValidHeader) {
        throw new NubankCsvParseError('Invalid header. Expected "date,title,amount"', lineNumber);
      }

      headerSeen = true;
      continue;
    }

    if (fields.length !== 3) {
      throw new NubankCsvParseError('Expected 3 columns (date,title,amount)', lineNumber);
    }

    const [date, title, amountRaw] = fields;

    if (!title) {
      throw new NubankCsvParseError('Missing transaction title', lineNumber);
    }

    rows.push({
      line: lineNumber,
      date: assertIsoDate(date, lineNumber),
      title,
      amount: parseNubankAmount(amountRaw, lineNumber),
    });
  }

  if (!headerSeen) {
    throw new NubankCsvParseError('Invalid CSV: header not found');
  }

  return rows;
}

/**
 * Converts a Nubank amount ("48,82", "1.993,24", "- 1.993,24") to a number.
 * A dot is treated as a thousands separator when a comma is present.
 */
export function parseNubankAmount(raw: string, line?: number): number {
  const cleaned = raw.replace(/\s/g, '');
  if (!cleaned) {
    throw new NubankCsvParseError('Missing amount', line);
  }

  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned;

  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value)) {
    throw new NubankCsvParseError(`Invalid amount "${raw}"`, line);
  }

  return Math.round(value * 100) / 100;
}

function assertIsoDate(value: string, line: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new NubankCsvParseError(`Invalid date "${value}". Expected YYYY-MM-DD`, line);
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new NubankCsvParseError(`Invalid date "${value}"`, line);
  }

  return value;
}

/**
 * Splits one CSV line, honouring quoted fields and escaped quotes ("").
 */
export function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const character = line[index];

    if (inQuotes) {
      if (character === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index++;
        } else {
          inQuotes = false;
        }
      } else {
        current += character;
      }
      continue;
    }

    if (character === '"') {
      inQuotes = true;
    } else if (character === ',') {
      fields.push(current);
      current = '';
    } else {
      current += character;
    }
  }

  fields.push(current);
  return fields;
}
