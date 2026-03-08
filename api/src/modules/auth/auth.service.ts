import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { InvitationsService } from '../invitations/invitations.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService,
    private readonly invitationsService: InvitationsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async register(registerDto: RegisterDto, invitationToken?: string): Promise<AuthResponseDto> {
    // Check if this is an invitation-based registration
    if (invitationToken) {
      return this.registerFromInvitation(registerDto, invitationToken);
    }

    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const userData = {
      ...registerDto,
      password: hashedPassword,
      isInvitedUser: false,
    };

    // Use transaction to ensure user and workspace are created atomically
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let user;
    try {
      // Create user
      user = await this.usersService.create(userData);

      // Auto-create personalized workspace for new user
      const workspaceName = `${registerDto.firstName}'s Workspace`;
      const workspace = await this.workspacesService.createWorkspace(user.id, {
        name: workspaceName,
      });

      // Update user with workspace ID
      user.workspaceId = workspace.id;

      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.mapToUserResponse(user),
    };
  }

  private async registerFromInvitation(
    registerDto: RegisterDto,
    invitationToken: string,
  ): Promise<AuthResponseDto> {
    const { user } = await this.invitationsService.acceptInvitation(
      invitationToken,
      registerDto.email,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.password,
    );

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.mapToUserResponse(user),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Backward compatibility: Auto-create workspace for existing users without workspace
    // This handles users who registered before the auto-workspace feature was implemented
    // TODO: This can be removed after all existing users have workspaces (check after 2-3 months)
    if (!user.workspaceId && !user.isInvitedUser) {
      const workspaceName = `${user.firstName}'s Workspace`;
      const workspace = await this.workspacesService.createWorkspace(user.id, {
        name: workspaceName,
      });
      user.workspaceId = workspace.id;
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.mapToUserResponse(user),
    };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isInvitedUser: user.isInvitedUser,
      canInvite: user.canInvite(),
      workspaceId: user.workspaceId,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const expiresIn = this.configService.get('app.jwtExpiresIn');

    return {
      accessToken,
      expiresIn,
    };
  }

  private mapToUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      isInvitedUser: user.isInvitedUser,
      canInvite: user.canInvite(),
      workspaceId: user.workspaceId,
    };
  }
}
