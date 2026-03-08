import { TransactionType } from '../../core/types/common.types';

/**
 * Returns the CSS class for an installment progress bar based on completion percentage.
 *
 * @param percentage - Completion percentage (0–100)
 * @returns CSS class string
 */
export function getProgressBarClass(percentage: number): string {
  if (percentage < 30) return 'progress-danger';
  if (percentage < 70) return 'progress-warning';
  return 'progress-success';
}

/**
 * Returns the Portuguese display label for a transaction type.
 *
 * @param type - Transaction type ('income' | 'expense')
 * @returns 'Receita' or 'Despesa'
 */
export function getTransactionTypeLabel(type: TransactionType): string {
  return type === 'income' ? 'Receita' : 'Despesa';
}

/**
 * Returns the CSS text-color class for a transaction type.
 *
 * @param type - Transaction type ('income' | 'expense')
 * @returns Tailwind text-color class
 */
export function getTransactionTypeClass(type: TransactionType): string {
  return type === 'income' ? 'text-green-600' : 'text-red-600';
}

/**
 * Returns the arithmetic sign character for a transaction type.
 *
 * @param type - Transaction type ('income' | 'expense')
 * @returns '+' for income, '-' for expense
 */
export function getTransactionSign(type: string): string {
  return type === 'income' ? '+' : '-';
}
