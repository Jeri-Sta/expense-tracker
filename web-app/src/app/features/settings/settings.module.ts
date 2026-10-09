import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

import { ApiKeyManagementComponent } from './components/api-key-management/api-key-management.component';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [SettingsComponent, ApiKeyManagementComponent],
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    TagModule,
    TooltipModule,
    SettingsRoutingModule,
    SharedModule,
  ],
  providers: [ConfirmationService],
})
export class SettingsModule {}
