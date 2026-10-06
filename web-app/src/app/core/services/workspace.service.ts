import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
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
