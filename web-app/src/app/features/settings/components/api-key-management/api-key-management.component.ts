import { Component, inject, OnInit } from '@angular/core';
import {
  WorkspaceService,
  ApiKeyInfo,
  GeneratedApiKey,
} from '../../../../core/services/workspace.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-api-key-management',
  templateUrl: './api-key-management.component.html',
  styleUrls: ['./api-key-management.component.scss'],
})
export class ApiKeyManagementComponent implements OnInit {
  apiKeyInfo: ApiKeyInfo | null = null;
  isLoading = true;
  showGeneratedKey = false;
  generatedKey = '';
  copiedKey = false;

  private readonly workspaceService = inject(WorkspaceService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadApiKeyInfo();
  }

  private loadApiKeyInfo(): void {
    this.workspaceService.getApiKeyInfo().subscribe({
      next: (info) => {
        this.apiKeyInfo = info;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  generateKey(): void {
    this.isLoading = true;
    this.workspaceService.generateApiKey().subscribe({
      next: (response: GeneratedApiKey) => {
        this.generatedKey = response.key;
        this.apiKeyInfo = {
          isActive: response.isActive,
          createdAt: response.createdAt,
          lastUsedAt: response.lastUsedAt,
          expiresAt: response.expiresAt,
        };
        this.showGeneratedKey = true;
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Chave de API gerada com sucesso',
        });
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao gerar chave de API',
        });
      },
    });
  }

  revokeKey(): void {
    this.confirmationService.confirm({
      message:
        'Tem certeza que deseja revogar esta chave de API? Ela deixará de funcionar imediatamente.',
      header: 'Revogar Chave de API',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isLoading = true;
        this.workspaceService.revokeApiKey().subscribe({
          next: () => {
            this.apiKeyInfo = null;
            this.showGeneratedKey = false;
            this.generatedKey = '';
            this.isLoading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Chave de API revogada com sucesso',
            });
          },
          error: () => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao revogar chave de API',
            });
          },
        });
      },
    });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.copiedKey = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Copiado',
          detail: 'Chave copiada para a área de transferência',
        });
        setTimeout(() => {
          this.copiedKey = false;
        }, 2000);
      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível copiar a chave',
        });
      });
  }
}
