import { Controller, Post, Get, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiKeysService } from './api-keys.service';
import { GenerateApiKeyResponseDto } from './dto/generate-api-key-response.dto';
import { ApiKeyInfoDto } from './dto/api-key-info.dto';

@ApiTags('API Keys')
@Controller('api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new API key for the current workspace' })
  @ApiResponse({
    status: 201,
    description: 'API key generated successfully. Copy it now, it will not be shown again.',
    type: GenerateApiKeyResponseDto,
  })
  async generate(@GetUser() user: User): Promise<GenerateApiKeyResponseDto> {
    return this.apiKeysService.generate(user.workspaceId);
  }

  @Get()
  @ApiOperation({ summary: 'Get current API key info (without the key itself)' })
  @ApiResponse({
    status: 200,
    description: 'API key info retrieved successfully',
    type: ApiKeyInfoDto,
  })
  async getInfo(@GetUser() user: User): Promise<ApiKeyInfoDto | null> {
    return this.apiKeysService.getInfo(user.workspaceId);
  }

  @Delete()
  @ApiOperation({ summary: 'Revoke the current API key' })
  @ApiResponse({
    status: 200,
    description: 'API key revoked successfully',
  })
  async revoke(@GetUser() user: User): Promise<{ message: string }> {
    await this.apiKeysService.revoke(user.workspaceId);
    return { message: 'API key revoked successfully' };
  }
}
