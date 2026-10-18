import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { CreditCard } from '../../credit-cards/entities/credit-card.entity';
import { Category } from '../../categories/entities/category.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

@Entity('card_transactions')
@Index(
  'UQ_card_transactions_subscription_charge_date',
  ['subscriptionId', 'subscriptionChargeDate'],
  {
    unique: true,
    where: '"subscriptionId" IS NOT NULL AND "subscriptionChargeDate" IS NOT NULL',
  },
)
export class CardTransaction extends BaseEntity {
  @Column({ length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ type: 'varchar', length: 7 })
  invoicePeriod: string; // YYYY-MM format

  @Column({ type: 'varchar', length: 7 })
  competencyPeriod: string; // YYYY-MM format

  @Column({ default: false })
  isInstallment: boolean;

  @Column({ type: 'int', nullable: true })
  installmentNumber: number;

  @Column({ type: 'int', nullable: true })
  totalInstallments: number;

  // Self-referencing relationship for installments
  @ManyToOne(() => CardTransaction, (transaction) => transaction.childTransactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentTransactionId' })
  parentTransaction: CardTransaction;

  @Column({ nullable: true })
  parentTransactionId: string;

  @OneToMany(() => CardTransaction, (transaction) => transaction.parentTransaction)
  childTransactions: CardTransaction[];

  // Relationships
  @ManyToOne(() => CreditCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creditCardId' })
  creditCard: CreditCard;

  @Column()
  creditCardId: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => User, (user) => user.cardTransactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  workspaceId: string;

  @ManyToOne(() => Subscription, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription | null;

  @Column({ type: 'uuid', nullable: true })
  subscriptionId: string | null;

  @Column({ type: 'date', nullable: true })
  subscriptionChargeDate: string | null;

  // Computed property for display
  get installmentLabel(): string {
    if (!this.isInstallment || !this.installmentNumber || !this.totalInstallments) {
      return '';
    }
    return `${this.installmentNumber}/${this.totalInstallments}`;
  }
}
