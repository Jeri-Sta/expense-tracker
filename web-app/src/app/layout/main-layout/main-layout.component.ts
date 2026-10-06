import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
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
  @ViewChild('sidebarToggle') private sidebarToggle?: ElementRef<HTMLButtonElement>;
  @ViewChild('firstNavLink') private firstNavLink?: ElementRef<HTMLAnchorElement>;

  sidebarVisible = false;
  currentRoute = '';

  // Use Angular's inject() to satisfy @angular-eslint/prefer-inject
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.updateCurrentRoute(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateCurrentRoute(event.urlAfterRedirects);
      });
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onSidebarShow(): void {
    queueMicrotask(() => this.firstNavLink?.nativeElement.focus());
  }

  onSidebarHide(): void {
    this.sidebarToggle?.nativeElement.focus();
  }

  closeSidebar(): void {
    this.sidebarVisible = false;
  }

  private updateCurrentRoute(url: string): void {
    this.currentRoute = url.split(/[?#]/, 1)[0] || '/dashboard';
    document.title = `${this.getRouteMeta().title} | Expense Tracker`;
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
