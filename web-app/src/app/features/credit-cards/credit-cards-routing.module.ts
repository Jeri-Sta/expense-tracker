import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreditCardListComponent } from './pages/credit-card-list/credit-card-list.component';
import { CardTransactionsComponent } from './pages/card-transactions/card-transactions.component';

const routes: Routes = [
  { path: '', component: CreditCardListComponent },
  { path: 'transactions', component: CardTransactionsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreditCardsRoutingModule { }
