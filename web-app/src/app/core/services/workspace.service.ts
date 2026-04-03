import { Injectable, inject } from '@angular/core';
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
}

export interface ApiKeyInfo {
  isActive: boolean;
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}

export interface GeneratedApiKey {
  key: string;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private readonly apiService = inject(ApiService);

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

  generateApiKey(): Observable<GeneratedApiKey> {
    return this.apiService.post<GeneratedApiKey>('/api-keys', {});
  }

  getApiKeyInfo(): Observable<ApiKeyInfo | null> {
    return this.apiService.get<ApiKeyInfo | null>('/api-keys');
  }

  revokeApiKey(): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>('/api-keys');
  }
}
