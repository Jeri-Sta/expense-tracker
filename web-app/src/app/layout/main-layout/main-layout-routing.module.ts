import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../../features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'transactions',
        loadChildren: () => import('../../features/transactions/transactions.module').then(m => m.TransactionsModule)
      },
      {
        path: 'categories',
        loadChildren: () => import('../../features/categories/categories.module').then(m => m.CategoriesModule)
      },
      {
        path: 'recurring-transactions',
        loadChildren: () => import('../../features/recurring-transactions/recurring-transactions.module').then(m => m.RecurringTransactionsModule)
      },
      {
        path: 'installments',
        loadChildren: () => import('../../features/installments/installments.module').then(m => m.InstallmentsModule)
      },
      {
        path: 'credit-cards',
        loadChildren: () => import('../../features/credit-cards/credit-cards.module').then(m => m.CreditCardsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainLayoutRoutingModule { }