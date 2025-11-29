import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurringTransactionsService } from './recurring-transactions.service';

@Injectable()
export class RecurringTransactionsScheduler {
  private readonly logger = new Logger(RecurringTransactionsScheduler.name);

  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Checking for due recurring transactions...');
    
    try {
      const dueTransactions = await this.recurringTransactionsService.findDueRecurringTransactions();
      
      if (dueTransactions.length === 0) {
        this.logger.log('No due recurring transactions found.');
        return;
      }

      this.logger.log(`Found ${dueTransactions.length} due recurring transactions. Processing...`);

      let successCount = 0;
      let errorCount = 0;

      for (const transaction of dueTransactions) {
        try {
          await this.recurringTransactionsService.execute(transaction.id, transaction.userId);
          successCount++;
        } catch (error) {
          this.logger.error(
            `Failed to execute recurring transaction ${transaction.id}: ${error.message}`,
            error.stack,
          );
          errorCount++;
        }
      }

      this.logger.log(
        `Recurring transactions processing completed. Success: ${successCount}, Errors: ${errorCount}`,
      );
    } catch (error) {
      this.logger.error('Error processing recurring transactions', error.stack);
    }
  }
}
