import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ChipModule } from 'primeng/chip';

// Components
import { RecurringTransactionsComponent } from './recurring-transactions.component';
import { RecurringTransactionsRoutingModule } from './recurring-transactions-routing.module';

@NgModule({
  declarations: [
    RecurringTransactionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RecurringTransactionsRoutingModule,
    
    // PrimeNG Modules
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    InputTextareaModule,
    TagModule,
    BadgeModule,
    CardModule,
    ProgressSpinnerModule,
    ToggleButtonModule,
    ChipModule
  ]
})
export class RecurringTransactionsModule { }