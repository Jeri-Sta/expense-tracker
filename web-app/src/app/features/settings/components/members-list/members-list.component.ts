import { Component, inject, OnInit } from '@angular/core';
import { WorkspaceService, WorkspaceMember } from '../../../../core/services/workspace.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-members-list',
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.scss'],
})
export class MembersListComponent implements OnInit {
  members: WorkspaceMember[] = [];
  isLoading = true;
  currentUserId: string | null = null;

  private readonly workspaceService = inject(WorkspaceService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUser?.id || null;
    this.loadMembers();
  }

  private loadMembers(): void {
    const workspaceId = this.authService.getWorkspaceId();
    if (!workspaceId) {
      this.isLoading = false;
      return;
    }

    this.workspaceService.getMembers(workspaceId).subscribe({
      next: (members) => {
        this.members = members;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar membros',
        });
        this.isLoading = false;
      },
    });
  }

  getMemberStatus(member: WorkspaceMember): string {
    if (member.isInvitedUser) {
      return 'Convidado';
    }
    return member.id === this.currentUserId ? 'Você (Proprietário)' : 'Membro';
  }

  getMemberStatusSeverity(member: WorkspaceMember): 'success' | 'info' {
    if (member.isInvitedUser) {
      return 'info';
    }
    return 'success';
  }
}
