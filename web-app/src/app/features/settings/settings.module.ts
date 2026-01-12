import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';

import { WorkspaceManagementComponent } from './components/workspace-management/workspace-management.component';
import { InviteUserComponent } from './components/invite-user/invite-user.component';
import { MembersListComponent } from './components/members-list/members-list.component';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';

@NgModule({
  declarations: [
    SettingsComponent,
    WorkspaceManagementComponent,
    InviteUserComponent,
    MembersListComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    TagModule,
    SettingsRoutingModule,
  ],
  providers: [MessageService, ConfirmationService],
})
export class SettingsModule {}
