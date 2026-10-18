import { Entity, Column, ManyToOne, JoinColumn, Index, Check } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CreditCard } from '../../credit-cards/entities/credit-card.entity';
import { User } from '../../users/entities/user.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';

@Entity('subscriptions')
@Index('IDX_subscriptions_workspace_active_next_charge', [
  'workspaceId',
  'isActive',
  'nextChargeDate',
])
@Check('CHK_subscriptions_charge_day', '"chargeDay" BETWEEN 1 AND 31')
export class Subscription extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'int' })
  chargeDay: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  nextChargeDate: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  creditCardId: string;

  @ManyToOne(() => CreditCard, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creditCardId' })
  creditCard: CreditCard;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;
}
