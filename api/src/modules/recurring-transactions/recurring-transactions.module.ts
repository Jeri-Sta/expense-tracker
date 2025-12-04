import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { RecurringTransactionsController } from './recurring-transactions.controller';
import { RecurringTransactionsScheduler } from './recurring-transactions.scheduler';
import { RecurringTransaction } from './entities/recurring-transaction.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([RecurringTransaction]), TransactionsModule, CategoriesModule],
  controllers: [RecurringTransactionsController],
  providers: [RecurringTransactionsService, RecurringTransactionsScheduler],
  exports: [RecurringTransactionsService],
})
export class RecurringTransactionsModule {}
