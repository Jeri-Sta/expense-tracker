import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): Observable<boolean> {
    return this.authService.authState$.pipe(
      take(1),
      map((authState) => {
        if (!authState.isAuthenticated) {
          return true;
        } else {
          this.router.navigate(['/dashboard']);
          return false;
        }
      }),
    );
  }
}
