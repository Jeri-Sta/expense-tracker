import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG Modules (shared across the app)
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

// Shared Components
import { MaskedCalendarComponent } from './components/masked-calendar/masked-calendar.component';

// Shared Directives
import { DateMaskDirective } from './directives/date-mask.directive';

@NgModule({
  declarations: [MaskedCalendarComponent, DateMaskDirective],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    CalendarModule,
    CardModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    CalendarModule,
    CardModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    MaskedCalendarComponent,
    DateMaskDirective,
  ],
})
export class SharedModule {}
