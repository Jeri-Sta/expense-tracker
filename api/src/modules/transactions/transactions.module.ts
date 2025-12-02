import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { ProjectionsService } from './projections.service';
import { Transaction } from './entities/transaction.entity';
import { RecurringTransaction } from '../recurring-transactions/entities/recurring-transaction.entity';
import { Installment } from '../installments/entities/installment.entity';
import { CreditCard } from '../credit-cards/entities/credit-card.entity';
import { CardTransaction } from '../card-transactions/entities/card-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, RecurringTransaction, Installment, CreditCard, CardTransaction])],
  controllers: [TransactionsController],
  providers: [TransactionsService, ProjectionsService],
  exports: [TransactionsService, ProjectionsService],
})
export class TransactionsModule {}