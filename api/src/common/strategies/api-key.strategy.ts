import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';

@Injectable()
export class ApiKeyStrategy extends Strategy {
  constructor(private readonly apiKeysService: ApiKeysService) {
    super();
    this.name = 'api-key';
  }

  authenticate(req: any): void {
    const key = req.headers['x-api-key'] as string;

    if (!key) {
      return this.fail('API key is missing');
    }

    this.apiKeysService
      .validateApiKey(key)
      .then((context) => {
        if (!context) {
          return this.fail('Invalid or expired API key');
        }
        return this.success(context);
      })
      .catch((err) => this.error(err));
  }
}
