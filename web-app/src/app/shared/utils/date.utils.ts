/**
 * Utility functions for handling dates without timezone issues.
 */

/**
 * Parses a date string (YYYY-MM-DD or ISO format) to a Date object at noon local time
 * to avoid timezone conversion issues.
 *
 * @param dateString - Date string in YYYY-MM-DD or ISO format
 * @returns Date object at noon local time
 */
export function parseLocalDate(dateString: string | Date): Date {
  if (dateString instanceof Date) {
    return dateString;
  }

  // Extract just the date part (YYYY-MM-DD)
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);

  // Create date at noon local time to avoid timezone shifts
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * Parses a competency period string (YYYY-MM) to a Date object.
 *
 * @param periodString - Period string in YYYY-MM format
 * @returns Date object representing the first day of the month at noon
 */
export function parseCompetencyPeriod(periodString: string): Date {
  const [year, month] = periodString.split('-').map(Number);
  return new Date(year, month - 1, 1, 12, 0, 0, 0);
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 *
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object to YYYY-MM string for competency period.
 *
 * @param date - Date object to format
 * @returns Period string in YYYY-MM format
 */
export function formatCompetencyPeriod(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Returns the number of days between today (midnight) and a future/past date (midnight).
 * Positive = date is in the future; negative = date is in the past.
 *
 * @param date - Target date as a Date object or string
 * @returns Number of days (may be negative if overdue)
 */
export function getDaysUntilDate(date: Date | string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Returns true if the given date is strictly before today (midnight).
 *
 * @param date - Target date as a Date object or string
 * @returns true if the date has already passed
 */
export function isDateOverdue(date: Date | string): boolean {
  return getDaysUntilDate(date) < 0;
}
