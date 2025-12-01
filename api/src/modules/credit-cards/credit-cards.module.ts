import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditCardsService } from './credit-cards.service';
import { CreditCardsController } from './credit-cards.controller';
import { CreditCard } from './entities/credit-card.entity';
import { CardTransaction } from '../card-transactions/entities/card-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreditCard, CardTransaction])],
  controllers: [CreditCardsController],
  providers: [CreditCardsService],
  exports: [CreditCardsService],
})
export class CreditCardsModule {}
