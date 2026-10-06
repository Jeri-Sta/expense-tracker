import { Component, Input, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';

export type ResponsiveActionIntent = 'primary' | 'secondary' | 'danger';

export interface ResponsiveAction {
  label: string;
  icon?: string;
  command: () => void;
  disabled?: boolean;
  intent?: ResponsiveActionIntent;
}

@Component({
  selector: 'app-responsive-actions',
  templateUrl: './responsive-actions.component.html',
  styleUrls: ['./responsive-actions.component.scss'],
})
export class ResponsiveActionsComponent {
  @Input({ required: true }) primaryAction!: ResponsiveAction;
  @Input() secondaryActions: ResponsiveAction[] = [];
  @Input() moreLabel = 'Mais ações';
  @Input() align: 'start' | 'end' = 'end';

  @ViewChild('moreMenu') private moreMenu?: Menu;

  get menuItems(): MenuItem[] {
    return this.secondaryActions.map((action) => ({
      label: action.label,
      icon: action.icon,
      disabled: action.disabled,
      command: () => action.command(),
      styleClass: action.intent === 'danger' ? 'responsive-action-danger' : undefined,
    }));
  }

  run(action: ResponsiveAction): void {
    if (!action.disabled) {
      action.command();
    }
  }

  toggleMore(event: Event): void {
    this.moreMenu?.toggle(event);
  }

  buttonClass(action: ResponsiveAction): string {
    if (action.intent === 'danger') return 'p-button-danger';
    if (action.intent === 'secondary') return 'p-button-secondary p-button-outlined';
    return 'p-button-primary';
  }
}
