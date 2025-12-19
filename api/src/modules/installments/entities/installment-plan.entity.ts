import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Installment } from './installment.entity';

@Entity('installment_plans')
export class InstallmentPlan extends BaseEntity {
  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  financedAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  installmentValue: number;

  @Column({ type: 'int' })
  totalInstallments: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalInterest: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  interestRate: number; // Monthly interest rate percentage

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Calculated fields
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalPaid: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalDiscount: number;

  @Column({ type: 'int', default: 0 })
  paidInstallments: number;

  // Relationships
  @ManyToOne(() => User, (user) => user.installmentPlans)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Installment, (installment) => installment.installmentPlan, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  installments: Installment[];

  // Virtual properties
  get remainingAmount(): number {
    return this.installmentValue * (this.totalInstallments - this.paidInstallments);
  }

  get remainingInstallments(): number {
    return this.totalInstallments - this.paidInstallments;
  }

  get completionPercentage(): number {
    return (this.paidInstallments / this.totalInstallments) * 100;
  }
}
