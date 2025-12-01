import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Configuration
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { RecurringTransactionsModule } from './modules/recurring-transactions/recurring-transactions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { InstallmentsModule } from './modules/installments/installments.module';
import { CreditCardsModule } from './modules/credit-cards/credit-cards.module';
import { CardTransactionsModule } from './modules/card-transactions/card-transactions.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),

    // Scheduling for recurring transactions
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    RecurringTransactionsModule,
    DashboardModule,
    InstallmentsModule,
    CreditCardsModule,
    CardTransactionsModule,
  ],
})
export class AppModule {}