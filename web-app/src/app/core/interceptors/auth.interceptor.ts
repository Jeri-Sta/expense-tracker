import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.token;
    
    if (token && this.shouldAddAuthHeader(req.url)) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }

  private shouldAddAuthHeader(url: string): boolean {
    // Don't add auth header to login/register endpoints
    const authEndpoints = ['/auth/login', '/auth/register'];
    return !authEndpoints.some(endpoint => url.includes(endpoint));
  }
}