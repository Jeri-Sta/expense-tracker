import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-region',
  templateUrl: './loading-region.component.html',
  styleUrls: ['./loading-region.component.scss'],
})
export class LoadingRegionComponent {
  @Input() loading = false;
  @Input() label = 'Carregando dados';
  @Input() minimumHeight = '8rem';
}
