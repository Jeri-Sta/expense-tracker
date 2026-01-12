import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    private workspacesRepository: Repository<Workspace>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createWorkspace(
    userId: string,
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    const workspace = new Workspace();
    workspace.name = createWorkspaceDto.name;
    workspace.ownerId = userId;

    const savedWorkspace = await this.workspacesRepository.save(workspace);

    // Add owner as member
    await this.usersRepository.update(userId, {
      workspaceId: savedWorkspace.id,
    });

    return this.mapToResponseDto(savedWorkspace);
  }

  async getWorkspace(userId: string): Promise<WorkspaceResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['workspace'],
    });

    if (!user || !user.workspace) {
      throw new NotFoundException('User does not have a workspace');
    }

    const workspace = await this.workspacesRepository.findOne({
      where: { id: user.workspaceId },
      relations: ['members'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return this.mapToResponseDto(workspace);
  }

  async getMembers(workspaceId: string): Promise<any[]> {
    const workspace = await this.workspacesRepository.findOne({
      where: { id: workspaceId },
      relations: ['members'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace.members.map((member) => ({
      id: member.id,
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      isInvitedUser: member.isInvitedUser,
      createdAt: member.createdAt,
    }));
  }

  async addMember(workspaceId: string, userId: string): Promise<void> {
    const workspace = await this.workspacesRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    await this.usersRepository.update(userId, {
      workspaceId: workspaceId,
    });
  }

  async findWorkspaceById(workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspacesRepository.findOne({
      where: { id: workspaceId },
      relations: ['owner', 'members'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async validateUserBelongsToWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<boolean> {
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
      members: workspace.members
        ? workspace.members.map((member) => ({
            id: member.id,
            email: member.email,
            firstName: member.firstName,
            lastName: member.lastName,
            isInvitedUser: member.isInvitedUser,
            createdAt: member.createdAt,
          }))
        : [],
      createdAt: workspace.createdAt,
    };
  }
}
