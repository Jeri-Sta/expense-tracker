import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { KpiCardsWidgetComponent } from './kpi-cards-widget.component';

describe('KpiCardsWidgetComponent', () => {
  let fixture: ComponentFixture<KpiCardsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [KpiCardsWidgetComponent],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getActualTotalExpenses: (stats: { totalExpenses: number }) => stats.totalExpenses,
            getActualBalance: (stats: { totalIncome: number; totalExpenses: number }) =>
              stats.totalIncome - stats.totalExpenses,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardsWidgetComponent);
  });

  it('formats large BRL totals and explains when monthly growth is unavailable', () => {
    fixture.componentInstance.dashboardData = {
      totalIncome: 999_999_999_999.99,
      totalExpenses: 0,
      balance: 999_999_999_999.99,
      transactionCount: 1,
      averageTransaction: 999_999_999_999.99,
      monthlyGrowth: null,
      projectedIncome: 0,
      projectedExpenses: 0,
      projectedBalance: 0,
      projectedTransactionCount: 0,
      hasProjections: false,
    };

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.balance-block .data-value')?.textContent?.trim()).toBe(
      'R$\u00a0999.999.999.999,99',
    );
    expect(element.querySelector('.metric-item:last-child dd')?.textContent?.trim()).toBe('—');
    expect(element.querySelector('.metric-item:last-child small')?.textContent?.trim()).toBe(
      'comparação indisponível',
    );
  });
});
