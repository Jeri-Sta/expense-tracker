import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-income-expense-chart',
  templateUrl: './income-expense-chart.component.html',
  styleUrls: ['./income-expense-chart.component.scss']
})
export class IncomeExpenseChartComponent {
  @Input() chartData: any;
  @Input() chartOptions: any;
  @Input() isLoading = false;
}
