import { Component, Input } from '@angular/core';
import { CategoryStats } from '../../../../shared/types/dashboard.types';
import { DashboardUtilsService } from '../../../../shared/services/dashboard-utils.service';

@Component({
  selector: 'app-category-stats-widget',
  templateUrl: './category-stats-widget.component.html',
  styleUrls: ['./category-stats-widget.component.scss']
})
export class CategoryStatsWidgetComponent {
  @Input() categoryStats: CategoryStats[] = [];
  @Input() isLoading = false;

  constructor(private readonly utils: DashboardUtilsService) {}

  formatCurrency(value: number): string {
    return this.utils.formatCurrency(value);
  }

  normalizeIcon(icon: string): string {
    return this.utils.normalizeIcon(icon);
  }
}
