import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardTransaction } from '../card-transactions/entities/card-transaction.entity';
import { CreditCard } from '../credit-cards/entities/credit-card.entity';
import { CardTransactionsModule } from '../card-transactions/card-transactions.module';
import { CategoriesModule } from '../categories/categories.module';
import { MerchantCategoryRule } from './entities/merchant-category-rule.entity';
import { InvoiceImportController } from './invoice-import.controller';
import { InvoiceImportService } from './invoice-import.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CardTransaction, CreditCard, MerchantCategoryRule]),
    CardTransactionsModule,
    CategoriesModule,
  ],
  controllers: [InvoiceImportController],
  providers: [InvoiceImportService],
})
export class InvoiceImportModule {}
