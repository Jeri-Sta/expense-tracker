import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  template: `
    <div class="auth-layout">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .auth-layout {
        min-height: 100vh;
        background: var(--surface-0);
      }
    `,
  ],
})
export class AuthLayoutComponent {}
