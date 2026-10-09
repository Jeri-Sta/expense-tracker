import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaskedCalendarComponent } from './masked-calendar.component';

describe('MaskedCalendarComponent', () => {
  let fixture: ComponentFixture<MaskedCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [MaskedCalendarComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MaskedCalendarComponent);
    fixture.detectChanges();
  });

  it('gives the icon-only calendar button an accessible Portuguese name', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.getAttribute('aria-label')).toBe('Abrir calendário');
  });
});
