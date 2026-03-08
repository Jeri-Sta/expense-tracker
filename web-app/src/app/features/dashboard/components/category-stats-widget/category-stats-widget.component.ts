import { Component, Input } from '@angular/core';
import { CategoryStats } from '../../../../core/types/common.types';
import { formatCurrency } from '../../../../shared/utils/format.utils';
import { normalizeIcon } from '../../../../shared/utils/icon.utils';

@Component({
  selector: 'app-category-stats-widget',
  templateUrl: './category-stats-widget.component.html',
  styleUrls: ['./category-stats-widget.component.scss'],
})
export class CategoryStatsWidgetComponent {
  @Input() categoryStats: CategoryStats[] = [];
  @Input() isLoading = false;

  readonly formatCurrency = formatCurrency;
  readonly normalizeIcon = normalizeIcon;
}
