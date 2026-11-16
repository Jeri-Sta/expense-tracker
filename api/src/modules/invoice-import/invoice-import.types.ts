export type ImportRowStatus =
  | 'new'
  | 'imported'
  | 'possible_duplicate'
  | 'payment'
  | 'period_mismatch';

export interface GeneratedInstallmentPreview {
  installmentNumber: number;
  invoicePeriod: string;
  amount: number;
  /** True when this installment already exists in the database. */
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
  generatedInstallments: GeneratedInstallmentPreview[];
  /** The occurrence index used to disambiguate identical rows. */
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
  /** Number of transactions that will be written if the selection is confirmed. */
  transactionsToCreate: number;
  /** Sum of the selected amounts including generated future installments. */
  projectedAmount: number;
}

export interface ImportPreviewResult {
  rows: ImportPreviewRow[];
  summary: ImportPreviewSummary;
}

export interface ImportPeriodResult {
  period: string;
  created: number;
  totalAmount: number;
}

export interface ImportConfirmResult {
  created: number;
  skipped: number;
  rulesSaved: number;
  periods: ImportPeriodResult[];
}

export interface MerchantCategoryRuleResponse {
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
