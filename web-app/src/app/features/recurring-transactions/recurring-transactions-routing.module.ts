import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecurringTransactionsComponent } from './recurring-transactions.component';

const routes: Routes = [
  {
    path: '',
    component: RecurringTransactionsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecurringTransactionsRoutingModule {}
