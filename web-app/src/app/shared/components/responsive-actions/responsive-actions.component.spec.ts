import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonModule } from 'primeng/button';
import { ResponsiveActionsComponent } from './responsive-actions.component';

describe('ResponsiveActionsComponent', () => {
  let fixture: ComponentFixture<ResponsiveActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ButtonModule],
      declarations: [ResponsiveActionsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponsiveActionsComponent);
    fixture.componentInstance.primaryAction = { label: 'Criar', command: jasmine.createSpy() };
    fixture.componentInstance.secondaryActions = [
      { label: 'Filtrar', command: jasmine.createSpy() },
    ];
    fixture.detectChanges();
  });

  it('runs the secondary action when its button is clicked', () => {
    const command = fixture.componentInstance.secondaryActions[0].command as jasmine.Spy;
    const button = fixture.nativeElement.querySelector(
      '.desktop-secondary-actions button',
    ) as HTMLButtonElement;

    button.click();

    expect(command).toHaveBeenCalledTimes(1);
  });
});
