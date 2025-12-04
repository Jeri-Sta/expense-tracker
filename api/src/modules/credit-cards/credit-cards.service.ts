import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCard } from './entities/credit-card.entity';
import { CardTransaction } from '../card-transactions/entities/card-transaction.entity';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { CreditCardResponseDto } from './dto/credit-card-response.dto';

@Injectable()
export class CreditCardsService {
  constructor(
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    @InjectRepository(CardTransaction)
    private readonly cardTransactionRepository: Repository<CardTransaction>,
  ) {}

  async create(userId: string, createDto: CreateCreditCardDto): Promise<CreditCardResponseDto> {
    const creditCard = this.creditCardRepository.create({
      ...createDto,
      userId,
    });

    const savedCard = await this.creditCardRepository.save(creditCard);
    return this.mapToResponseDto(savedCard);
  }

  async findAll(userId: string): Promise<CreditCardResponseDto[]> {
    const cards = await this.creditCardRepository.find({
      where: { userId, isActive: true },
      order: { name: 'ASC' },
    });

    return Promise.all(cards.map((card) => this.mapToResponseDtoWithUsage(card)));
  }

  async findOne(id: string, userId: string): Promise<CreditCardResponseDto> {
    const card = await this.creditCardRepository.findOne({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Credit card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('You can only access your own credit cards');
    }

    return this.mapToResponseDtoWithUsage(card);
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateCreditCardDto,
  ): Promise<CreditCardResponseDto> {
    const card = await this.creditCardRepository.findOne({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Credit card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('You can only update your own credit cards');
    }

    Object.assign(card, updateDto);
    const savedCard = await this.creditCardRepository.save(card);
    return this.mapToResponseDtoWithUsage(savedCard);
  }

  async remove(id: string, userId: string): Promise<void> {
    const card = await this.creditCardRepository.findOne({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Credit card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('You can only delete your own credit cards');
    }

    // Soft delete by setting isActive to false
    await this.creditCardRepository.update(id, { isActive: false });
  }

  async getCardWithUsage(id: string, userId: string): Promise<CreditCardResponseDto> {
    return this.findOne(id, userId);
  }

  /**
   * Calculate the invoice period based on transaction date and card's closing day
   * @param transactionDate The date of the transaction
   * @param closingDay The card's invoice closing day
   * @returns Invoice period in YYYY-MM format
   */
  calculateInvoicePeriod(transactionDate: Date, closingDay: number): string {
    const txDate = new Date(transactionDate);
    const day = txDate.getDate();
    let month = txDate.getMonth();
    let year = txDate.getFullYear();

    // If transaction is after closing day, it goes to next month's invoice
    if (day > closingDay) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }

    const monthStr = String(month + 1).padStart(2, '0');
    return `${year}-${monthStr}`;
  }

  private mapToResponseDto(card: CreditCard): CreditCardResponseDto {
    return {
      id: card.id,
      name: card.name,
      color: card.color,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      totalLimit: Number(card.totalLimit),
      isActive: card.isActive,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }

  private async mapToResponseDtoWithUsage(card: CreditCard): Promise<CreditCardResponseDto> {
    // Calculate used limit from card transactions
    // For installment transactions, we need to count all remaining installments (from current period onwards)
    // For non-installment transactions, only count current period
    const currentPeriod = this.getCurrentInvoicePeriod();

    // 1. Sum of non-installment transactions in current period
    const nonInstallmentResult = await this.cardTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.creditCardId = :creditCardId', { creditCardId: card.id })
      .andWhere('transaction.invoicePeriod = :period', { period: currentPeriod })
      .andWhere('transaction.isInstallment = :isInstallment', { isInstallment: false })
      .getRawOne();

    const nonInstallmentTotal = Number(nonInstallmentResult?.total || 0);

    // 2. For installment transactions, get the total remaining value (all installments from current period onwards)
    const installmentResult = await this.cardTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.creditCardId = :creditCardId', { creditCardId: card.id })
      .andWhere('transaction.invoicePeriod >= :period', { period: currentPeriod })
      .andWhere('transaction.isInstallment = :isInstallment', { isInstallment: true })
      .getRawOne();

    const installmentTotal = Number(installmentResult?.total || 0);

    const usedLimit = nonInstallmentTotal + installmentTotal;
    const availableLimit = Number(card.totalLimit) - usedLimit;

    return {
      ...this.mapToResponseDto(card),
      usedLimit,
      availableLimit,
    };
  }

  private getCurrentInvoicePeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
