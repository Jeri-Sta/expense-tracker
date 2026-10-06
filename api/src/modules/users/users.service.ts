import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findApplicationUser(): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'isActive',
        'workspaceId',
        'createdAt',
      ],
    });
  }
}
