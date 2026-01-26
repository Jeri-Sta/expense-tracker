import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { User } from '../../users/entities/user.entity';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

@Entity('invitations')
export class Invitation extends BaseEntity {
  @Column()
  workspaceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.invitations)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  invitedEmail: string;

  @Column()
  invitedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invitedBy' })
  invitedByUser: User;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column()
  invitationToken: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  isTokenValid(): boolean {
    return new Date() < this.expiresAt && this.status === InvitationStatus.PENDING;
  }
}
