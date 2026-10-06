import { Component, inject, OnInit } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);

  ngOnInit(): void {
    this.loadingService.hide();
  }
}
