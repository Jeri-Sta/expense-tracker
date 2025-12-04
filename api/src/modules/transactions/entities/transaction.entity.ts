import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { TransactionType, PaymentStatus } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ type: 'varchar', length: 7 }) // Format: YYYY-MM
  competencyPeriod: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true })
  recurringTransactionId: string;

  // Projection fields
  @Column({ default: false })
  isProjected: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  projectionSource: string; // 'recurring' | 'manual' | 'ai'

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceScore: number; // 0-100 confidence level

  // Payment status fields
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'date', nullable: true })
  paidDate: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Category, (category) => category.transactions, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;
}
