import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';

@ApiTags('Workspaces')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user workspace' })
  @ApiResponse({ status: 200, type: WorkspaceResponseDto })
  async getMyWorkspace(@GetUser() user: User): Promise<WorkspaceResponseDto> {
    return this.workspacesService.getWorkspace(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace by ID' })
  @ApiResponse({ status: 200, type: WorkspaceResponseDto })
  async getWorkspace(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<WorkspaceResponseDto> {
    // Verify user belongs to workspace
    const belongsToWorkspace = await this.workspacesService.validateUserBelongsToWorkspace(
      user.id,
      id,
    );
    if (!belongsToWorkspace) {
      throw new Error('Forbidden');
    }

    return this.workspacesService.getWorkspace(user.id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get workspace members' })
  async getMembers(@Param('id') id: string, @GetUser() user: User): Promise<any[]> {
    // Verify user belongs to workspace
    const belongsToWorkspace = await this.workspacesService.validateUserBelongsToWorkspace(
      user.id,
      id,
    );
    if (!belongsToWorkspace) {
      throw new Error('Forbidden');
    }

    return this.workspacesService.getMembers(id);
  }
}
