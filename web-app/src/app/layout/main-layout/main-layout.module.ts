import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { RippleModule } from 'primeng/ripple';

// Components
import { MainLayoutComponent } from './main-layout.component';
import { MainLayoutRoutingModule } from './main-layout-routing.module';

@NgModule({
  declarations: [
    MainLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MainLayoutRoutingModule,
    
    // PrimeNG Modules
    ButtonModule,
    SidebarModule,
    RippleModule
  ]
})
export class MainLayoutModule { }