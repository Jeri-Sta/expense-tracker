import { Component, inject, OnInit } from '@angular/core';
import { WorkspaceService, Invitation } from '../../../../core/services/workspace.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LoadingService } from '../../../../core/services/loading.service';

@Component({
  selector: 'app-workspace-management',
  templateUrl: './workspace-management.component.html',
  styleUrls: ['./workspace-management.component.scss'],
})
export class WorkspaceManagementComponent implements OnInit {
  pendingInvitations: Invitation[] = [];
  isLoading = true;
  showInviteDialog = false;

  private readonly workspaceService = inject(WorkspaceService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly loadingService = inject(LoadingService);

  ngOnInit(): void {
    this.loadPendingInvitations();
  }

  private loadPendingInvitations(): void {
    const workspaceId = this.authService.getWorkspaceId();
    if (!workspaceId) {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Workspace não encontrado',
      });
      return;
    }

    this.workspaceService.getPendingInvitations(workspaceId).subscribe({
      next: (invitations) => {
        this.pendingInvitations = invitations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invitations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar convites',
        });
        this.isLoading = false;
      },
    });
  }

  openInviteDialog(): void {
    this.showInviteDialog = true;
  }

  onInvitationSent(): void {
    this.showInviteDialog = false;
    this.loadPendingInvitations();
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Convite enviado com sucesso',
    });
  }

  resendInvitation(invitation: Invitation): void {
    this.confirmationService.confirm({
      message: `Reenviar convite para ${invitation.invitedEmail}?`,
      header: 'Reenviar Convite',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.workspaceService.resendInvitation(invitation.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Convite reenviado com sucesso',
            });
            this.loadPendingInvitations();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao reenviar convite',
            });
          },
        });
      },
    });
  }

  cancelInvitation(invitation: Invitation): void {
    this.confirmationService.confirm({
      message: `Cancelar convite para ${invitation.invitedEmail}?`,
      header: 'Cancelar Convite',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.workspaceService.cancelInvitation(invitation.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Convite cancelado',
            });
            this.loadPendingInvitations();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao cancelar convite',
            });
          },
        });
      },
    });
  }

  getExpiryStatus(expiresAt: Date): string {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const daysRemaining = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return 'Expirado';
    } else if (daysRemaining === 0) {
      return 'Expira hoje';
    } else if (daysRemaining === 1) {
      return 'Expira amanhã';
    } else {
      return `Expira em ${daysRemaining} dias`;
    }
  }
}
