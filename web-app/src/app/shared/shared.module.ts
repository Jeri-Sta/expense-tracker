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
import { MenuModule } from 'primeng/menu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Shared Components
import { MaskedCalendarComponent } from './components/masked-calendar/masked-calendar.component';
import { InlineAlertComponent } from './components/inline-alert/inline-alert.component';
import { LoadingRegionComponent } from './components/loading-region/loading-region.component';
import { ResponsiveActionsComponent } from './components/responsive-actions/responsive-actions.component';
import { ResponsiveDataViewComponent } from './components/responsive-data-view/responsive-data-view.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';

// Shared Directives
import { DateMaskDirective } from './directives/date-mask.directive';

@NgModule({
  declarations: [
    MaskedCalendarComponent,
    DateMaskDirective,
    InlineAlertComponent,
    LoadingRegionComponent,
    ResponsiveActionsComponent,
    ResponsiveDataViewComponent,
    PageHeaderComponent,
  ],
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
    MenuModule,
    ProgressSpinnerModule,
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
    MenuModule,
    ProgressSpinnerModule,
    MaskedCalendarComponent,
    DateMaskDirective,
    InlineAlertComponent,
    LoadingRegionComponent,
    ResponsiveActionsComponent,
    ResponsiveDataViewComponent,
    PageHeaderComponent,
  ],
})
export class SharedModule {}
