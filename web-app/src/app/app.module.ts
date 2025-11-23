import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ToolbarModule } from 'primeng/toolbar';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';

// Services
import { MessageService, ConfirmationService } from 'primeng/api';

// App Components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Core Module
import { CoreModule } from './core/core.module';

// Shared Module
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    
    // PrimeNG Modules
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    MenubarModule,
    SidebarModule,
    PanelMenuModule,
    TableModule,
    ChartModule,
    CalendarModule,
    DropdownModule,
    InputNumberModule,
    InputTextareaModule,
    CheckboxModule,
    SelectButtonModule,
    DialogModule,
    ProgressBarModule,
    TagModule,
    BadgeModule,
    AvatarModule,
    DividerModule,
    ToolbarModule,
    PaginatorModule,
    TooltipModule,
    
    // App Modules
    CoreModule,
    SharedModule
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }