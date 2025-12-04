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
