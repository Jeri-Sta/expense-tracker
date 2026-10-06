import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Interceptors
import { ErrorInterceptor } from './interceptors/error.interceptor';

// Services
import { ApiService } from './services/api.service';
import { LoadingService } from './services/loading.service';
import { TransactionService } from './services/transaction.service';
import { CategoryService } from './services/category.service';
import { RecurringTransactionService } from './services/recurring-transaction.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule],
  providers: [
    // Services
    ApiService,
    LoadingService,
    TransactionService,
    CategoryService,
    RecurringTransactionService,

    // Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
