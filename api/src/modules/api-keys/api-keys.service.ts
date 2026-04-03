import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { ApiKey } from './entities/api-key.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { GenerateApiKeyResponseDto } from './dto/generate-api-key-response.dto';
import { ApiKeyInfoDto } from './dto/api-key-info.dto';

export interface ApiKeyAuthenticatedContext {
  id: string;
  workspaceId: string;
  email: string;
  role: string;
  isApiKeyAuth: true;
}

@Injectable()
export class ApiKeysService {
  private readonly LAST_USED_THROTTLE_MS = 5 * 60 * 1000;

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeysRepository: Repository<ApiKey>,
    @InjectRepository(Workspace)
    private readonly workspacesRepository: Repository<Workspace>,
    private readonly dataSource: DataSource,
  ) {}

  async generate(workspaceId: string): Promise<GenerateApiKeyResponseDto> {
    const workspace = await this.workspacesRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const plainKey = `ek_${randomBytes(32).toString('hex')}`;
    const hashedKey = createHash('sha256').update(plainKey).digest('hex');

    return this.dataSource.transaction(async (manager) => {
      await manager.update(ApiKey, { workspaceId, isActive: true }, { isActive: false });

      const apiKey = manager.create(ApiKey, {
        workspaceId,
        hashedKey,
        isActive: true,
        lastUsedAt: null,
        expiresAt: null,
      });

      const saved = await manager.save(ApiKey, apiKey);

      return {
        key: plainKey,
        isActive: saved.isActive,
        createdAt: saved.createdAt,
        lastUsedAt: saved.lastUsedAt,
        expiresAt: saved.expiresAt,
      };
    });
  }

  async validateApiKey(key: string): Promise<ApiKeyAuthenticatedContext | null> {
    const hashedInput = createHash('sha256').update(key).digest('hex');

    const apiKey = await this.apiKeysRepository.findOne({
      where: { hashedKey: hashedInput, isActive: true },
      relations: ['workspace'],
    });

    if (!apiKey) {
      return null;
    }

    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return null;
    }

    if (
      !apiKey.lastUsedAt ||
      Date.now() - apiKey.lastUsedAt.getTime() > this.LAST_USED_THROTTLE_MS
    ) {
      this.apiKeysRepository.update(apiKey.id, { lastUsedAt: new Date() });
    }

    return {
      id: 'api-key',
      workspaceId: apiKey.workspaceId,
      email: 'api-key@system',
      role: 'api-key',
      isApiKeyAuth: true,
    };
  }

  async revoke(workspaceId: string): Promise<void> {
    const result = await this.apiKeysRepository.update(
      { workspaceId, isActive: true },
      { isActive: false },
    );

    if (result.affected === 0) {
      throw new NotFoundException('No active API key found for this workspace');
    }
  }

  async getInfo(workspaceId: string): Promise<ApiKeyInfoDto | null> {
    const apiKey = await this.apiKeysRepository.findOne({
      where: { workspaceId, isActive: true },
    });

    if (!apiKey) {
      return null;
    }

    return {
      isActive: apiKey.isActive,
      createdAt: apiKey.createdAt,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
    };
  }
}
