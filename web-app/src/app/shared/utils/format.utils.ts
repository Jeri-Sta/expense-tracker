/**
 * Utility functions for formatting values.
 */

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/**
 * Formats a numeric value as Brazilian Real currency.
 *
 * @param value - Number to format
 * @returns Formatted currency string (e.g. "R$ 1.234,56")
 */
export function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}

/**
 * Formats a competency period string (YYYY-MM) for display.
 *
 * @param period - Period string in YYYY-MM format
 * @returns Human-readable string (e.g. "Janeiro/2024")
 */
export function formatPeriod(period: string): string {
  const [year, month] = period.split('-');
  return `${MONTH_NAMES[Number.parseInt(month) - 1]}/${year}`;
}

/**
 * Returns available periods as label/value pairs for use in dropdowns.
 *
 * @param monthsBefore - Number of past months to include (default 12)
 * @param monthsAfter  - Number of future months to include (default 12)
 * @returns Array of { label, value } objects
 */
export function getAvailablePeriods(
  monthsBefore = 12,
  monthsAfter = 12,
): { label: string; value: string }[] {
  const periods: { label: string; value: string }[] = [];
  const now = new Date();

  for (let i = monthsBefore; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    periods.push({ label: formatPeriod(period), value: period });
  }

  for (let i = 1; i <= monthsAfter; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    periods.push({ label: formatPeriod(period), value: period });
  }

  return periods;
}
