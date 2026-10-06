import { inject, Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { SUPPRESS_GLOBAL_ERROR_NOTIFICATION } from './http-feedback.context';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly messageService = inject(MessageService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (req.context.get(SUPPRESS_GLOBAL_ERROR_NOTIFICATION)) {
          return throwError(() => error);
        }

        if (error.status === 401) {
          this.showErrorMessage('Chave de API inválida ou expirada.');
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
