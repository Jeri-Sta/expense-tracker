/**
 * Shared utilities for invoice period calculations.
 * These functions are used across credit-cards, card-transactions, dashboard,
 * and projections modules to avoid duplicated logic.
 */

/**
 * Calculates the invoice period (YYYY-MM) for a transaction based on the card's closing day.
 * If the transaction date is on or after the closing day it falls into the next month's invoice.
 */
export function calculateInvoicePeriod(transactionDate: Date, closingDay: number): string {
  const txDate = new Date(transactionDate);
  const day = txDate.getDate();
  let month = txDate.getMonth();
  let year = txDate.getFullYear();

  if (day >= closingDay) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/**
 * Returns the invoice period(s) (YYYY-MM[]) whose due date falls in the given target month/year.
 *
 * Rule:
 *  - If dueDay <= closingDay, the invoice of period X is due in month X+1
 *    → the invoice due in the target month is from the previous month.
 *  - Otherwise the invoice of period X is due in the same month X.
 */
export function getInvoicePeriodsWithDueDateInMonth(
  closingDay: number,
  dueDay: number,
  targetYear: number,
  targetMonth: number,
): string[] {
  const dueDateIsNextMonth = dueDay <= closingDay;

  if (dueDateIsNextMonth) {
    let invoiceMonth = targetMonth - 1;
    let invoiceYear = targetYear;
    if (invoiceMonth < 1) {
      invoiceMonth = 12;
      invoiceYear -= 1;
    }
    return [`${invoiceYear}-${String(invoiceMonth).padStart(2, '0')}`];
  }

  return [`${targetYear}-${String(targetMonth).padStart(2, '0')}`];
}
