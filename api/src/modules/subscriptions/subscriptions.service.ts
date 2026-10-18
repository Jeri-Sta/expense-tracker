import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InvoiceStatus } from '../../common/enums';
import { formatDateToString, parseLocalDate } from '../../common/utils/date.utils';
import {
  calculateInvoicePeriod,
  getInvoiceCompetencyPeriod,
} from '../../common/utils/invoice.utils';
import { CreditCard } from '../credit-cards/entities/credit-card.entity';
import { CardTransaction } from '../card-transactions/entities/card-transaction.entity';
import { Invoice } from '../card-transactions/entities/invoice.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptions: Repository<Subscription>,
    @InjectRepository(CreditCard)
    private readonly cards: Repository<CreditCard>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    workspaceId: string,
    dto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    const card = await this.findActiveCard(dto.creditCardId, workspaceId);
    const today = formatDateToString(parseLocalDate(new Date()));
    const firstDate = this.nextOccurrence(
      dto.startDate > today ? dto.startDate : today,
      dto.chargeDay,
    );
    const subscription = await this.subscriptions.save(
      this.subscriptions.create({
        ...dto,
        amount: Number(dto.amount),
        nextChargeDate: firstDate,
        isActive: true,
        userId,
        workspaceId,
      }),
    );

    if (firstDate === today) await this.tryImmediateCharge(subscription.id, workspaceId);
    return this.findOne(subscription.id, workspaceId);
  }

  async findAll(workspaceId: string): Promise<SubscriptionResponseDto[]> {
    const subscriptions = await this.subscriptions.find({
      where: { workspaceId },
      relations: ['creditCard'],
      order: { nextChargeDate: 'ASC', createdAt: 'DESC' },
    });
    return subscriptions.map((subscription) => this.toResponse(subscription));
  }

  async findOne(id: string, workspaceId: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptions.findOne({
      where: { id, workspaceId },
      relations: ['creditCard'],
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return this.toResponse(subscription);
  }

  async update(
    id: string,
    _userId: string,
    workspaceId: string,
    dto: UpdateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptions.findOne({ where: { id, workspaceId } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    if (dto.creditCardId) await this.findActiveCard(dto.creditCardId, workspaceId);

    const today = formatDateToString(parseLocalDate(new Date()));
    if (
      dto.chargeDay !== undefined &&
      subscription.isActive &&
      subscription.nextChargeDate <= today
    ) {
      throw new BadRequestException('Cannot change charge day while a charge is pending');
    }

    const effectiveDay = dto.chargeDay ?? subscription.chargeDay;
    const effectiveCardId = dto.creditCardId ?? subscription.creditCardId;
    Object.assign(subscription, dto, {
      amount: dto.amount === undefined ? subscription.amount : Number(dto.amount),
      nextChargeDate:
        dto.chargeDay === undefined
          ? subscription.nextChargeDate
          : this.nextOccurrence(
              subscription.nextChargeDate < today ? today : subscription.nextChargeDate,
              effectiveDay,
            ),
      creditCardId: effectiveCardId,
    });
    await this.subscriptions.save(subscription);
    if (subscription.isActive && subscription.nextChargeDate === today) {
      await this.tryImmediateCharge(subscription.id, workspaceId);
    }
    return this.findOne(id, workspaceId);
  }

  async remove(id: string, workspaceId: string): Promise<void> {
    const result = await this.subscriptions.update({ id, workspaceId }, { isActive: false });
    if (!result.affected) throw new NotFoundException('Subscription not found');
  }

  async processDue(id: string, workspaceId: string, catchUp = true): Promise<void> {
    do {
      const result = await this.chargeOccurrence(id, workspaceId);
      if (!result) return;
      if (!catchUp) return;
    } while (true);
  }

  async processOverdue(): Promise<void> {
    const today = formatDateToString(parseLocalDate(new Date()));
    const due = await this.subscriptions.find({
      where: { isActive: true },
      order: { nextChargeDate: 'ASC' },
    });
    for (const subscription of due.filter((item) => item.nextChargeDate <= today)) {
      try {
        await this.processDue(subscription.id, subscription.workspaceId);
      } catch (error) {
        this.logger.error(`Subscription ${subscription.id} is pending: ${error.message}`);
      }
    }
  }

  private async chargeOccurrence(id: string, workspaceId: string): Promise<boolean> {
    const today = formatDateToString(parseLocalDate(new Date()));
    return this.dataSource.transaction(async (manager) => {
      const subscriptionRepo = manager.getRepository(Subscription);
      const transactionRepo = manager.getRepository(CardTransaction);
      const invoiceRepo = manager.getRepository(Invoice);
      const cardRepo = manager.getRepository(CreditCard);
      const subscription = await subscriptionRepo
        .createQueryBuilder('subscription')
        .setLock('pessimistic_write')
        .where('subscription.id = :id AND subscription.workspaceId = :workspaceId', {
          id,
          workspaceId,
        })
        .getOne();
      if (!subscription || !subscription.isActive || subscription.nextChargeDate > today)
        return false;

      const chargeDate = subscription.nextChargeDate;
      const existing = await transactionRepo.findOne({
        where: { subscriptionId: id, subscriptionChargeDate: chargeDate },
      });
      const card = await cardRepo.findOne({
        where: { id: subscription.creditCardId, workspaceId, isActive: true },
      });
      if (!card) throw new BadRequestException('Subscription credit card is not active');
      const transactionDate = parseLocalDate(chargeDate);
      const period = calculateInvoicePeriod(transactionDate, card.closingDay);
      const competencyPeriod = getInvoiceCompetencyPeriod(period, card.closingDay, card.dueDay);

      // Insert once so concurrent subscriptions can safely contend for the same invoice row.
      await invoiceRepo
        .createQueryBuilder()
        .insert()
        .values({
          period,
          creditCardId: card.id,
          userId: subscription.userId,
          workspaceId,
          status: InvoiceStatus.OPEN,
          totalAmount: 0,
          closingDate: this.invoiceDate(period, card.closingDay),
          dueDate: this.invoiceDate(period, card.dueDay, card.dueDay <= card.closingDay),
        })
        .orIgnore()
        .execute();
      const invoice = await invoiceRepo
        .createQueryBuilder('invoice')
        .setLock('pessimistic_write')
        .where('invoice.creditCardId = :cardId AND invoice.period = :period', {
          cardId: card.id,
          period,
        })
        .andWhere('invoice.workspaceId = :workspaceId', { workspaceId })
        .getOneOrFail();
      if (invoice.status !== InvoiceStatus.OPEN) {
        throw new BadRequestException(`Invoice ${period} is not open`);
      }

      if (!existing) {
        await transactionRepo.save(
          transactionRepo.create({
            description: subscription.name,
            amount: subscription.amount,
            transactionDate,
            invoicePeriod: period,
            competencyPeriod,
            isInstallment: false,
            creditCardId: card.id,
            categoryId: null,
            userId: subscription.userId,
            workspaceId,
            subscriptionId: subscription.id,
            subscriptionChargeDate: chargeDate,
          }),
        );
        const result = await transactionRepo
          .createQueryBuilder('transaction')
          .select('SUM(transaction.amount)', 'total')
          .where('transaction.creditCardId = :cardId AND transaction.invoicePeriod = :period', {
            cardId: card.id,
            period,
          })
          .getRawOne();
        invoice.totalAmount = Number(result?.total || 0);
        await invoiceRepo.save(invoice);
      }

      subscription.nextChargeDate = this.nextOccurrence(chargeDate, subscription.chargeDay, true);
      await subscriptionRepo.save(subscription);
      return true;
    });
  }

  private async findActiveCard(id: string, workspaceId: string): Promise<CreditCard> {
    const card = await this.cards.findOne({ where: { id, workspaceId, isActive: true } });
    if (!card) throw new NotFoundException('Active credit card not found');
    return card;
  }

  private async tryImmediateCharge(id: string, workspaceId: string): Promise<void> {
    try {
      await this.processDue(id, workspaceId, false);
    } catch (error) {
      this.logger.error(`Subscription ${id} remains pending: ${error.message}`);
    }
  }

  private nextOccurrence(date: string, chargeDay: number, strictlyAfter = false): string {
    const [year, month, day] = date.split('-').map(Number);
    let nextYear = year;
    let nextMonth = month;
    if (strictlyAfter || chargeDay < day) {
      nextMonth++;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear++;
      }
    }
    const monthEnd = new Date(nextYear, nextMonth, 0).getDate();
    return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(Math.min(chargeDay, monthEnd)).padStart(2, '0')}`;
  }

  private invoiceDate(period: string, day: number, nextMonth = false): Date {
    const [year, month] = period.split('-').map(Number);
    return parseLocalDate(new Date(year, month - 1 + Number(nextMonth), day));
  }

  private toResponse(subscription: Subscription): SubscriptionResponseDto {
    return {
      id: subscription.id,
      workspaceId: subscription.workspaceId,
      userId: subscription.userId,
      name: subscription.name,
      amount: Number(subscription.amount),
      chargeDay: subscription.chargeDay,
      startDate: subscription.startDate,
      nextChargeDate: subscription.nextChargeDate,
      creditCardId: subscription.creditCardId,
      creditCardName: subscription.creditCard?.name,
      isActive: subscription.isActive,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
