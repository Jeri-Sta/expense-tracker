import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/modules/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repository find', async () => {
    const findSpy = jest.spyOn(repo, 'find').mockResolvedValue([]);
    await service.findAll();
    expect(findSpy).toHaveBeenCalled();
  });
});
