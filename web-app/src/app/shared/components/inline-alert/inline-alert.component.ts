import { Component, EventEmitter, Input, Output } from '@angular/core';

export type InlineAlertSeverity = 'info' | 'warning' | 'error';

@Component({
  selector: 'app-inline-alert',
  templateUrl: './inline-alert.component.html',
  styleUrls: ['./inline-alert.component.scss'],
})
export class InlineAlertComponent {
  @Input({ required: true }) message = '';
  @Input() title = 'Não foi possível carregar os dados';
  @Input() severity: InlineAlertSeverity = 'error';
  @Input() retryLabel = 'Tentar novamente';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();

  get icon(): string {
    if (this.severity === 'warning') return 'pi pi-exclamation-triangle';
    if (this.severity === 'info') return 'pi pi-info-circle';
    return 'pi pi-times-circle';
  }
}
