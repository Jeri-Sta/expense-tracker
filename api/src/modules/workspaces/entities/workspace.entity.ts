import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Invitation } from '../../invitations/entities/invitation.entity';

@Entity('workspaces')
export class Workspace extends BaseEntity {
  @Column()
  name: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => User, (user) => user.ownedWorkspaces)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => User, (user) => user.workspace)
  members: User[];

  @OneToMany(() => Invitation, (invitation) => invitation.workspace)
  invitations: Invitation[];
}
