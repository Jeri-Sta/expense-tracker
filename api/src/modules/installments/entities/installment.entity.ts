import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { InstallmentStatus } from '../../../common/enums';
import { InstallmentPlan } from './installment-plan.entity';
import { User } from '../../users/entities/user.entity';

@Entity('installments')
export class Installment extends BaseEntity {
  @Column({ type: 'int' })
  installmentNumber: number;

  @Column('decimal', { precision: 10, scale: 2 })
  originalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  paidAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  paidDate: Date;

  @Column({
    type: 'enum',
    enum: InstallmentStatus,
    default: InstallmentStatus.PENDING,
  })
  status: InstallmentStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relationships
  @ManyToOne(() => InstallmentPlan, (plan) => plan.installments)
  @JoinColumn({ name: 'installmentPlanId' })
  installmentPlan: InstallmentPlan;

  @Column()
  installmentPlanId: string;

  @ManyToOne(() => User, (user) => user.creditCards)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  workspaceId: string;

  // Virtual properties
  get remainingAmount(): number {
    return this.originalAmount - (this.paidAmount || 0);
  }

  get effectiveAmount(): number {
    return this.originalAmount - this.discountAmount;
  }

  get isOverdue(): boolean {
    return new Date() > this.dueDate && this.status !== InstallmentStatus.PAID;
  }
}
