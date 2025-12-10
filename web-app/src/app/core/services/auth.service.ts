import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { LoginRequest, RegisterRequest, AuthResponse, AuthState } from '../models/auth.model';
import { User } from '../models/user.model';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  public readonly authState$ = this.authStateSubject.asObservable();

  private readonly apiService = inject(ApiService);
  private readonly storageService = inject(StorageService);

  constructor() {
    this.loadAuthState();
  }

  get currentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  get isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  get token(): string | null {
    return this.authStateSubject.value.token;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
      tap((response) => this.setAuthState(response)),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      }),
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', userData).pipe(
      tap((response) => this.setAuthState(response)),
      catchError((error) => {
        console.error('Register error:', error);
        throw error;
      }),
    );
  }

  logout(): Observable<boolean> {
    this.clearAuthState();
    return of(true);
  }

  refreshUserProfile(): Observable<User> {
    return this.apiService.get<User>('/users/profile').pipe(
      tap((user) => {
        const currentState = this.authStateSubject.value;
        this.authStateSubject.next({
          ...currentState,
          user,
        });
        this.storageService.set(AUTH_USER_KEY, user);
      }),
    );
  }

  private setAuthState(authResponse: AuthResponse): void {
    const authState: AuthState = {
      user: authResponse.user,
      token: authResponse.accessToken,
      isAuthenticated: true,
    };

    this.authStateSubject.next(authState);
    this.storageService.set(AUTH_TOKEN_KEY, authResponse.accessToken);
    this.storageService.set(AUTH_USER_KEY, authResponse.user);
  }

  private clearAuthState(): void {
    const authState: AuthState = {
      user: null,
      token: null,
      isAuthenticated: false,
    };

    this.authStateSubject.next(authState);
    this.storageService.remove(AUTH_TOKEN_KEY);
    this.storageService.remove(AUTH_USER_KEY);
  }

  private loadAuthState(): void {
    const token = this.storageService.get<string>(AUTH_TOKEN_KEY);
    const user = this.storageService.get<User>(AUTH_USER_KEY);

    if (token && user) {
      const authState: AuthState = {
        user,
        token,
        isAuthenticated: true,
      };
      this.authStateSubject.next(authState);
    }
  }
}
