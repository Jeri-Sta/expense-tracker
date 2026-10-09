import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  TransactionService,
  MonthlyStatsWithProjections,
  Transaction,
  CreditCardSummary,
  CardInstallmentSummary,
  InvoiceSummary,
} from '../../core/services/transaction.service';
import { DashboardService } from '../../core/services/dashboard.service';
import {
  RecurringTransactionService,
  RecurringTransaction,
} from '../../core/services/recurring-transaction.service';
import { CardTransactionService } from '../credit-cards/services/card-transaction.service';
import { CardTransaction } from '../credit-cards/models/card-transaction.model';
import { InstallmentService } from '../installments/services';
import { InstallmentPlanSummary } from '../installments/models';
import { normalizeIcon } from '../../shared/utils/icon.utils';
import { parseLocalDate } from '../../shared/utils/date.utils';
import { formatCurrency } from '../../shared/utils/format.utils';
import { of, timeout } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  BudgetGoalItem,
  DashboardStats,
  CategoryStats,
  InstallmentStats,
  MonthlyExpenseBreakdownItem,
} from '../../core/types/common.types';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  loading = false;
  loadError: string | null = null;

  // Current month stats
  currentStats: DashboardStats = {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
    averageTransaction: 0,
    monthlyGrowth: null,
    projectedIncome: 0,
    projectedExpenses: 0,
    projectedBalance: 0,
    projectedTransactionCount: 0,
    hasProjections: false,
  };

  // Chart data
  monthlyTrendData: any;
  monthlyTrendOptions: any;
  monthlyTrendSummary = 'Não há dados disponíveis para o gráfico.';

  // Recent data
  recentTransactions: Transaction[] = [];
  upcomingRecurring: RecurringTransaction[] = [];
  upcomingRecurringLoading = false;
  upcomingRecurringFailed = false;
  topCategories: CategoryStats[] = [];

  // Credit Cards data
  creditCards: CreditCardSummary[] = [];
  cardInstallments: CardInstallmentSummary[] = [];
  invoices: InvoiceSummary[] = [];
  cardTransactions: CardTransaction[] = [];
  currentCardPeriod: string = '';

  // Installments data
  installmentStats: InstallmentStats = {
    totalPlans: 0,
    totalFinanced: 0,
    totalPaid: 0,
    totalRemaining: 0,
    totalSavings: 0,
    upcomingPayments: [],
    paidInMonth: [],
  };
  installmentPlans: InstallmentPlanSummary[] = [];

  // Expense breakdown data
  expenseBreakdown: MonthlyExpenseBreakdownItem[] = [];

  // Budget goals data
  budgetGoals: BudgetGoalItem[] = [];
  budgetGoalsLoading = false;

  // Date range for analysis
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  availableYears: number[] = [];

  // Projection settings
  includeProjections = true;

  // Navigation mode
  isCurrentMonth = true;

  // Tab navigation
  activeTabIndex: number = 0;
  private readonly TAB_STORAGE_KEY = 'dashboard_active_tab';

  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);
  private readonly dashboardService = inject(DashboardService);
  private readonly recurringTransactionService = inject(RecurringTransactionService);
  private readonly cardTransactionService = inject(CardTransactionService);
  private readonly installmentService = inject(InstallmentService);

  readonly formatCurrency = formatCurrency;

  constructor() {
    this.loadActiveTabFromStorage();
  }

  // Getter to check if there is credit card data to display
  get hasCardData(): boolean {
    return (
      this.creditCards.length > 0 ||
      this.cardInstallments.length > 0 ||
      this.cardTransactions.length > 0
    );
  }

  // Getter to check if there is financing data to display
  get hasFinancingData(): boolean {
    return this.installmentStats.totalPlans > 0;
  }

  // Getter to check if there are budget goals to display
  get hasBudgetGoals(): boolean {
    return this.budgetGoals.length > 0;
  }

  get upcomingRecurringExpenses(): RecurringTransaction[] {
    return this.upcomingRecurring.filter((transaction) => transaction.type === 'expense');
  }

  get upcomingPayments() {
    return this.installmentStats.upcomingPayments.filter((payment) =>
      this.isWithinNext30Days(payment.dueDate),
    );
  }

  get hasUpcomingCommitments(): boolean {
    return this.upcomingRecurringExpenses.length > 0 || this.upcomingPayments.length > 0;
  }

  // Get the total number of visible tabs
  private getVisibleTabCount(): number {
    let count = 1; // Visão Geral is always visible
    if (this.hasCardData) count++;
    if (this.hasFinancingData) count++;
    if (this.hasBudgetGoals) count++;
    return count;
  }

  // Load active tab index from localStorage
  private loadActiveTabFromStorage(): void {
    const savedTab = localStorage.getItem(this.TAB_STORAGE_KEY);
    if (savedTab !== null) {
      const tabIndex = Number.parseInt(savedTab, 10);
      this.activeTabIndex = Number.isNaN(tabIndex) ? 0 : tabIndex;
    }
  }

  // Validate and adjust tab index based on visible tabs
  private validateActiveTabIndex(): void {
    const maxIndex = this.getVisibleTabCount() - 1;
    if (this.activeTabIndex > maxIndex) {
      this.activeTabIndex = 0;
      localStorage.setItem(this.TAB_STORAGE_KEY, '0');
    }
  }

  // Handle tab change and persist to localStorage
  onTabChange(event: any): void {
    this.activeTabIndex = event.index;
    localStorage.setItem(this.TAB_STORAGE_KEY, event.index.toString());
  }

  ngOnInit(): void {
    this.initializeYears();
    this.updateNavigationStatus();
    this.loadDashboardData();
    this.loadInstallmentPlans();
    this.setupChartOptions();
  }

  initializeYears(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    // Allow navigation to future years (current year + 2 years ahead)
    // and past years (current year - 5 years back)
    for (let year = currentYear + 2; year >= currentYear - 5; year--) {
      this.availableYears.push(year);
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    this.loadError = null;
    this.loadUpcomingRecurring();

    if (this.isCurrentMonth) {
      // Load comprehensive dashboard data for current view
      this.dashboardService
        .getDashboard(this.selectedYear, true)
        .pipe(timeout(15000))
        .subscribe({
          next: (dashboardData) => {
            this.updateCurrentStatsFromDashboard(dashboardData.currentMonth);
            this.updateChartsFromYearlyData(dashboardData.yearlyOverview || []);
            this.recentTransactions = dashboardData.recentTransactions || [];
            this.updateCategoryData(dashboardData.topCategories || []);

            // Update installment stats
            if (dashboardData.installments) {
              this.installmentStats = {
                ...dashboardData.installments,
                paidInMonth: dashboardData.installments.paidInMonth || [],
              };
            }

            // Update credit cards and card installments from backend (uses invoice due date logic)
            if (dashboardData.creditCards) {
              this.creditCards = dashboardData.creditCards;
            }
            if (dashboardData.cardInstallments) {
              this.cardInstallments = dashboardData.cardInstallments;
            }
            if (dashboardData.invoices) {
              this.invoices = dashboardData.invoices;
            }

            // Update expense breakdown
            if (dashboardData.expenseBreakdown) {
              this.expenseBreakdown = dashboardData.expenseBreakdown;
            }

            this.loadCardTransactionsForPeriod(); // Load card transactions for display
            this.loading = false;
            this.loadError = null;
            this.loadBudgetGoals();
          },
          error: (error) => {
            console.error('Error loading dashboard data:', error);
            this.loadError = 'Verifique sua conexão e tente carregar o dashboard novamente.';
            this.loading = false;
          },
        });
    } else {
      // Load specific month data
      this.dashboardService
        .getMonthlyStats(this.selectedYear, this.selectedMonth, true)
        .pipe(timeout(15000))
        .subscribe({
          next: (monthlyData) => {
            this.updateCurrentStatsFromDashboard(monthlyData.stats);
            this.recentTransactions = monthlyData.recentTransactions || [];
            this.updateCategoryData(monthlyData.topCategories || []);

            // Update installment stats for the selected month
            if (monthlyData.installments) {
              this.installmentStats = {
                ...monthlyData.installments,
                paidInMonth: monthlyData.installments.paidInMonth || [],
              };
            }

            // Update credit cards and card installments from backend (uses invoice due date logic)
            if (monthlyData.creditCards) {
              this.creditCards = monthlyData.creditCards;
            }
            if (monthlyData.cardInstallments) {
              this.cardInstallments = monthlyData.cardInstallments;
            }
            if (monthlyData.invoices) {
              this.invoices = monthlyData.invoices;
            }

            // Update expense breakdown
            if (monthlyData.expenseBreakdown) {
              this.expenseBreakdown = monthlyData.expenseBreakdown;
            }

            // Load yearly trend for context
            this.loadYearlyTrend();
            this.loadCardTransactionsForPeriod(); // Load card transactions for display
            this.loading = false;
            this.loadError = null;
            this.loadBudgetGoals();
          },
          error: (error) => {
            console.error('Error loading monthly data:', error);
            this.loadError = 'Verifique sua conexão e tente carregar os dados mensais novamente.';
            this.loading = false;
          },
        });
    }
  }

  retryLoad(): void {
    this.loadDashboardData();
  }

  loadBudgetGoals(): void {
    this.budgetGoalsLoading = true;
    this.dashboardService
      .getBudgetGoals(this.selectedYear, this.selectedMonth, true)
      .pipe(catchError(() => of([])))
      .subscribe((goals) => {
        this.budgetGoals = goals;
        this.budgetGoalsLoading = false;
        this.validateActiveTabIndex();
      });
  }

  loadUpcomingRecurring(): void {
    this.upcomingRecurringLoading = true;
    this.upcomingRecurringFailed = false;
    this.recurringTransactionService
      .getRecurringTransactions(true)
      .pipe(timeout(15000))
      .subscribe({
        next: (transactions) => {
          this.upcomingRecurring = transactions
            .filter(
              (transaction) =>
                transaction.isActive &&
                !transaction.isCompleted &&
                transaction.nextExecution &&
                this.isWithinNext30Days(transaction.nextExecution),
            )
            .sort(
              (first, second) =>
                parseLocalDate(first.nextExecution).getTime() -
                parseLocalDate(second.nextExecution).getTime(),
            );
          this.upcomingRecurringLoading = false;
        },
        error: () => {
          this.upcomingRecurringLoading = false;
          this.upcomingRecurringFailed = true;
        },
      });
  }

  loadInstallmentPlans(): void {
    this.installmentService.getAll(true).subscribe({
      next: (plans) => {
        this.installmentPlans = plans;
        this.validateActiveTabIndex();
      },
      error: (error) => {
        console.error('Error loading installment plans:', error);
      },
    });
  }

  /**
   * Loads card transactions for display in the dashboard.
   * Uses the invoice that has its due date in the selected month.
   * Note: creditCards and cardInstallments are loaded from the backend in loadDashboardData()
   */
  loadCardTransactionsForPeriod(): void {
    // Use the new endpoint that fetches transactions by invoice due month
    this.currentCardPeriod = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}`;

    // Load card transactions for invoices due in the selected month
    this.cardTransactionService
      .getByDueMonth(this.selectedYear, this.selectedMonth, undefined, true)
      .pipe(catchError(() => of([])))
      .subscribe({
        next: (transactions) => {
          this.cardTransactions = transactions || [];
          this.validateActiveTabIndex();
        },
        error: (error) => {
          console.error('Error loading card transactions:', error);
        },
      });
  }

  /**
   * Refreshes all credit card related data.
   * Credit card summaries and installments come from the backend with proper invoice due date logic.
   */
  loadCreditCardData(): void {
    this.loadCardTransactionsForPeriod();
  }

  setupChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.monthlyTrendOptions = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 0.7,
      interaction: {
        intersect: false,
      },
      layout: {
        padding: {
          top: 15,
          right: 15,
          bottom: 25,
          left: 15,
        },
      },
      plugins: {
        legend: {
          labels: {
            color: textColor,
            padding: 20,
            usePointStyle: true,
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          display: true,
          ticks: {
            color: textColor,
            maxRotation: 45,
            padding: 5,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          display: true,
          ticks: {
            color: textColor,
            padding: 10,
            callback: (value: any) => this.formatCurrency(value),
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }

  onYearChange(): void {
    this.updateNavigationStatus();
    this.loadDashboardData();
    this.loadCreditCardData();
  }

  onMonthChange(): void {
    this.updateNavigationStatus();
    this.loadDashboardData();
    this.loadCreditCardData();
  }

  onProjectionToggle(): void {
    this.loadDashboardData();
  }

  updateNavigationStatus(): void {
    const current = new Date();
    this.isCurrentMonth =
      this.selectedYear === current.getFullYear() && this.selectedMonth === current.getMonth() + 1;
  }

  navigateToPreviousMonth(): void {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.updateNavigationStatus();
    this.loadDashboardData();
    this.loadCreditCardData();
  }

  navigateToNextMonth(): void {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.updateNavigationStatus();
    this.loadDashboardData();
    this.loadCreditCardData();
  }

  navigateToCurrentMonth(): void {
    const current = new Date();
    this.selectedYear = current.getFullYear();
    this.selectedMonth = current.getMonth() + 1;
    this.updateNavigationStatus();
    this.loadDashboardData();
    this.loadCreditCardData();
  }

  formatDate(date: string): string {
    return parseLocalDate(date).toLocaleDateString('pt-BR');
  }

  getMonthName(monthString: string): string {
    const [year, month] = monthString.split('-');
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  }

  // Auxiliary methods for template
  getYearOptions() {
    return this.availableYears.map((y) => ({ label: y.toString(), value: y }));
  }

  getMonthOptions() {
    return [
      { label: 'Janeiro', value: 1 },
      { label: 'Fevereiro', value: 2 },
      { label: 'Março', value: 3 },
      { label: 'Abril', value: 4 },
      { label: 'Maio', value: 5 },
      { label: 'Junho', value: 6 },
      { label: 'Julho', value: 7 },
      { label: 'Agosto', value: 8 },
      { label: 'Setembro', value: 9 },
      { label: 'Outubro', value: 10 },
      { label: 'Novembro', value: 11 },
      { label: 'Dezembro', value: 12 },
    ];
  }

  // New helper methods for projections and navigation
  updateCurrentStatsFromDashboard(monthStats: MonthlyStatsWithProjections): void {
    this.currentStats = {
      totalIncome: monthStats.totalIncome || 0,
      totalExpenses: monthStats.totalExpenses || 0,
      balance: monthStats.balance || 0,
      transactionCount: monthStats.transactionCount || 0,
      averageTransaction:
        monthStats.transactionCount > 0
          ? (monthStats.totalIncome + monthStats.totalExpenses) / monthStats.transactionCount
          : 0,
      monthlyGrowth: null,
      projectedIncome: monthStats.projectedIncome || 0,
      projectedExpenses: monthStats.projectedExpenses || 0,
      projectedBalance: monthStats.projectedBalance || 0,
      projectedTransactionCount: monthStats.projectedTransactionCount || 0,
      hasProjections: monthStats.hasProjections || false,
    };
  }

  updateChartsFromYearlyData(yearlyData: MonthlyStatsWithProjections[]): void {
    if (!yearlyData?.length) {
      this.monthlyTrendData = { labels: [], datasets: [] };
      this.monthlyTrendSummary = 'Não há dados disponíveis para o gráfico neste período.';
      this.currentStats.monthlyGrowth = null;
      return;
    }

    // Update monthly trend chart
    const months = yearlyData.map((s) => this.getMonthName(s.period));
    const incomeData = yearlyData.map(
      (s) => s.totalIncome + (this.includeProjections ? s.projectedIncome : 0),
    );
    const expenseData = yearlyData.map(
      (s) => s.totalExpenses + (this.includeProjections ? s.projectedExpenses : 0),
    );
    const balanceData = yearlyData.map(
      (s) =>
        s.totalIncome -
        s.totalExpenses +
        (this.includeProjections ? s.projectedIncome - s.projectedExpenses : 0),
    );

    this.monthlyTrendData = {
      labels: months,
      datasets: [
        {
          label: 'Receitas',
          data: incomeData,
          borderColor: this.getThemeColor('--success-color'),
          backgroundColor: this.getThemeColor('--success-color-soft'),
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Despesas',
          data: expenseData,
          borderColor: this.getThemeColor('--danger-color'),
          backgroundColor: this.getThemeColor('--danger-color-soft'),
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Saldo',
          data: balanceData,
          borderColor: this.getThemeColor('--info-color'),
          backgroundColor: this.getThemeColor('--info-color-soft'),
          tension: 0.4,
          fill: false,
          type: 'line',
        },
      ],
    };

    this.monthlyTrendSummary =
      'Dados do gráfico, por mês: ' +
      yearlyData
        .map(
          (_, index) =>
            `${months[index]}: entradas ${this.formatCurrency(incomeData[index])}, ` +
            `saídas ${this.formatCurrency(expenseData[index])}, saldo ${this.formatCurrency(balanceData[index])}`,
        )
        .join('. ');

    const currentPeriod = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}`;
    const previousDate = new Date(this.selectedYear, this.selectedMonth - 2, 1);
    const previousPeriod = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`;
    const currentMonth = yearlyData.find((month) => month.period === currentPeriod);
    const previousMonth = yearlyData.find((month) => month.period === previousPeriod);

    if (currentMonth && previousMonth) {
      const currentBalance =
        currentMonth.balance + (this.includeProjections ? currentMonth.projectedBalance : 0);
      const previousBalance =
        previousMonth.balance + (this.includeProjections ? previousMonth.projectedBalance : 0);
      this.currentStats.monthlyGrowth =
        previousBalance === 0
          ? null
          : ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100;
    } else {
      this.currentStats.monthlyGrowth = null;
    }
  }

  updateCategoryData(categoriesData: any[]): void {
    // Calculate total for percentage calculation
    const totalAmount = (categoriesData || []).reduce(
      (sum, cat) => sum + (Number(cat.total) || 0),
      0,
    );

    this.topCategories = (categoriesData || []).map((category) => ({
      categoryId: category.id,
      categoryName: category.name || 'Sem categoria',
      categoryColor: category.color || '#808080',
      categoryIcon: category.icon || 'category',
      amount: Number(category.total) || 0,
      transactionCount: Number(category.count) || 0,
      percentage: totalAmount > 0 ? ((Number(category.total) || 0) / totalAmount) * 100 : 0,
    }));
  }

  private getThemeColor(token: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  }

  loadYearlyTrend(): void {
    this.transactionService.getStatsWithProjections(this.selectedYear, undefined, true).subscribe({
      next: (stats) => {
        this.updateChartsFromYearlyData(stats);
      },
      error: (error) => {
        console.error('Error loading yearly trend:', error);
      },
    });
  }

  getSelectedMonthName(): string {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return months[this.selectedMonth - 1];
  }

  navigateToInstallments(): void {
    this.router.navigate(['/installments']);
  }

  getUpcomingObligationsTotal(): number {
    return [
      ...this.upcomingRecurringExpenses.map((transaction) => transaction.amount),
      ...this.upcomingPayments.map((payment) => payment.amount),
    ].reduce((total, amount) => total + Number(amount || 0), 0);
  }

  getUpcomingObligationsCount(): number {
    return this.upcomingRecurringExpenses.length + this.upcomingPayments.length;
  }

  private isWithinNext30Days(date: string | Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDay = new Date(today);
    lastDay.setDate(lastDay.getDate() + 30);
    lastDay.setHours(23, 59, 59, 999);
    const dueDate = parseLocalDate(date);
    return dueDate >= today && dueDate <= lastDay;
  }

  normalizeIcon(icon: string): string {
    return normalizeIcon(icon);
  }
}
