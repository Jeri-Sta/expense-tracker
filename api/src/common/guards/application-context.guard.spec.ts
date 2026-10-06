import { ExecutionContext, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';
import { User } from '../../modules/users/entities/user.entity';
import { UsersService } from '../../modules/users/users.service';
import { ApplicationContextGuard } from './application-context.guard';

describe('ApplicationContextGuard', () => {
  const user = { id: 'user-id', workspaceId: 'workspace-id' } as User;

  function createContext(headers: Record<string, string> = {}): {
    context: ExecutionContext;
    request: { headers: Record<string, string>; user?: User };
  } {
    const request: { headers: Record<string, string>; user?: User } = { headers };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;

    return { context, request };
  }

  it('attaches the application user when no API key is provided', async () => {
    const usersService = {
      findApplicationUser: jest.fn<() => Promise<User | null>>().mockResolvedValue(user),
    } as unknown as UsersService;
    const apiKeysService = {
      validateApiKey: jest.fn(),
    } as unknown as ApiKeysService;
    const guard = new ApplicationContextGuard(usersService, apiKeysService);
    const { context, request } = createContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBe(user);
  });

  it('rejects an invalid API key', async () => {
    const usersService = {
      findApplicationUser: jest.fn<() => Promise<User | null>>().mockResolvedValue(user),
    } as unknown as UsersService;
    const apiKeysService = {
      validateApiKey: jest.fn<() => Promise<null>>().mockResolvedValue(null),
    } as unknown as ApiKeysService;
    const guard = new ApplicationContextGuard(usersService, apiKeysService);
    const { context } = createContext({ 'x-api-key': 'invalid' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('fails clearly when the application user is not configured', async () => {
    const usersService = {
      findApplicationUser: jest.fn<() => Promise<null>>().mockResolvedValue(null),
    } as unknown as UsersService;
    const apiKeysService = {
      validateApiKey: jest.fn(),
    } as unknown as ApiKeysService;
    const guard = new ApplicationContextGuard(usersService, apiKeysService);
    const { context } = createContext();

    await expect(guard.canActivate(context)).rejects.toThrow(ServiceUnavailableException);
  });
});
