import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('credit_cards')
export class CreditCard extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ default: '#3B82F6' })
  color: string;

  @Column({ type: 'int' })
  closingDay: number;

  @Column({ type: 'int' })
  dueDay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalLimit: number;

  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => User, (user) => user.creditCards)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}
