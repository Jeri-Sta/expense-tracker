import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { InvoiceStatus } from '../../../common/enums';
import { CreditCard } from '../../credit-cards/entities/credit-card.entity';
import { User } from '../../users/entities/user.entity';

@Entity('invoices')
@Unique(['creditCardId', 'period'])
export class Invoice extends BaseEntity {
  @Column({ type: 'varchar', length: 7 })
  period: string; // YYYY-MM format

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.OPEN,
  })
  status: InvoiceStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'date', nullable: true })
  closingDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  // Relationships
  @ManyToOne(() => CreditCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creditCardId' })
  creditCard: CreditCard;

  @Column()
  creditCardId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  workspaceId: string;
}
