import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CardTransaction } from '../card-transactions/entities/card-transaction.entity';
import { CreditCard } from '../credit-cards/entities/credit-card.entity';
import { CardTransactionsService } from '../card-transactions/card-transactions.service';
import { CategoriesService } from '../categories/categories.service';
import { CategoryType } from '../../common/enums';
import { splitAmount } from '../../common/utils/money.utils';
import { parseLocalDate } from '../../common/utils/date.utils';
import { getInvoiceCompetencyPeriod } from '../../common/utils/invoice.utils';
import { NubankCsvParseError, ParsedNubankRow, parseNubankCsv } from './nubank-csv.parser';
import { extractInstallment, InstallmentInfo, normalizeMerchantTitle } from './merchant-normalizer';
import {
  addMonthsToPeriod,
  buildInstallmentFingerprint,
  buildRowFingerprint,
  buildSeriesKey,
  getSuggestedInvoicePeriod,
  NUBANK_IMPORT_SOURCE,
  roundMoney,
} from './import-key.utils';
import { MerchantCategoryRule } from './entities/merchant-category-rule.entity';
import { PreviewNubankImportDto } from './dto/preview-nubank-import.dto';
import { ConfirmNubankImportDto } from './dto/confirm-nubank-import.dto';
import {
  GeneratedInstallmentPreview,
  ImportConfirmResult,
  ImportPreviewResult,
  ImportPreviewRow,
  ImportPreviewSummary,
  MerchantCategoryRuleResponse,
} from './invoice-import.types';

export interface UploadedCsvFile {
  originalname?: string;
  mimetype?: string;
  size?: number;
  buffer?: Buffer;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DUPLICATE_AMOUNT_TOLERANCE = 0.02;
const DUPLICATE_DATE_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

interface PreviewContext {
  row: ParsedNubankRow;
  installment: InstallmentInfo | null;
  normalizedTitle: string;
  suggestedPeriod: string;
  occurrence: number;
  seriesKey: string | null;
  fingerprint: string;
}

@Injectable()
export class InvoiceImportService {
  constructor(
    @InjectRepository(CardTransaction)
    private readonly transactionRepository: Repository<CardTransaction>,
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    @InjectRepository(MerchantCategoryRule)
    private readonly ruleRepository: Repository<MerchantCategoryRule>,
    private readonly cardTransactionsService: CardTransactionsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async preview(
    workspaceId: string,
    dto: PreviewNubankImportDto,
    file: UploadedCsvFile | undefined,
  ): Promise<ImportPreviewResult> {
    const creditCard = await this.getCreditCardOrFail(dto.creditCardId, workspaceId);
    const content = this.readFileContent(file);
    const parsedRows = this.parseOrFail(content);

    const contexts = this.buildContexts(parsedRows, creditCard, dto.invoicePeriod);

    const fingerprints = [...new Set(contexts.map((context) => context.fingerprint))];
    const seriesKeys = [
      ...new Set(
        contexts.map((context) => context.seriesKey).filter((key): key is string => !!key),
      ),
    ];
    const merchantKeys = [...new Set(contexts.map((context) => context.normalizedTitle))];

    const [importedRows, seriesRows, periodRows, rules] = await Promise.all([
      fingerprints.length
        ? this.transactionRepository.find({
            where: { creditCardId: creditCard.id, importFingerprint: In(fingerprints) },
          })
        : Promise.resolve([]),
      seriesKeys.length
        ? this.transactionRepository.find({
            where: { creditCardId: creditCard.id, importSeriesKey: In(seriesKeys) },
          })
        : Promise.resolve([]),
      this.transactionRepository.find({
        where: { creditCardId: creditCard.id, invoicePeriod: dto.invoicePeriod },
      }),
      merchantKeys.length
        ? this.ruleRepository.find({
            where: {
              workspaceId,
              source: NUBANK_IMPORT_SOURCE,
              merchantKey: In(merchantKeys),
            },
          })
        : Promise.resolve([]),
    ]);

    const importedFingerprints = new Set(
      importedRows.map((transaction) => transaction.importFingerprint).filter(Boolean),
    );
    const seriesByKey = new Map<string, Set<number>>();
    for (const transaction of seriesRows) {
      if (!transaction.importSeriesKey) continue;
      const numbers = seriesByKey.get(transaction.importSeriesKey) ?? new Set<number>();
      if (transaction.installmentNumber) numbers.add(transaction.installmentNumber);
      seriesByKey.set(transaction.importSeriesKey, numbers);
    }
    const rulesByKey = new Map(rules.map((rule) => [rule.merchantKey, rule]));

    const rows: ImportPreviewRow[] = contexts.map((context, rowIndex) =>
      this.buildPreviewRow(
        rowIndex,
        context,
        dto.invoicePeriod,
        importedFingerprints,
        seriesByKey,
        periodRows,
        rulesByKey,
      ),
    );

    return { rows, summary: this.buildSummary(rows) };
  }

  async confirm(
    userId: string,
    workspaceId: string,
    dto: ConfirmNubankImportDto,
  ): Promise<ImportConfirmResult> {
    const creditCard = await this.getCreditCardOrFail(dto.creditCardId, workspaceId);

    const selectedRows = dto.rows.filter((row) => row.include && roundMoney(row.amount) > 0);

    const affectedPeriods = new Map<string, number>();
    const validatedCategories = new Set<string>();
    const ruleTargets = new Map<
      string,
      { pattern: string; description: string; categoryId: string }
    >();

    let created = 0;
    let skipped = 0;

    for (const row of selectedRows) {
      if (row.categoryId && !validatedCategories.has(row.categoryId)) {
        await this.categoriesService.validateForTransaction(
          row.categoryId,
          workspaceId,
          CategoryType.EXPENSE,
        );
        validatedCategories.add(row.categoryId);
      }

      const installment = extractInstallment(row.title);
      const normalizedTitle = normalizeMerchantTitle(row.title);
      const description = row.description.trim();

      if (row.categoryId) {
        ruleTargets.set(normalizedTitle, {
          pattern: installment?.baseTitle ?? row.title,
          description,
          categoryId: row.categoryId,
        });
      }

      if (installment) {
        const result = await this.createInstallmentSeries({
          userId,
          workspaceId,
          creditCard,
          row,
          installment,
          normalizedTitle,
          description,
          invoicePeriod: dto.invoicePeriod,
        });
        created += result.created;
        skipped += result.skipped;
        for (const [period, count] of result.createdByPeriod) {
          affectedPeriods.set(period, (affectedPeriods.get(period) ?? 0) + count);
        }
        continue;
      }

      const invoicePeriod = dto.invoicePeriod;
      const fingerprint = buildRowFingerprint({
        creditCardId: creditCard.id,
        invoicePeriod,
        date: row.date,
        normalizedTitle,
        amount: roundMoney(row.amount),
        occurrence: row.occurrence,
      });

      const exists = await this.transactionRepository.count({
        where: { creditCardId: creditCard.id, importFingerprint: fingerprint },
      });

      if (exists) {
        skipped++;
        continue;
      }

      const transaction = this.transactionRepository.create({
        description,
        amount: roundMoney(row.amount),
        transactionDate: parseLocalDate(row.date),
        invoicePeriod,
        competencyPeriod: getInvoiceCompetencyPeriod(
          invoicePeriod,
          creditCard.closingDay,
          creditCard.dueDay,
        ),
        isInstallment: false,
        creditCardId: creditCard.id,
        categoryId: row.categoryId ?? null,
        userId,
        workspaceId,
        importSource: NUBANK_IMPORT_SOURCE,
        importFingerprint: fingerprint,
        importSeriesKey: null,
      });

      await this.transactionRepository.save(transaction);
      created++;
      affectedPeriods.set(invoicePeriod, (affectedPeriods.get(invoicePeriod) ?? 0) + 1);
    }

    const rulesSaved = await this.saveRules(userId, workspaceId, ruleTargets);

    if (affectedPeriods.size > 0) {
      await this.cardTransactionsService.recalculateInvoiceTotals(
        creditCard.id,
        affectedPeriods.keys(),
        userId,
        workspaceId,
      );
    }

    const periods: ImportConfirmResult['periods'] = [];
    for (const [period, periodCreated] of [...affectedPeriods.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      const invoice = await this.cardTransactionsService.getInvoice(
        creditCard.id,
        period,
        workspaceId,
      );
      periods.push({
        period,
        created: periodCreated,
        totalAmount: Number(invoice.totalAmount),
      });
    }

    return { created, skipped, rulesSaved, periods };
  }

  async findRules(workspaceId: string): Promise<MerchantCategoryRuleResponse[]> {
    const rules = await this.ruleRepository.find({
      where: { workspaceId, source: NUBANK_IMPORT_SOURCE },
      relations: ['category'],
      order: { merchantKey: 'ASC' },
    });

    return rules.map((rule) => ({
      id: rule.id,
      merchantKey: rule.merchantKey,
      pattern: rule.pattern,
      defaultDescription: rule.defaultDescription,
      source: rule.source,
      categoryId: rule.categoryId,
      categoryName: rule.category?.name ?? null,
      categoryColor: rule.category?.color ?? null,
      categoryIcon: rule.category?.icon ?? null,
      lastUsedAt: rule.lastUsedAt,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    }));
  }

  async removeRule(id: string, workspaceId: string): Promise<void> {
    const rule = await this.ruleRepository.findOne({ where: { id, workspaceId } });
    if (!rule) {
      throw new NotFoundException('Import rule not found');
    }
    await this.ruleRepository.softDelete({ id, workspaceId });
  }

  private buildContexts(
    rows: ParsedNubankRow[],
    creditCard: CreditCard,
    invoicePeriod: string,
  ): PreviewContext[] {
    const occurrences = new Map<string, number>();

    return rows.map((row) => {
      const installment = extractInstallment(row.title);
      const normalizedTitle = normalizeMerchantTitle(row.title);
      const amount = roundMoney(row.amount);

      let occurrence = 0;
      if (!installment) {
        const occurrenceKey = `${row.date}|${normalizedTitle}|${amount.toFixed(2)}`;
        occurrence = occurrences.get(occurrenceKey) ?? 0;
        occurrences.set(occurrenceKey, occurrence + 1);
      }

      let seriesKey: string | null = null;
      let fingerprint: string;

      if (installment) {
        const startPeriod = addMonthsToPeriod(invoicePeriod, -(installment.installmentNumber - 1));
        seriesKey = buildSeriesKey({
          creditCardId: creditCard.id,
          normalizedTitle,
          totalInstallments: installment.totalInstallments,
          startPeriod,
        });
        fingerprint = buildInstallmentFingerprint(seriesKey, installment.installmentNumber);
      } else {
        fingerprint = buildRowFingerprint({
          creditCardId: creditCard.id,
          invoicePeriod,
          date: row.date,
          normalizedTitle,
          amount,
          occurrence,
        });
      }

      return {
        row,
        installment,
        normalizedTitle,
        suggestedPeriod: getSuggestedInvoicePeriod(row.date, creditCard.closingDay),
        occurrence,
        seriesKey,
        fingerprint,
      };
    });
  }

  private buildPreviewRow(
    rowIndex: number,
    context: PreviewContext,
    invoicePeriod: string,
    importedFingerprints: Set<string | null>,
    seriesByKey: Map<string, Set<number>>,
    periodRows: CardTransaction[],
    rulesByKey: Map<string, MerchantCategoryRule>,
  ): ImportPreviewRow {
    const rule = rulesByKey.get(context.normalizedTitle);
    const suggestedDescription =
      rule?.defaultDescription ?? context.installment?.baseTitle ?? context.row.title;
    const amount = roundMoney(context.row.amount);

    const generatedInstallments: GeneratedInstallmentPreview[] = [];
    let currentExists = importedFingerprints.has(context.fingerprint);

    if (context.installment) {
      const existingNumbers = seriesByKey.get(context.seriesKey!) ?? new Set<number>();
      currentExists = currentExists || existingNumbers.has(context.installment.installmentNumber);

      const total = roundMoney(amount * context.installment.totalInstallments);
      const amounts = splitAmount(total, context.installment.totalInstallments);

      for (
        let number = context.installment.installmentNumber;
        number <= context.installment.totalInstallments;
        number++
      ) {
        const installmentFingerprint = buildInstallmentFingerprint(context.seriesKey!, number);
        generatedInstallments.push({
          installmentNumber: number,
          invoicePeriod: addMonthsToPeriod(
            invoicePeriod,
            number - context.installment.installmentNumber,
          ),
          amount: amounts[number - 1],
          exists: existingNumbers.has(number) || importedFingerprints.has(installmentFingerprint),
          fingerprint: installmentFingerprint,
        });
      }
    }

    let status: ImportPreviewRow['status'];
    let include = true;

    if (amount <= 0) {
      status = 'payment';
      include = false;
    } else if (currentExists) {
      status = 'imported';
      include = false;
    } else if (context.suggestedPeriod !== invoicePeriod) {
      status = 'period_mismatch';
      include = false;
    } else if (this.isPossibleDuplicate(context, periodRows)) {
      status = 'possible_duplicate';
      include = false;
    } else {
      status = 'new';
    }

    return {
      rowIndex,
      date: context.row.date,
      title: context.row.title,
      description: suggestedDescription,
      amount,
      categoryId: rule?.categoryId ?? null,
      status,
      include,
      suggestedPeriod: context.suggestedPeriod,
      installmentNumber: context.installment?.installmentNumber ?? null,
      totalInstallments: context.installment?.totalInstallments ?? null,
      seriesKey: context.seriesKey,
      fingerprint: context.fingerprint,
      generatedInstallments,
      occurrence: context.occurrence,
    };
  }

  private isPossibleDuplicate(context: PreviewContext, periodRows: CardTransaction[]): boolean {
    const amount = roundMoney(context.row.amount);

    return periodRows.some((transaction) => {
      if (Math.abs(Number(transaction.amount) - amount) > DUPLICATE_AMOUNT_TOLERANCE) {
        return false;
      }

      if (context.installment) {
        return (
          transaction.isInstallment &&
          transaction.installmentNumber === context.installment.installmentNumber &&
          transaction.totalInstallments === context.installment.totalInstallments
        );
      }

      if (transaction.isInstallment) {
        return false;
      }

      return (
        Math.abs(dateToUtc(transaction.transactionDate) - dateToUtc(context.row.date)) <=
        DUPLICATE_DATE_WINDOW_MS
      );
    });
  }

  private buildSummary(rows: ImportPreviewRow[]): ImportPreviewSummary {
    const selected = rows.filter((row) => row.include);

    let transactionsToCreate = 0;
    let projectedAmount = 0;

    for (const row of selected) {
      if (row.installmentNumber) {
        for (const installment of row.generatedInstallments) {
          if (installment.exists) continue;
          transactionsToCreate++;
          projectedAmount += installment.amount;
        }
      } else {
        transactionsToCreate++;
        projectedAmount += row.amount;
      }
    }

    return {
      totalRows: rows.length,
      newCount: rows.filter((row) => row.status === 'new').length,
      importedCount: rows.filter((row) => row.status === 'imported').length,
      duplicateCount: rows.filter((row) => row.status === 'possible_duplicate').length,
      paymentCount: rows.filter((row) => row.status === 'payment').length,
      mismatchCount: rows.filter((row) => row.status === 'period_mismatch').length,
      selectedCount: selected.length,
      selectedAmount: roundMoney(selected.reduce((sum, row) => sum + row.amount, 0)),
      transactionsToCreate,
      projectedAmount: roundMoney(projectedAmount),
    };
  }

  private async createInstallmentSeries(params: {
    userId: string;
    workspaceId: string;
    creditCard: CreditCard;
    row: ConfirmNubankImportDto['rows'][number];
    installment: InstallmentInfo;
    normalizedTitle: string;
    description: string;
    invoicePeriod: string;
  }): Promise<{ created: number; skipped: number; createdByPeriod: Map<string, number> }> {
    const { userId, workspaceId, creditCard, row, installment, normalizedTitle, description } =
      params;

    const startPeriod = addMonthsToPeriod(
      params.invoicePeriod,
      -(installment.installmentNumber - 1),
    );
    const seriesKey = buildSeriesKey({
      creditCardId: creditCard.id,
      normalizedTitle,
      totalInstallments: installment.totalInstallments,
      startPeriod,
    });

    const numbers: number[] = [];
    for (
      let number = installment.installmentNumber;
      number <= installment.totalInstallments;
      number++
    ) {
      numbers.push(number);
    }
    const fingerprints = numbers.map((number) => buildInstallmentFingerprint(seriesKey, number));

    const [seriesRows, fingerprintRows] = await Promise.all([
      this.transactionRepository.find({
        where: { creditCardId: creditCard.id, importSeriesKey: seriesKey },
      }),
      fingerprints.length
        ? this.transactionRepository.find({
            where: { creditCardId: creditCard.id, importFingerprint: In(fingerprints) },
          })
        : Promise.resolve([]),
    ]);

    const existingNumbers = new Set(
      seriesRows.map((transaction) => transaction.installmentNumber).filter(Boolean),
    );
    const existingFingerprints = new Set(
      fingerprintRows.map((transaction) => transaction.importFingerprint).filter(Boolean),
    );

    const total = roundMoney(roundMoney(row.amount) * installment.totalInstallments);
    const amounts = splitAmount(total, installment.totalInstallments);

    const toCreate: CardTransaction[] = [];
    const createdByPeriod = new Map<string, number>();

    for (const number of numbers) {
      const fingerprint = buildInstallmentFingerprint(seriesKey, number);
      if (existingNumbers.has(number) || existingFingerprints.has(fingerprint)) {
        continue;
      }

      const invoicePeriod = addMonthsToPeriod(
        params.invoicePeriod,
        number - installment.installmentNumber,
      );

      toCreate.push(
        this.transactionRepository.create({
          description,
          amount: amounts[number - 1],
          transactionDate: parseLocalDate(row.date),
          invoicePeriod,
          competencyPeriod: getInvoiceCompetencyPeriod(
            invoicePeriod,
            creditCard.closingDay,
            creditCard.dueDay,
          ),
          isInstallment: true,
          installmentNumber: number,
          totalInstallments: installment.totalInstallments,
          creditCardId: creditCard.id,
          categoryId: row.categoryId ?? null,
          userId,
          workspaceId,
          importSource: NUBANK_IMPORT_SOURCE,
          importFingerprint: fingerprint,
          importSeriesKey: seriesKey,
        }),
      );

      createdByPeriod.set(invoicePeriod, (createdByPeriod.get(invoicePeriod) ?? 0) + 1);
    }

    const skipped = numbers.length - toCreate.length;
    if (toCreate.length === 0) {
      return { created: 0, skipped, createdByPeriod };
    }

    const saved = await this.transactionRepository.save(toCreate);

    // Keep the series structure consistent even when it is imported out of
    // order (e.g. December first, November later): the row with the lowest
    // installment number is always the parent.
    const allRows = [...seriesRows, ...saved];
    const parent = allRows.reduce((lowest, current) =>
      (current.installmentNumber ?? 0) < (lowest.installmentNumber ?? 0) ? current : lowest,
    );
    const changed: CardTransaction[] = [];

    for (const transaction of allRows) {
      const desiredParentId = transaction.id === parent.id ? null : parent.id;
      if ((transaction.parentTransactionId ?? null) !== desiredParentId) {
        transaction.parentTransactionId = desiredParentId;
        changed.push(transaction);
      }
    }

    if (changed.length > 0) {
      await this.transactionRepository.save(changed);
    }

    return { created: saved.length, skipped, createdByPeriod };
  }

  private async saveRules(
    userId: string,
    workspaceId: string,
    targets: Map<string, { pattern: string; description: string; categoryId: string }>,
  ): Promise<number> {
    let saved = 0;

    for (const [merchantKey, target] of targets) {
      const existing = await this.ruleRepository.findOne({
        where: { workspaceId, source: NUBANK_IMPORT_SOURCE, merchantKey },
      });

      if (existing) {
        existing.pattern = target.pattern;
        existing.defaultDescription = target.description;
        existing.categoryId = target.categoryId;
        existing.lastUsedAt = new Date();
        await this.ruleRepository.save(existing);
        saved++;
        continue;
      }

      await this.ruleRepository.save(
        this.ruleRepository.create({
          merchantKey,
          pattern: target.pattern,
          defaultDescription: target.description,
          source: NUBANK_IMPORT_SOURCE,
          categoryId: target.categoryId,
          userId,
          workspaceId,
          lastUsedAt: new Date(),
        }),
      );
      saved++;
    }

    return saved;
  }

  private async getCreditCardOrFail(
    creditCardId: string,
    workspaceId: string,
  ): Promise<CreditCard> {
    const creditCard = await this.creditCardRepository.findOne({
      where: { id: creditCardId, workspaceId },
    });

    if (!creditCard) {
      throw new NotFoundException('Credit card not found');
    }

    return creditCard;
  }

  private readFileContent(file: UploadedCsvFile | undefined): string {
    if (!file?.buffer || file.buffer.length === 0) {
      throw new BadRequestException('CSV file is required');
    }

    if (file.size && file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('CSV file is too large (max 5 MB)');
    }

    if (file.originalname && !file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Only .csv files are supported');
    }

    return file.buffer.toString('utf8');
  }

  private parseOrFail(content: string): ParsedNubankRow[] {
    try {
      const rows = parseNubankCsv(content);
      if (rows.length === 0) {
        throw new BadRequestException('No transactions found in the CSV file');
      }
      return rows;
    } catch (error) {
      if (error instanceof NubankCsvParseError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}

function dateToUtc(value: string | Date): number {
  if (value instanceof Date) {
    return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}
