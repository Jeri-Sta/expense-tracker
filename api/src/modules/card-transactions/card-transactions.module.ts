import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardTransactionsService } from './card-transactions.service';
import { CardTransactionsController } from './card-transactions.controller';
import { CardTransaction } from './entities/card-transaction.entity';
import { Invoice } from './entities/invoice.entity';
import { CreditCard } from '../credit-cards/entities/credit-card.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CardTransaction, Invoice, CreditCard]),
  ],
  controllers: [CardTransactionsController],
  providers: [CardTransactionsService],
  exports: [CardTransactionsService],
})
export class CardTransactionsModule {}
