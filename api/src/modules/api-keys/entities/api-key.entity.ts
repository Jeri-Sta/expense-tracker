import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';

@Entity('api_keys')
@Index(['workspaceId', 'isActive'], { unique: true, where: '"isActive" = true' })
export class ApiKey extends BaseEntity {
  @Column()
  hashedKey: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column()
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;
}
