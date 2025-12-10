import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  sidebarVisible = false;
  currentRoute = '';

  // Use Angular's inject() to satisfy @angular-eslint/prefer-inject
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.urlAfterRedirects;
        }
      });
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getPageTitle(): string {
    switch (true) {
      case this.currentRoute === '/dashboard':
        return 'Dashboard';
      case this.currentRoute === '/transactions':
        return 'Transações';
      case this.currentRoute === '/categories':
        return 'Categorias';
      case this.currentRoute === '/recurring-transactions':
        return 'Transações Recorrentes';
      case this.currentRoute.startsWith('/installments'):
        return 'Financiamentos';
      case this.currentRoute === '/credit-cards':
        return 'Cartões de Crédito';
      case this.currentRoute === '/credit-cards/transactions':
        return 'Faturas de Cartão';
      default:
        return 'Expense Tracker';
    }
  }

  getPageIcon(): string {
    switch (true) {
      case this.currentRoute === '/dashboard':
        return 'pi pi-chart-line';
      case this.currentRoute === '/transactions':
        return 'pi pi-credit-card';
      case this.currentRoute === '/categories':
        return 'pi pi-tags';
      case this.currentRoute === '/recurring-transactions':
        return 'pi pi-refresh';
      case this.currentRoute.startsWith('/installments'):
        return 'pi pi-calculator';
      case this.currentRoute === '/credit-cards':
        return 'pi pi-wallet';
      case this.currentRoute === '/credit-cards/transactions':
        return 'pi pi-file';
      default:
        return 'pi pi-home';
    }
  }
}
