import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { ApiKey } from './entities/api-key.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { ApiKeyStrategy } from '../../common/strategies/api-key.strategy';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ApiKey, Workspace])],
  providers: [ApiKeysService, ApiKeyStrategy],
  controllers: [ApiKeysController],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
