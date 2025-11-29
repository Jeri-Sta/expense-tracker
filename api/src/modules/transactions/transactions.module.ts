import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { ProjectionsService } from './projections.service';
import { Transaction } from './entities/transaction.entity';
import { RecurringTransaction } from '../recurring-transactions/entities/recurring-transaction.entity';
import { Installment } from '../installments/entities/installment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, RecurringTransaction, Installment])],
  controllers: [TransactionsController],
  providers: [TransactionsService, ProjectionsService],
  exports: [TransactionsService, ProjectionsService],
})
export class TransactionsModule {}