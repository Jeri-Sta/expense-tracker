import { describe, expect, it } from '@jest/globals';
import { reconcileMonthlyTotals } from './dashboard.service';

describe('reconcileMonthlyTotals', () => {
  it('uses the detailed breakdown as the source of truth', () => {
    const result = reconcileMonthlyTotals({ totalIncome: 1000, totalExpenses: 999, balance: 1 }, [
      { type: 'transaction', name: 'Transações', amount: 100, icon: '', color: '' },
      { type: 'credit-card', name: 'Cartão', amount: 200, icon: '', color: '' },
      { type: 'financing', name: 'Financiamento', amount: 300, icon: '', color: '' },
      { type: 'total', name: 'Total Geral', amount: 600, icon: '', color: '' },
    ]);

    expect(result.totalExpenses).toBe(600);
    expect(result.balance).toBe(400);
  });
});
