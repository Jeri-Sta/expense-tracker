import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { CreditCard } from '../../credit-cards/entities/credit-card.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('card_transactions')
export class CardTransaction extends BaseEntity {
  @Column({ length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ type: 'varchar', length: 7 })
  invoicePeriod: string; // YYYY-MM format

  @Column({ default: false })
  isInstallment: boolean;

  @Column({ type: 'int', nullable: true })
  installmentNumber: number;

  @Column({ type: 'int', nullable: true })
  totalInstallments: number;

  // Self-referencing relationship for installments
  @ManyToOne(() => CardTransaction, (transaction) => transaction.childTransactions, { nullable: true })
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

  // Computed property for display
  get installmentLabel(): string {
    if (!this.isInstallment || !this.installmentNumber || !this.totalInstallments) {
      return '';
    }
    return `${this.installmentNumber}/${this.totalInstallments}`;
  }
}
