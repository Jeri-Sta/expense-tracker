import { splitAmount } from './money.utils';
import { describe, expect, it } from '@jest/globals';

describe('splitAmount', () => {
  it('preserves every cent when the amount is not evenly divisible', () => {
    const installments = splitAmount(100, 3);

    expect(installments).toEqual([33.33, 33.33, 33.34]);
    expect(installments.reduce((sum, value) => sum + value, 0)).toBe(100);
  });
});
