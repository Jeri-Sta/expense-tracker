import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class ApplicationContextGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.usersService.findApplicationUser();

    if (!user) {
      throw new ServiceUnavailableException('Application user is not configured');
    }

    const apiKey = request.headers['x-api-key'] as string | undefined;
    if (apiKey) {
      const apiKeyContext = await this.apiKeysService.validateApiKey(apiKey);
      if (!apiKeyContext || apiKeyContext.workspaceId !== user.workspaceId) {
        throw new UnauthorizedException('Invalid or expired API key');
      }
    }

    request.user = user;
    return true;
  }
}
