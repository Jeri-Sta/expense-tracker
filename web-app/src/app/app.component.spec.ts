import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('localizes paginator accessible labels in Brazilian Portuguese', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const aria = TestBed.inject(PrimeNGConfig).translation.aria;
    expect(aria?.firstPageLabel).toBe('Primeira página');
    expect(aria?.previousPageLabel).toBe('Página anterior');
    expect(aria?.nextPageLabel).toBe('Próxima página');
    expect(aria?.lastPageLabel).toBe('Última página');
    expect(aria?.rowsPerPageLabel).toBe('Linhas por página');
  });
});
