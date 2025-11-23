import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  sidebarVisible = false;
  currentRoute = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
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
    switch (this.currentRoute) {
      case '/dashboard':
        return 'Dashboard';
      case '/transactions':
        return 'Transações';
      case '/categories':
        return 'Categorias';
      case '/recurring-transactions':
        return 'Transações Recorrentes';
      default:
        return 'Expense Tracker';
    }
  }

  getPageIcon(): string {
    switch (this.currentRoute) {
      case '/dashboard':
        return 'pi pi-chart-line';
      case '/transactions':
        return 'pi pi-credit-card';
      case '/categories':
        return 'pi pi-tags';
      case '/recurring-transactions':
        return 'pi pi-refresh';
      default:
        return 'pi pi-home';
    }
  }
}