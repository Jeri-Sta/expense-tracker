import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CategoryType } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
  })
  type: CategoryType;

  @Column({ default: '#6B7280' })
  color: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  // Relationships
  @ManyToOne(() => User, (user) => user.categories)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];
}