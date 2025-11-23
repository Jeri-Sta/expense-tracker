import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loadingService.show();
      
      const credentials: LoginRequest = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Bem-vindo, ${response.user.firstName}!`
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro no Login',
            detail: error.error?.message || 'Credenciais inválidas'
          });
          this.isLoading = false;
          this.loadingService.hide();
        },
        complete: () => {
          this.isLoading = false;
          this.loadingService.hide();
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}