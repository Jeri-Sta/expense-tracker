import { Component, OnInit } from '@angular/core';
import { TransactionService, MonthlyStats } from '../../core/services/transaction.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { CategoryService, Category } from '../../core/services/category.service';
import { RecurringTransactionService, RecurringTransaction } from '../../core/services/recurring-transaction.service';
import { MessageService } from 'primeng/api';

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  averageTransaction: number;
  monthlyGrowth: number;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  projectedTransactionCount: number;
  hasProjections: boolean;
}

interface CategoryStats {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = false;
  
  // Current month stats
  currentStats: DashboardStats = {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
    averageTransaction: 0,
    monthlyGrowth: 0,
    projectedIncome: 0,
    projectedExpenses: 0,
    projectedBalance: 0,
    projectedTransactionCount: 0,
    hasProjections: false
  };
  
  // Chart data
  incomeVsExpenseData: any;
  incomeVsExpenseOptions: any;
  
  monthlyTrendData: any;
  monthlyTrendOptions: any;
  
  categoryPieData: any;
  categoryPieOptions: any;
  
  expenseCategoryData: any;
  expenseCategoryOptions: any;
  
  // Recent data
  recentTransactions: any[] = [];
  upcomingRecurring: RecurringTransaction[] = [];
  topCategories: CategoryStats[] = [];
  
  // Date range for analysis
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  availableYears: number[] = [];
  
  // Projection settings
  showProjections = true;
  includeProjections = true;
  
  // Navigation mode
  isCurrentMonth = true;
  navigationDate: Date = new Date();
  
  // Chart responsive options
  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 3
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor(
    private readonly transactionService: TransactionService,
    private readonly dashboardService: DashboardService,
    private readonly categoryService: CategoryService,
    private readonly recurringTransactionService: RecurringTransactionService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeYears();
    this.updateNavigationStatus();
    this.loadDashboardData();
    this.setupChartOptions();
  }

  initializeYears(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      this.availableYears.push(year);
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    
    if (this.isCurrentMonth) {
      // Load comprehensive dashboard data for current view
      this.dashboardService.getDashboard(this.selectedYear).subscribe({
        next: (dashboardData) => {
          this.updateCurrentStatsFromDashboard(dashboardData.currentMonth);
          this.updateChartsFromYearlyData(dashboardData.yearlyOverview);
          this.recentTransactions = dashboardData.recentTransactions;
          this.updateCategoryData(dashboardData.topCategories);
          this.loadUpcomingRecurring(); // Still load recurring transactions
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar dados do dashboard'
          });
          this.loading = false;
        }
      });
    } else {
      // Load specific month data
      this.dashboardService.getMonthlyStats(this.selectedYear, this.selectedMonth).subscribe({
        next: (monthlyData) => {
          this.updateCurrentStatsFromDashboard(monthlyData.stats);
          this.recentTransactions = monthlyData.recentTransactions;
          this.updateCategoryData(monthlyData.topCategories);
          // Load yearly trend for context
          this.loadYearlyTrend();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading monthly data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar dados mensais'
          });
          this.loading = false;
        }
      });
    }
  }

  async loadMonthlyStats(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.transactionService.getMonthlyStats(this.selectedYear).subscribe({
        next: (stats) => {
          this.updateMonthlyTrendChart(stats);
          this.updateIncomeVsExpenseChart(stats);
          this.calculateGrowthRate(stats);
          resolve();
        },
        error: reject
      });
    });
  }

  async loadCurrentMonthStats(): Promise<void> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return new Promise((resolve, reject) => {
      this.transactionService.getTransactions({
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
        limit: 1000
      }).subscribe({
        next: (response) => {
          const transactions = response.data;
          this.calculateCurrentStats(transactions);
          resolve();
        },
        error: reject
      });
    });
  }

  async loadCategoryStats(): Promise<void> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return new Promise((resolve, reject) => {
      Promise.all([
        this.transactionService.getTransactions({
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0],
          limit: 1000
        }).toPromise(),
        this.categoryService.getCategories().toPromise()
      ]).then(([transactionResponse, categories]) => {
        if (transactionResponse && categories) {
          this.calculateCategoryStats(transactionResponse.data, categories);
        }
        resolve();
      }).catch(reject);
    });
  }

  async loadRecentTransactions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.transactionService.getTransactions({ limit: 5, page: 1 }).subscribe({
        next: (response) => {
          this.recentTransactions = response.data;
          resolve();
        },
        error: reject
      });
    });
  }

  async loadUpcomingRecurring(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.recurringTransactionService.getRecurringTransactions().subscribe({
        next: (transactions) => {
          this.upcomingRecurring = transactions
            .filter(t => t.isActive && !t.isCompleted && t.nextExecution)
            .sort((a, b) => new Date(a.nextExecution).getTime() - new Date(b.nextExecution).getTime())
            .slice(0, 5);
          resolve();
        },
        error: reject
      });
    });
  }

  calculateCurrentStats(transactions: any[]): void {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    this.currentStats.totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    this.currentStats.totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    this.currentStats.balance = this.currentStats.totalIncome - this.currentStats.totalExpenses;
    this.currentStats.transactionCount = transactions.length;
    this.currentStats.averageTransaction = transactions.length > 0 
      ? (this.currentStats.totalIncome + this.currentStats.totalExpenses) / transactions.length 
      : 0;
  }

  calculateCategoryStats(transactions: any[], categories: Category[]): void {
    const categoryStats = new Map<string, CategoryStats>();
    
    // Initialize category stats
    categories.forEach(category => {
      categoryStats.set(category.id, {
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        categoryIcon: category.icon,
        amount: 0,
        percentage: 0,
        transactionCount: 0
      });
    });
    
    // Calculate amounts per category
    transactions.forEach(transaction => {
      const stats = categoryStats.get(transaction.category.id);
      if (stats) {
        stats.amount += transaction.amount;
        stats.transactionCount++;
      }
    });
    
    // Calculate percentages and filter out empty categories
    const totalAmount = Array.from(categoryStats.values()).reduce((sum, stat) => sum + stat.amount, 0);
    this.topCategories = Array.from(categoryStats.values())
      .filter(stat => stat.amount > 0)
      .map(stat => ({
        ...stat,
        percentage: totalAmount > 0 ? (stat.amount / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
    
    this.updateCategoryCharts();
  }

  updateMonthlyTrendChart(stats: MonthlyStats[]): void {
    const months = stats.map(s => this.getMonthName(s.period));
    const incomeData = stats.map(s => s.totalIncome);
    const expenseData = stats.map(s => s.totalExpenses);
    const balanceData = stats.map(s => s.balance);
    
    this.monthlyTrendData = {
      labels: months,
      datasets: [
        {
          label: 'Receitas',
          data: incomeData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Despesas',
          data: expenseData,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Saldo',
          data: balanceData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: false,
          type: 'line'
        }
      ]
    };
  }

  updateIncomeVsExpenseChart(stats: MonthlyStats[]): void {
    const totalIncome = stats.reduce((sum, s) => sum + s.totalIncome, 0);
    const totalExpenses = stats.reduce((sum, s) => sum + s.totalExpenses, 0);
    
    this.incomeVsExpenseData = {
      labels: ['Receitas', 'Despesas'],
      datasets: [{
        data: [totalIncome, totalExpenses],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 2
      }]
    };
  }

  updateCategoryCharts(): void {
    // Category pie chart
    this.categoryPieData = {
      labels: this.topCategories.map(c => c.categoryName),
      datasets: [{
        data: this.topCategories.map(c => c.amount),
        backgroundColor: this.topCategories.map(c => c.categoryColor),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
    
    // Expense categories horizontal bar
    const expenseCategories = this.topCategories.filter(c => c.amount > 0);
    this.expenseCategoryData = {
      labels: expenseCategories.map(c => c.categoryName),
      datasets: [{
        label: 'Valor Gasto',
        data: expenseCategories.map(c => c.amount),
        backgroundColor: expenseCategories.map(c => c.categoryColor),
        borderColor: expenseCategories.map(c => c.categoryColor),
        borderWidth: 1
      }]
    };
  }

  calculateGrowthRate(stats: MonthlyStats[]): void {
    if (stats.length >= 2) {
      const currentMonth = stats[stats.length - 1];
      const previousMonth = stats[stats.length - 2];
      
      if (previousMonth.balance !== 0) {
        this.currentStats.monthlyGrowth = 
          ((currentMonth.balance - previousMonth.balance) / Math.abs(previousMonth.balance)) * 100;
      }
    }
  }

  setupChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    
    this.monthlyTrendOptions = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      interaction: {
        intersect: false
      },
      layout: {
        padding: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        }
      },
      plugins: {
        legend: {
          labels: {
            color: textColor,
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          display: true,
          ticks: {
            color: textColor,
            maxRotation: 45
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          display: true,
          ticks: {
            color: textColor,
            callback: (value: any) => this.formatCurrency(value)
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
    
    this.categoryPieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1,
      layout: {
        padding: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            padding: 15,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const category = this.topCategories[context.dataIndex];
              return `${category.categoryName}: ${this.formatCurrency(category.amount)} (${category.percentage.toFixed(1)}%)`;
            }
          }
        }
      }
    };
    
    this.expenseCategoryOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      layout: {
        padding: {
          top: 20,
          right: 30,
          bottom: 20,
          left: 20
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => this.formatCurrency(context.parsed.x)
          }
        }
      },
      scales: {
        x: {
          display: true,
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: (value: any) => this.formatCurrency(value),
            maxTicksLimit: 6
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          display: true,
          ticks: {
            color: textColor,
            maxTicksLimit: 8,
            padding: 10
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
    
    this.incomeVsExpenseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1,
      layout: {
        padding: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            padding: 15,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label;
              const value = context.parsed;
              return `${label}: ${this.formatCurrency(value)}`;
            }
          }
        }
      }
    };
  }

  onYearChange(): void {
    this.updateNavigationStatus();
    this.loadDashboardData();
  }

  onMonthChange(): void {
    this.updateNavigationStatus();
    this.loadDashboardData();
  }

  onProjectionToggle(): void {
    this.loadDashboardData();
  }

  updateNavigationStatus(): void {
    const current = new Date();
    this.isCurrentMonth = 
      this.selectedYear === current.getFullYear() && 
      this.selectedMonth === (current.getMonth() + 1);
    
    this.navigationDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
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
  }

  navigateToCurrentMonth(): void {
    const current = new Date();
    this.selectedYear = current.getFullYear();
    this.selectedMonth = current.getMonth() + 1;
    this.updateNavigationStatus();
    this.loadDashboardData();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getMonthName(monthString: string): string {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  }

  getBalanceClass(): string {
    return this.currentStats.balance >= 0 ? 'text-green-600' : 'text-red-600';
  }

  getGrowthClass(): string {
    return this.currentStats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600';
  }

  getGrowthIcon(): string {
    return this.currentStats.monthlyGrowth >= 0 ? 'pi-trending-up' : 'pi-trending-down';
  }

  getDaysUntilExecution(transaction: RecurringTransaction): number {
    if (!transaction.nextExecution) return 0;
    const today = new Date();
    const nextExecution = new Date(transaction.nextExecution);
    const diffTime = nextExecution.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(transaction: RecurringTransaction): boolean {
    if (!transaction.nextExecution || !transaction.isActive || transaction.isCompleted) {
      return false;
    }
    return new Date(transaction.nextExecution) < new Date();
  }

  // Auxiliary methods for template
  getYearOptions() {
    return this.availableYears.map(y => ({ label: y.toString(), value: y }));
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
      { label: 'Dezembro', value: 12 }
    ];
  }

  getChartType(type: string) {
    return { type: type };
  }

  getIncomeExpenseOptions() {
    return this.incomeVsExpenseOptions;
  }

  getIncomeExpenseData() {
    return this.incomeVsExpenseData;
  }

  getMonthlyTrendOptions() {
    return this.monthlyTrendOptions;
  }

  getMonthlyTrendData() {
    return this.monthlyTrendData;
  }

  getCategoryPieData() {
    return this.categoryPieData;
  }

  getCategoryPieOptions() {
    return this.categoryPieOptions;
  }

  getExpenseCategoryData() {
    return this.expenseCategoryData;
  }

  getExpenseCategoryOptions() {
    return this.expenseCategoryOptions;
  }

  // New helper methods for projections and navigation
  updateCurrentStatsFromDashboard(monthStats: any): void {
    this.currentStats = {
      totalIncome: monthStats.totalIncome || 0,
      totalExpenses: monthStats.totalExpenses || 0,
      balance: monthStats.balance || 0,
      transactionCount: monthStats.transactionCount || 0,
      averageTransaction: monthStats.transactionCount > 0 
        ? (monthStats.totalIncome + monthStats.totalExpenses) / monthStats.transactionCount 
        : 0,
      monthlyGrowth: 0, // Will be calculated separately
      projectedIncome: monthStats.projectedIncome || 0,
      projectedExpenses: monthStats.projectedExpenses || 0,
      projectedBalance: monthStats.projectedBalance || 0,
      projectedTransactionCount: monthStats.projectedTransactionCount || 0,
      hasProjections: monthStats.hasProjections || false
    };
  }

  updateChartsFromYearlyData(yearlyData: any[]): void {
    if (!yearlyData || yearlyData.length === 0) return;
    
    // Update monthly trend chart
    const months = yearlyData.map(s => this.getMonthName(s.period));
    const incomeData = yearlyData.map(s => s.totalIncome + (this.includeProjections ? s.projectedIncome : 0));
    const expenseData = yearlyData.map(s => s.totalExpenses + (this.includeProjections ? s.projectedExpenses : 0));
    const balanceData = yearlyData.map(s => (s.totalIncome - s.totalExpenses) + (this.includeProjections ? (s.projectedIncome - s.projectedExpenses) : 0));
    
    this.monthlyTrendData = {
      labels: months,
      datasets: [
        {
          label: 'Receitas',
          data: incomeData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Despesas',
          data: expenseData,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Saldo',
          data: balanceData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: false,
          type: 'line'
        }
      ]
    };
    
    // Update income vs expense chart
    const totalIncome = yearlyData.reduce((sum, s) => sum + s.totalIncome + (this.includeProjections ? s.projectedIncome : 0), 0);
    const totalExpenses = yearlyData.reduce((sum, s) => sum + s.totalExpenses + (this.includeProjections ? s.projectedExpenses : 0), 0);
    
    this.incomeVsExpenseData = {
      labels: ['Receitas', 'Despesas'],
      datasets: [{
        data: [totalIncome, totalExpenses],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 2
      }]
    };
  }

  updateCategoryData(categoriesData: any[]): void {
    this.topCategories = categoriesData || [];
    this.updateCategoryCharts();
  }

  loadYearlyTrend(): void {
    this.transactionService.getStatsWithProjections(this.selectedYear).subscribe({
      next: (stats) => {
        this.updateChartsFromYearlyData(stats);
      },
      error: (error) => {
        console.error('Error loading yearly trend:', error);
      }
    });
  }

  getSelectedMonthName(): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[this.selectedMonth - 1];
  }

  getTotalProjectedIncome(): number {
    return this.currentStats.totalIncome + this.currentStats.projectedIncome;
  }

  getTotalProjectedExpenses(): number {
    return this.currentStats.totalExpenses + this.currentStats.projectedExpenses;
  }

  getTotalProjectedBalance(): number {
    return this.currentStats.balance + this.currentStats.projectedBalance;
  }

  getProjectionClass(value: number): string {
    return value >= 0 ? 'text-blue-600' : 'text-orange-600';
  }
}