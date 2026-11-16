import { InvoiceStatus } from '../../../core/types/common.types';

export interface CardTransaction {
  id: string;
  description: string;
  amount: number;
  transactionDate: Date;
  invoicePeriod: string;
  competencyPeriod: string;
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
  invoiceDuePeriod: string;
  creditCardId: string;
  categoryId?: string;
  isInstallment?: boolean;
  totalInstallments?: number;
}

export interface UpdateCardTransactionDto {
  description?: string;
  amount?: number;
  transactionDate?: string;
  invoiceDuePeriod?: string;
  categoryId?: string | null;
}

export type { InvoiceStatus };

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

export type ImportRowStatus =
  | 'new'
  | 'imported'
  | 'possible_duplicate'
  | 'payment'
  | 'period_mismatch';

export interface ImportGeneratedInstallment {
  installmentNumber: number;
  invoicePeriod: string;
  amount: number;
  exists: boolean;
  fingerprint: string;
}

export interface ImportPreviewRow {
  rowIndex: number;
  date: string;
  title: string;
  description: string;
  amount: number;
  categoryId: string | null;
  status: ImportRowStatus;
  include: boolean;
  suggestedPeriod: string;
  installmentNumber: number | null;
  totalInstallments: number | null;
  seriesKey: string | null;
  fingerprint: string;
  generatedInstallments: ImportGeneratedInstallment[];
  occurrence: number;
}

export interface ImportPreviewSummary {
  totalRows: number;
  newCount: number;
  importedCount: number;
  duplicateCount: number;
  paymentCount: number;
  mismatchCount: number;
  selectedCount: number;
  selectedAmount: number;
  transactionsToCreate: number;
  projectedAmount: number;
}

export interface ImportPreviewResponse {
  rows: ImportPreviewRow[];
  summary: ImportPreviewSummary;
}

export interface ConfirmImportRow {
  rowIndex: number;
  date: string;
  title: string;
  amount: number;
  occurrence: number;
  description: string;
  categoryId?: string | null;
  include: boolean;
}

export interface ConfirmImportRequest {
  creditCardId: string;
  invoicePeriod: string;
  rows: ConfirmImportRow[];
}

export interface ImportPeriodResult {
  period: string;
  created: number;
  totalAmount: number;
}

export interface ImportConfirmResponse {
  created: number;
  skipped: number;
  rulesSaved: number;
  periods: ImportPeriodResult[];
}

export interface MerchantCategoryRule {
  id: string;
  merchantKey: string;
  pattern: string;
  defaultDescription: string | null;
  source: string;
  categoryId: string;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
