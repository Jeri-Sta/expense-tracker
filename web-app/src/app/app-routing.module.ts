import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    canActivate: [GuestGuard]
  },
  {
    path: '',
    loadChildren: () => import('./layout/main-layout/main-layout.module').then(m => m.MainLayoutModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }