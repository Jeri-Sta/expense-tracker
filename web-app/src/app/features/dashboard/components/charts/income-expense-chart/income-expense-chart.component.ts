import { Component, Input, OnInit } from '@angular/core';

type ViewMode = 'annual' | 'monthly';

interface ViewModeOption {
  label: string;
  value: ViewMode;
}

@Component({
  selector: 'app-income-expense-chart',
  templateUrl: './income-expense-chart.component.html',
  styleUrls: ['./income-expense-chart.component.scss'],
})
export class IncomeExpenseChartComponent implements OnInit {
  private readonly STORAGE_KEY = 'income_expense_chart_view_mode';

  @Input() chartData: any;
  @Input() chartOptions: any;
  @Input() isLoading = false;

  // Monthly data inputs
  @Input() monthlyIncome = 0;
  @Input() monthlyExpenses = 0;
  @Input() projectedMonthlyIncome = 0;
  @Input() projectedMonthlyExpenses = 0;

  // Context inputs
  @Input() showProjections = false;
  @Input() selectedMonthName = '';
  @Input() selectedYear = new Date().getFullYear();

  // View mode state
  viewMode: ViewMode = 'annual';
  viewModeOptions: ViewModeOption[] = [
    { label: 'Anual', value: 'annual' },
    { label: 'Mensal', value: 'monthly' },
  ];

  ngOnInit(): void {
    this.loadViewModeFromStorage();
  }

  private loadViewModeFromStorage(): void {
    const savedMode = localStorage.getItem(this.STORAGE_KEY);
    if (savedMode === 'annual' || savedMode === 'monthly') {
      this.viewMode = savedMode;
    }
  }

  onViewModeChange(): void {
    localStorage.setItem(this.STORAGE_KEY, this.viewMode);
  }

  get displayChartData(): any {
    if (this.viewMode === 'monthly') {
      const income = this.showProjections
        ? this.monthlyIncome + this.projectedMonthlyIncome
        : this.monthlyIncome;
      const expenses = this.showProjections
        ? this.monthlyExpenses + this.projectedMonthlyExpenses
        : this.monthlyExpenses;

      return {
        labels: ['Receitas', 'Despesas'],
        datasets: [
          {
            data: [income, expenses],
            backgroundColor: [
              this.getThemeColor('--success-color'),
              this.getThemeColor('--danger-color'),
            ],
            borderColor: [
              this.getThemeColor('--success-color'),
              this.getThemeColor('--danger-color'),
            ],
            borderWidth: 2,
          },
        ],
      };
    }
    return this.chartData;
  }

  get subtitleText(): string {
    if (this.viewMode === 'monthly') {
      return `${this.selectedMonthName} ${this.selectedYear}`;
    }
    return `Distribuição anual de ${this.selectedYear}`;
  }

  private getThemeColor(token: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  }
}
