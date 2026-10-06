import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-responsive-data-view',
  templateUrl: './responsive-data-view.component.html',
  styleUrls: ['./responsive-data-view.component.scss'],
})
export class ResponsiveDataViewComponent<T> {
  @Input() items: T[] = [];
  @Input() mobileLabel = 'Registros';

  @ContentChild('desktopView', { read: TemplateRef }) desktopView?: TemplateRef<unknown>;
  @ContentChild('mobileView', { read: TemplateRef }) mobileView?: TemplateRef<{
    $implicit: T;
    index: number;
  }>;
}
