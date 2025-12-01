import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

// Components
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { CardLimitsWidgetComponent } from './components/card-limits-widget/card-limits-widget.component';
import { InstallmentsWidgetComponent } from './components/installments-widget/installments-widget.component';
import { CardTransactionsWidgetComponent } from './components/card-transactions-widget/card-transactions-widget.component';

@NgModule({
  declarations: [
    DashboardComponent,
    CardLimitsWidgetComponent,
    InstallmentsWidgetComponent,
    CardTransactionsWidgetComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DashboardRoutingModule,
    
    // PrimeNG Modules
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    ChartModule,
    DropdownModule,
    DividerModule,
    ToggleButtonModule,
    TooltipModule,
    TagModule
  ]
})
export class DashboardModule { }