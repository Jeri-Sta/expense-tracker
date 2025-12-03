export interface DashboardStats {
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

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface InstallmentStats {
  totalPlans: number;
  totalFinanced: number;
  totalPaid: number;
  totalRemaining: number;
  totalSavings: number;
  upcomingPayments: UpcomingPayment[];
  paidInMonth: PaidInstallment[];
}

export interface UpcomingPayment {
  installmentNumber: number;
  planName: string;
  dueDate: string;
  amount: number;
}

export interface PaidInstallment {
  id: string;
  planId: string;
  planName: string;
  installmentNumber: number;
  totalInstallments: number;
  paidAmount: number;
  paidDate: string;
  discountAmount: number;
}

export interface MonthlyExpenseBreakdownItem {
  type: 'transaction' | 'credit-card' | 'financing' | 'total';
  name: string;
  amount: number;
  color?: string;
  icon?: string;
  discountAmount?: number;
}
