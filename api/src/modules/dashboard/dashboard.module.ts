import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { CategoriesModule } from '../categories/categories.module';
import { InstallmentsModule } from '../installments/installments.module';
import { Transaction } from '../transactions/entities/transaction.entity';
import { InstallmentPlan } from '../installments/entities/installment-plan.entity';
import { Installment } from '../installments/entities/installment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, InstallmentPlan, Installment]),
    TransactionsModule,
    CategoriesModule,
    InstallmentsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}