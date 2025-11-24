import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// Local Components
import { InstallmentsRoutingModule } from './installments-routing.module';
import {
  InstallmentListComponent,
  InstallmentFormComponent,
  InstallmentDetailsComponent,
} from './components';

@NgModule({
  declarations: [
    InstallmentListComponent,
    InstallmentFormComponent,
    InstallmentDetailsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InstallmentsRoutingModule,

    // PrimeNG
    ButtonModule,
    CardModule,
    TableModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    SelectButtonModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    TagModule,
    TooltipModule,
    DialogModule,
    ConfirmDialogModule,
  ],
})
export class InstallmentsModule {}