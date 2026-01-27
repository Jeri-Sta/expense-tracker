import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TransactionsService } from '../../../src/modules/transactions/transactions.service';
import { Transaction } from '../../../src/modules/transactions/entities/transaction.entity';
import { PaymentStatus } from '../../../src/common/enums';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repo: Repository<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repo = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
  });

  describe('revertPayment', () => {
    it('should revert payment if transaction is paid and user is owner', async () => {
      const transaction = {
        id: 'id',
        userId: 'user1',
        workspaceId: 'workspace1',
        amount: 100,
        description: 'desc',
        type: 'expense',
        transactionDate: '2023-01-01',
        competencyPeriod: '2023-01',
        notes: '',
        metadata: {},
        isRecurring: false,
        paymentStatus: PaymentStatus.PAID,
        paidDate: '2023-01-01',
        category: null,
      } as unknown as Transaction;
      jest.spyOn(repo, 'findOne').mockResolvedValue(transaction);
      jest
        .spyOn(repo, 'save')
        .mockImplementation(async (t) => t as DeepPartial<Transaction> & Transaction);
      jest.spyOn(service as any, 'findOneWithRelations').mockResolvedValue(transaction);

      const result = await service.revertPayment('id', 'workspace1');
      // After revertPayment the transaction should be pending
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
      expect(repo.save).toBeDefined();
    });

    it('should throw NotFoundException if transaction not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      await expect(service.revertPayment('id', 'workspace1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const transaction = {
        id: 'id',
        userId: 'user2',
        paymentStatus: PaymentStatus.PAID,
      } as Transaction;
      jest.spyOn(repo, 'findOne').mockResolvedValue(transaction);
      await expect(service.revertPayment('id', 'workspace1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if transaction is not paid', async () => {
      const transaction = {
        id: 'id',
        userId: 'user1',
        paymentStatus: PaymentStatus.PENDING,
      } as Transaction;
      jest.spyOn(repo, 'findOne').mockResolvedValue(transaction);
      await expect(service.revertPayment('id', 'workspace1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAsPaid', () => {
    it('should call save and return transaction', async () => {
      const transaction = {
        id: 'id',
        userId: 'user1',
        paymentStatus: PaymentStatus.PENDING,
        workspaceId: 'workspace1',
      } as Transaction;
      jest.spyOn(repo, 'findOne').mockResolvedValue(transaction);
      jest
        .spyOn(repo, 'save')
        .mockImplementation(async (t) => t as DeepPartial<Transaction> & Transaction);
      jest.spyOn(service as any, 'findOneWithRelations').mockResolvedValue(transaction);
      const result = await service.markAsPaid('id', 'workspace1');
      // markAsPaid should set paymentStatus to paid and set a paidDate
      expect(result.id).toBe(transaction.id);
      expect(result.paymentStatus).toBe(PaymentStatus.PAID);
      expect(result.paidDate).toBeDefined();
    });
  });
});
