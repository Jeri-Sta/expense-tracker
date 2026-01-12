import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface WorkspaceMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isInvitedUser: boolean;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: Date;
}

export interface Invitation {
  id: string;
  workspaceId: string;
  invitedEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  expiresAt: Date;
  createdAt: Date;
}

export interface SendInvitationRequest {
  invitedEmail: string;
  firstName: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private readonly apiService = inject(ApiService);
  private readonly http = inject(HttpClient);

  getWorkspace(): Observable<Workspace> {
    return this.apiService.get<Workspace>('/workspaces/me');
  }

  getMembers(workspaceId: string): Observable<WorkspaceMember[]> {
    return this.apiService.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
  }

  sendInvitation(workspaceId: string, request: SendInvitationRequest): Observable<Invitation> {
    return this.apiService.post<Invitation>(`/invitations/workspaces/${workspaceId}/send`, request);
  }

  resendInvitation(invitationId: string): Observable<Invitation> {
    return this.apiService.patch<Invitation>(`/invitations/${invitationId}/resend`, {});
  }

  cancelInvitation(invitationId: string): Observable<void> {
    return this.apiService.delete<void>(`/invitations/${invitationId}`);
  }

  getPendingInvitations(workspaceId: string): Observable<Invitation[]> {
    return this.apiService.post<Invitation[]>(`/invitations/workspaces/${workspaceId}/pending`, {});
  }

  acceptInvitation(
    token: string,
    email: string,
    firstName: string,
    password: string,
  ): Observable<any> {
    return this.apiService.patch<any>(`/invitations/accept/${token}`, {
      email,
      firstName,
      password,
    });
  }
}
