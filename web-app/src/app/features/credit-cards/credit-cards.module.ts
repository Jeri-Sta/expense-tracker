import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';

// Routing
import { CreditCardsRoutingModule } from './credit-cards-routing.module';

// Components
import { CreditCardListComponent } from './pages/credit-card-list/credit-card-list.component';
import { CardTransactionsComponent } from './pages/card-transactions/card-transactions.component';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [CreditCardListComponent, CardTransactionsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CreditCardsRoutingModule,

    // PrimeNG Modules
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ColorPickerModule,
    InputNumberModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    TooltipModule,
    TagModule,
    TableModule,
    CalendarModule,
    CheckboxModule,
    SharedModule,
  ],
})
export class CreditCardsModule {}
