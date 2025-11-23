import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
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
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.loadingService.show();
      
      const userData: RegisterRequest = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };
      
      this.authService.register(userData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Conta Criada',
            detail: `Bem-vindo, ${response.user.firstName}! Sua conta foi criada com sucesso.`
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Register error:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro no Registro',
            detail: error.error?.message || 'Erro ao criar conta'
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
    for (const key of Object.keys(this.registerForm.controls)) {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    }
  }

  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}