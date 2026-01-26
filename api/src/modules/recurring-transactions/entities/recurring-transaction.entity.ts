import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { TransactionType, RecurrenceFrequency } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('recurring_transactions')
export class RecurringTransaction extends BaseEntity {
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: RecurrenceFrequency,
  })
  frequency: RecurrenceFrequency;

  @Column({ type: 'int', default: 1 })
  interval: number; // Every X days/weeks/months/years

  @Column({ type: 'timestamp' })
  nextExecution: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  maxExecutions: number;

  @Column({ type: 'int', default: 0 })
  executionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastExecutedAt: Date;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  notes: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.recurringTransactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Category, (category) => category.transactions, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @Column()
  workspaceId: string;
}
