import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { Invitation, InvitationStatus } from './entities/invitation.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { SendInvitationDto } from './dto/send-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationsRepository: Repository<Invitation>,
    @InjectRepository(Workspace)
    private workspacesRepository: Repository<Workspace>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async sendInvitation(
    workspaceId: string,
    userId: string,
    sendInvitationDto: SendInvitationDto,
  ): Promise<InvitationResponseDto> {
    // Verify user owns workspace
    const workspace = await this.workspacesRepository.findOne({
      where: { id: workspaceId },
      relations: ['owner'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException(
        'Only workspace owner can send invitations',
      );
    }

    // Check if email is same as owner
    const owner = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (owner.email === sendInvitationDto.invitedEmail) {
      throw new BadRequestException('Cannot invite your own email');
    }

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: sendInvitationDto.invitedEmail },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Check if already invited and pending
    const pendingInvitation = await this.invitationsRepository.findOne({
      where: {
        workspaceId,
        invitedEmail: sendInvitationDto.invitedEmail,
        status: InvitationStatus.PENDING,
      },
    });

    if (pendingInvitation) {
      throw new BadRequestException('User already has pending invitation');
    }

    // Generate invitation token
    const tokenBuffer = crypto.randomBytes(32);
    const plainToken = tokenBuffer.toString('hex');
    const hashedToken = await bcrypt.hash(plainToken, 10);

    // Create expiry date (7 days from now by default)
    const expiryDays =
      this.configService.get<number>('INVITATION_TOKEN_EXPIRY_DAYS', 7);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const invitation = new Invitation();
    invitation.workspaceId = workspaceId;
    invitation.invitedBy = userId;
    invitation.invitedEmail = sendInvitationDto.invitedEmail;
    invitation.status = InvitationStatus.PENDING;
    invitation.invitationToken = hashedToken;
    invitation.expiresAt = expiresAt;

    const savedInvitation = await this.invitationsRepository.save(invitation);

    // Send email
    await this.emailService.sendInvitation(
      sendInvitationDto.invitedEmail,
      owner.fullName,
      plainToken,
      sendInvitationDto.invitedEmail,
    );

    return this.mapToResponseDto(savedInvitation);
  }

  async acceptInvitation(
    token: string,
    email: string,
    firstName: string,
    lastName: string,
    password: string,
  ): Promise<{ user: User; workspace: Workspace }> {
    // Find invitation by plain token (will need to hash and compare)
    const invitations = await this.invitationsRepository.find({
      where: {
        invitedEmail: email,
        status: InvitationStatus.PENDING,
      },
      relations: ['workspace'],
    });

    if (invitations.length === 0) {
      throw new BadRequestException('Invalid invitation');
    }

    // Find matching invitation by comparing token
    let validInvitation: Invitation = null;
    for (const invitation of invitations) {
      const tokenMatches = await bcrypt.compare(
        token,
        invitation.invitationToken,
      );
      if (tokenMatches && invitation.isTokenValid()) {
        validInvitation = invitation;
        break;
      }
    }

    if (!validInvitation) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User();
    newUser.email = email;
    newUser.password = hashedPassword;
    newUser.firstName = firstName;
    newUser.lastName = lastName || firstName;
    newUser.isInvitedUser = true;
    newUser.invitedBy = validInvitation.invitedBy;
    newUser.workspaceId = validInvitation.workspaceId;

    const savedUser = await this.usersRepository.save(newUser);

    // Mark invitation as accepted
    validInvitation.status = InvitationStatus.ACCEPTED;
    await this.invitationsRepository.save(validInvitation);

    // Get workspace
    const workspace = await this.workspacesRepository.findOne({
      where: { id: validInvitation.workspaceId },
      relations: ['members'],
    });

    return { user: savedUser, workspace };
  }

  async resendInvitation(
    invitationId: string,
    userId: string,
  ): Promise<InvitationResponseDto> {
    const invitation = await this.invitationsRepository.findOne({
      where: { id: invitationId },
      relations: ['workspace'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify user owns workspace
    if (invitation.workspace.ownerId !== userId) {
      throw new ForbiddenException(
        'Only workspace owner can resend invitations',
      );
    }

    // Generate new token
    const tokenBuffer = crypto.randomBytes(32);
    const plainToken = tokenBuffer.toString('hex');
    const hashedToken = await bcrypt.hash(plainToken, 10);

    // Reset expiry date
    const expiryDays =
      this.configService.get<number>('INVITATION_TOKEN_EXPIRY_DAYS', 7);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    invitation.invitationToken = hashedToken;
    invitation.expiresAt = expiresAt;

    const updatedInvitation = await this.invitationsRepository.save(
      invitation,
    );

    // Send email
    const invitedByUser = await this.usersRepository.findOne({
      where: { id: invitation.invitedBy },
    });

    await this.emailService.sendInvitation(
      invitation.invitedEmail,
      invitedByUser.fullName,
      plainToken,
      invitation.invitedEmail,
    );

    return this.mapToResponseDto(updatedInvitation);
  }

  async cancelInvitation(
    invitationId: string,
    userId: string,
  ): Promise<void> {
    const invitation = await this.invitationsRepository.findOne({
      where: { id: invitationId },
      relations: ['workspace'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify user owns workspace
    if (invitation.workspace.ownerId !== userId) {
      throw new ForbiddenException(
        'Only workspace owner can cancel invitations',
      );
    }

    await this.invitationsRepository.remove(invitation);
  }

  async getPendingInvitations(
    workspaceId: string,
    userId: string,
  ): Promise<InvitationResponseDto[]> {
    // Verify user owns workspace
    const workspace = await this.workspacesRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException(
        'Only workspace owner can view invitations',
      );
    }

    const invitations = await this.invitationsRepository.find({
      where: {
        workspaceId,
        status: InvitationStatus.PENDING,
      },
    });

    return invitations.map((inv) => this.mapToResponseDto(inv));
  }

  private mapToResponseDto(invitation: Invitation): InvitationResponseDto {
    return {
      id: invitation.id,
      workspaceId: invitation.workspaceId,
      invitedEmail: invitation.invitedEmail,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    };
  }
}
