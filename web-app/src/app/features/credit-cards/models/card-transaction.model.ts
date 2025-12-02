export interface CardTransaction {
  id: string;
  description: string;
  amount: number;
  transactionDate: Date;
  invoicePeriod: string;
  isInstallment: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  installmentLabel?: string;
  parentTransactionId?: string;
  creditCardId: string;
  creditCardName?: string;
  creditCardColor?: string;
  categoryId?: string;
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
  createdAt: Date;
  updatedAt: Date;
  childTransactions?: CardTransaction[];
}

export interface CreateCardTransactionDto {
  description: string;
  amount: number;
  transactionDate: string;
  creditCardId: string;
  categoryId?: string;
  isInstallment?: boolean;
  totalInstallments?: number;
}

export interface UpdateCardTransactionDto {
  description?: string;
  amount?: number;
  transactionDate?: string;
  categoryId?: string | null;
}

export type InvoiceStatus = 'open' | 'closed' | 'paid';

export interface Invoice {
  id: string;
  period: string;
  status: InvoiceStatus;
  totalAmount: number;
  paidAt?: Date;
  closingDate?: Date;
  dueDate?: Date;
  creditCardId: string;
  creditCardName?: string;
  creditCardColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateInvoiceStatusDto {
  status: InvoiceStatus;
}
