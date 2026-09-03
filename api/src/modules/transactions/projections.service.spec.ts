import { RecurrenceFrequency } from '../../common/enums';
import { RecurringTransaction } from '../recurring-transactions/entities/recurring-transaction.entity';
import { ProjectionsService } from './projections.service';
import { describe, expect, it } from '@jest/globals';

describe('ProjectionsService', () => {
  it('advances quarterly projections by three months', () => {
    const service = new ProjectionsService({} as never, {} as never, {} as never, {} as never);
    const recurring = {
      frequency: RecurrenceFrequency.QUARTERLY,
      interval: 1,
    } as RecurringTransaction;

    const getNextExecutionDate = Reflect.get(service, 'getNextExecutionDate') as (
      recurring: RecurringTransaction,
      currentDate: Date,
    ) => Date;
    const next = getNextExecutionDate.call(service, recurring, new Date(2026, 0, 15, 12));

    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(3);
    expect(next.getDate()).toBe(15);
  });
});
