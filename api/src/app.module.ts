import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Configuration
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';

// Modules
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { RecurringTransactionsModule } from './modules/recurring-transactions/recurring-transactions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { InstallmentsModule } from './modules/installments/installments.module';
import { CreditCardsModule } from './modules/credit-cards/credit-cards.module';
import { CardTransactionsModule } from './modules/card-transactions/card-transactions.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { ApplicationContextGuard } from './common/guards/application-context.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env.local', '.env', '../.env'],
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
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    RecurringTransactionsModule,
    DashboardModule,
    InstallmentsModule,
    CreditCardsModule,
    CardTransactionsModule,
    WorkspacesModule,
    ApiKeysModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApplicationContextGuard,
    },
  ],
})
export class AppModule {}
