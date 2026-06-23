import { Component, Input } from '@angular/core';
import { BudgetGoalItem } from '../../../../core/types/common.types';
import { formatCurrency } from '../../../../shared/utils/format.utils';
import { normalizeIcon } from '../../../../shared/utils/icon.utils';

@Component({
  selector: 'app-budget-goals-widget',
  templateUrl: './budget-goals-widget.component.html',
  styleUrls: ['./budget-goals-widget.component.scss'],
})
export class BudgetGoalsWidgetComponent {
  @Input() goals: BudgetGoalItem[] = [];
  @Input() isLoading = false;

  readonly formatCurrency = formatCurrency;
  readonly normalizeIcon = normalizeIcon;

  getProgressValue(goal: BudgetGoalItem): number {
    if (goal.budget <= 0) return 0;
    return Math.min((goal.actual / goal.budget) * 100, 100);
  }

  getProgressColor(goal: BudgetGoalItem): string {
    const pct = goal.budget > 0 ? (goal.actual / goal.budget) * 100 : 0;
    if (pct >= 100) return '#EF4444';
    if (pct >= 80) return '#F59E0B';
    return '#10B981';
  }

  getRemainingAmount(goal: BudgetGoalItem): number {
    return Math.max(0, goal.budget - goal.actual);
  }

  getOverAmount(goal: BudgetGoalItem): number {
    return Math.max(0, goal.actual - goal.budget);
  }
}
