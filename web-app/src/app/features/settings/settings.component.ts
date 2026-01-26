import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { MessageService } from 'primeng/api';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  isWorkspaceOwner = false;
  isLoading = true;

  private readonly authService = inject(AuthService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly messageService = inject(MessageService);
  private readonly loadingService = inject(LoadingService);

  ngOnInit(): void {
    this.isWorkspaceOwner = this.authService.isWorkspaceOwner();
    this.loadingService.hide();
    this.isLoading = false;
  }
}
