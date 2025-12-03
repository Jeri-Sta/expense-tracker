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
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { SkeletonModule } from 'primeng/skeleton';

// Components
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { CardLimitsWidgetComponent } from './components/card-limits-widget/card-limits-widget.component';
import { InstallmentsWidgetComponent } from './components/installments-widget/installments-widget.component';
import { CardTransactionsWidgetComponent } from './components/card-transactions-widget/card-transactions-widget.component';
import { KpiCardsWidgetComponent } from './components/kpi-cards-widget/kpi-cards-widget.component';
import { FinancingsSummaryWidgetComponent } from './components/financings-summary-widget/financings-summary-widget.component';
import { InstallmentPlansWidgetComponent } from './components/installment-plans-widget/installment-plans-widget.component';
import { MonthlyTrendChartComponent } from './components/charts/monthly-trend-chart/monthly-trend-chart.component';
import { IncomeExpenseChartComponent } from './components/charts/income-expense-chart/income-expense-chart.component';
import { CategoryDistributionChartComponent } from './components/charts/category-distribution-chart/category-distribution-chart.component';
import { TopCategoriesChartComponent } from './components/charts/top-categories-chart/top-categories-chart.component';
import { RecentTransactionsWidgetComponent } from './components/recent-transactions-widget/recent-transactions-widget.component';
import { UpcomingRecurringWidgetComponent } from './components/upcoming-recurring-widget/upcoming-recurring-widget.component';
import { CategoryStatsWidgetComponent } from './components/category-stats-widget/category-stats-widget.component';
import { MonthlyExpenseBreakdownWidgetComponent } from './components/monthly-expense-breakdown-widget/monthly-expense-breakdown-widget.component';

@NgModule({
  declarations: [
    DashboardComponent,
    CardLimitsWidgetComponent,
    InstallmentsWidgetComponent,
    CardTransactionsWidgetComponent,
    KpiCardsWidgetComponent,
    FinancingsSummaryWidgetComponent,
    InstallmentPlansWidgetComponent,
    MonthlyTrendChartComponent,
    IncomeExpenseChartComponent,
    CategoryDistributionChartComponent,
    TopCategoriesChartComponent,
    RecentTransactionsWidgetComponent,
    UpcomingRecurringWidgetComponent,
    CategoryStatsWidgetComponent,
    MonthlyExpenseBreakdownWidgetComponent
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
    SelectButtonModule,
    TooltipModule,
    TagModule,
    TabViewModule,
    SkeletonModule
  ]
})
export class DashboardModule { }