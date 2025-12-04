import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  InstallmentListComponent,
  InstallmentFormComponent,
  InstallmentDetailsComponent,
} from './components';

const routes: Routes = [
  {
    path: '',
    component: InstallmentListComponent,
  },
  {
    path: 'new',
    component: InstallmentFormComponent,
  },
  {
    path: ':id',
    component: InstallmentDetailsComponent,
  },
  {
    path: ':id/edit',
    component: InstallmentFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstallmentsRoutingModule {}
