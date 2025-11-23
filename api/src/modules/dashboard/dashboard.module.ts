import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { CategoriesModule } from '../categories/categories.module';
import { InstallmentsModule } from '../installments/installments.module';

@Module({
  imports: [TransactionsModule, CategoriesModule, InstallmentsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}