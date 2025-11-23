import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG Modules (shared across the app)
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule
  ]
})
export class SharedModule { }