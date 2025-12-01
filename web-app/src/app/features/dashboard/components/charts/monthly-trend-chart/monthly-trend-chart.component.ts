import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-monthly-trend-chart',
  templateUrl: './monthly-trend-chart.component.html',
  styleUrls: ['./monthly-trend-chart.component.scss']
})
export class MonthlyTrendChartComponent {
  @Input() chartData: any;
  @Input() chartOptions: any;
  @Input() isLoading = false;
}
