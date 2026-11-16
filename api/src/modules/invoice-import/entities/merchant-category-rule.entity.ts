import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

/**
 * Links a normalized merchant name (from an imported statement) to a category
 * and an optional friendly description, so future imports are classified
 * automatically.
 */
@Entity('merchant_category_rules')
@Index('UQ_merchant_category_rules_key', ['workspaceId', 'source', 'merchantKey'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
export class MerchantCategoryRule extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  merchantKey: string;

  /** Original merchant title, kept for display/debugging. */
  @Column({ type: 'varchar', length: 255 })
  pattern: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  defaultDescription: string | null;

  @Column({ type: 'varchar', length: 50, default: 'nubank_csv' })
  source: string;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  workspaceId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date | null;
}
