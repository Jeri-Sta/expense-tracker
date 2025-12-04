import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - redirect to login
          this.authService.logout().subscribe(() => {
            this.router.navigate(['/auth/login']);
          });
          this.showErrorMessage('Sessão expirada. Faça login novamente.');
        } else if (error.status === 403) {
          // Forbidden
          this.showErrorMessage('Acesso negado.');
        } else if (error.status === 404) {
          // Not found
          this.showErrorMessage('Recurso não encontrado.');
        } else if (error.status >= 500) {
          // Server errors
          this.showErrorMessage('Erro interno do servidor. Tente novamente mais tarde.');
        } else if (error.status === 0) {
          // Network error
          this.showErrorMessage('Erro de conexão. Verifique sua internet.');
        } else {
          // Other client errors
          const message = error.error?.message || 'Erro desconhecido.';
          this.showErrorMessage(message);
        }

        return throwError(() => error);
      }),
    );
  }

  private showErrorMessage(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: message,
      life: 5000,
    });
  }
}
