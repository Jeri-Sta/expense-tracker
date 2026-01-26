import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { WorkspaceService } from '../../../../core/services/workspace.service';
import { MessageService } from 'primeng/api';
import { LoadingService } from '../../../../core/services/loading.service';

@Component({
  selector: 'app-invite-user',
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.scss'],
})
export class InviteUserComponent implements OnInit {
  @Output() invitationSent = new EventEmitter<void>();

  inviteForm!: FormGroup;
  isLoading = false;

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly messageService = inject(MessageService);
  private readonly loadingService = inject(LoadingService);

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.inviteForm = this.formBuilder.group({
      invitedEmail: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  onSubmit(): void {
    if (this.inviteForm.valid) {
      this.isLoading = true;
      this.loadingService.show();

      const workspaceId = this.authService.getWorkspaceId();
      if (!workspaceId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Workspace não encontrado',
        });
        this.isLoading = false;
        this.loadingService.hide();
        return;
      }

      this.workspaceService
        .sendInvitation(workspaceId, {
          invitedEmail: this.inviteForm.value.invitedEmail,
          firstName: this.inviteForm.value.firstName,
        })
        .subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Convite Enviado',
              detail: `Convite enviado para ${this.inviteForm.value.invitedEmail}`,
            });
            this.inviteForm.reset();
            this.invitationSent.emit();
            this.isLoading = false;
            this.loadingService.hide();
          },
          error: (error) => {
            console.error('Invitation error:', error);
            const message =
              error.error?.message || 'Erro ao enviar convite';
            this.messageService.add({
              severity: 'error',
              summary: 'Erro ao Enviar Convite',
              detail: message,
            });
            this.isLoading = false;
            this.loadingService.hide();
          },
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    for (const key of Object.keys(this.inviteForm.controls)) {
      const control = this.inviteForm.get(key);
      control?.markAsTouched();
    }
  }

  get invitedEmail() {
    return this.inviteForm.get('invitedEmail');
  }

  get firstName() {
    return this.inviteForm.get('firstName');
  }
}
