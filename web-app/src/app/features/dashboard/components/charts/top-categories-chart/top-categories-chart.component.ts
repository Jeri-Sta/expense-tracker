import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-top-categories-chart',
  templateUrl: './top-categories-chart.component.html',
  styleUrls: ['./top-categories-chart.component.scss'],
})
export class TopCategoriesChartComponent {
  @Input() chartData: any;
  @Input() chartOptions: any;
  @Input() isLoading = false;

  hasData(): boolean {
    return this.chartData?.datasets?.[0]?.data?.length > 0;
  }
}
