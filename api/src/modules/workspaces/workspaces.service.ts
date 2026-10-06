import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { User } from '../users/entities/user.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspacesRepository: Repository<Workspace>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createWorkspace(
    userId: string,
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    const workspace = new Workspace();
    workspace.name = createWorkspaceDto.name;
    workspace.ownerId = userId;

    const savedWorkspace = await this.workspacesRepository.save(workspace);

    // Link the user to their private workspace
    await this.usersRepository.update(userId, {
      workspaceId: savedWorkspace.id,
    });

    return this.mapToResponseDto(savedWorkspace);
  }

  async getWorkspace(userId: string): Promise<WorkspaceResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user?.workspaceId) {
      throw new NotFoundException('User does not have a workspace');
    }

    const workspace = await this.workspacesRepository.findOne({
      where: { id: user.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return this.mapToResponseDto(workspace);
  }

  async findWorkspaceById(workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspacesRepository.findOne({
      where: { id: workspaceId },
      relations: ['owner'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async validateUserBelongsToWorkspace(userId: string, workspaceId: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    return user.workspaceId === workspaceId;
  }

  private mapToResponseDto(workspace: Workspace): WorkspaceResponseDto {
    return {
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
      createdAt: workspace.createdAt,
    };
  }
}
