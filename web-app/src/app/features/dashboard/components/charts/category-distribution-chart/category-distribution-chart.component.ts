import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-category-distribution-chart',
  templateUrl: './category-distribution-chart.component.html',
  styleUrls: ['./category-distribution-chart.component.scss']
})
export class CategoryDistributionChartComponent {
  @Input() chartData: any;
  @Input() chartOptions: any;
  @Input() isLoading = false;

  hasData(): boolean {
    if (!this.chartData?.datasets?.[0]?.data) {
      return false;
    }
    const data = this.chartData.datasets[0].data;
    return Array.isArray(data) && data.length > 0 && data.some((value: number) => value > 0);
  }
}
