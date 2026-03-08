import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { filter } from 'rxjs/operators';

interface RouteMetadata {
  title: string;
  icon: string;
}

const ROUTE_METADATA: { matcher: (route: string) => boolean; meta: RouteMetadata }[] = [
  { matcher: (r) => r === '/dashboard', meta: { title: 'Dashboard', icon: 'pi pi-chart-line' } },
  {
    matcher: (r) => r === '/transactions',
    meta: { title: 'Transações', icon: 'pi pi-credit-card' },
  },
  { matcher: (r) => r === '/categories', meta: { title: 'Categorias', icon: 'pi pi-tags' } },
  {
    matcher: (r) => r === '/recurring-transactions',
    meta: { title: 'Transações Recorrentes', icon: 'pi pi-refresh' },
  },
  {
    matcher: (r) => r.startsWith('/installments'),
    meta: { title: 'Financiamentos', icon: 'pi pi-calculator' },
  },
  {
    matcher: (r) => r === '/credit-cards',
    meta: { title: 'Cartões de Crédito', icon: 'pi pi-wallet' },
  },
  {
    matcher: (r) => r === '/credit-cards/transactions',
    meta: { title: 'Faturas de Cartão', icon: 'pi pi-file' },
  },
  { matcher: (r) => r === '/settings', meta: { title: 'Configurações', icon: 'pi pi-cog' } },
];

const DEFAULT_META: RouteMetadata = { title: 'Expense Tracker', icon: 'pi pi-home' };

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
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  get currentUser(): User | null {
    return this.authService.currentUser;
  }

  getUserInitials(): string {
    const user = this.currentUser;
    if (!user) return '?';

    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private getRouteMeta(): RouteMetadata {
    return ROUTE_METADATA.find((entry) => entry.matcher(this.currentRoute))?.meta ?? DEFAULT_META;
  }

  getPageTitle(): string {
    return this.getRouteMeta().title;
  }

  getPageIcon(): string {
    return this.getRouteMeta().icon;
  }
}
