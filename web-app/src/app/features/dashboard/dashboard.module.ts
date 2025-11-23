import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';

// Components
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    
    // PrimeNG Modules
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    ChartModule,
    DropdownModule,
    DividerModule
  ]
})
export class DashboardModule { }