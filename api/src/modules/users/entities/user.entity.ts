import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Category } from '../../categories/entities/category.entity';
import { RecurringTransaction } from '../../recurring-transactions/entities/recurring-transaction.entity';
import { InstallmentPlan } from '../../installments/entities/installment-plan.entity';
import { CreditCard } from '../../credit-cards/entities/credit-card.entity';
import { CardTransaction } from '../../card-transactions/entities/card-transaction.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { Installment } from '../../installments/entities/installment.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'boolean', default: false })
  isInvitedUser: boolean;

  @Column({ nullable: true })
  workspaceId: string;

  @Column({ nullable: true })
  invitedBy: string;

  // Relationships
  @ManyToOne(() => Workspace, (workspace) => workspace.members)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @OneToMany(() => Workspace, (workspace) => workspace.owner)
  ownedWorkspaces: Workspace[];
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => RecurringTransaction, (recurring) => recurring.user)
  recurringTransactions: RecurringTransaction[];

  @OneToMany(() => InstallmentPlan, (installment) => installment.user)
  installmentPlans: InstallmentPlan[];

  @OneToMany(() => CreditCard, (creditCard) => creditCard.user)
  creditCards: CreditCard[];

  @OneToMany(() => CardTransaction, (cardTransaction) => cardTransaction.user)
  cardTransactions: CardTransaction[];

  @OneToMany(() => Installment, (installment) => installment.user)
  installments: Installment[];

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  canInvite(): boolean {
    return !this.isInvitedUser;
  }
}
