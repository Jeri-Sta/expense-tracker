import { Controller, Get, Param, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';

@ApiTags('Workspaces')
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

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
      throw new ForbiddenException();
    }

    return this.workspacesService.getWorkspace(user.id);
  }

}
