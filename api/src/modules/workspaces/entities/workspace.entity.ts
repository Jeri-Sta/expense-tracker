import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('workspaces')
export class Workspace extends BaseEntity {
  @Column()
  name: string;

  @Column()
  ownerId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;
}
