import {
  Controller,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { InvitationsService } from './invitations.service';
import { SendInvitationDto } from './dto/send-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Post('workspaces/:workspaceId/send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send workspace invitation' })
  @ApiResponse({ status: 201, type: InvitationResponseDto })
  async sendInvitation(
    @Param('workspaceId') workspaceId: string,
    @GetUser() user: User,
    @Body() sendInvitationDto: SendInvitationDto,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.sendInvitation(
      workspaceId,
      user.id,
      sendInvitationDto,
    );
  }

  @Patch('accept/:token')
  @ApiOperation({ summary: 'Accept invitation and create account' })
  async acceptInvitation(
    @Param('token') token: string,
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ): Promise<{ accessToken: string; user: any }> {
    const { user, workspace } = await this.invitationsService.acceptInvitation(
      token,
      acceptInvitationDto.email,
      acceptInvitationDto.firstName,
      acceptInvitationDto.firstName, // Using firstName as lastName if not provided
      acceptInvitationDto.password,
    );

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      isInvitedUser: user.isInvitedUser,
      canInvite: user.canInvite(),
      workspaceId: user.workspaceId,
    };

    // This would normally use JwtService, but we'll handle it in auth module
    return {
      accessToken: 'jwt-token-to-be-generated',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isInvitedUser: user.isInvitedUser,
        canInvite: user.canInvite(),
        workspaceId: user.workspaceId,
      },
    };
  }

  @Patch(':id/resend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Resend invitation' })
  @ApiResponse({ status: 200, type: InvitationResponseDto })
  async resendInvitation(
    @Param('id') invitationId: string,
    @GetUser() user: User,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.resendInvitation(invitationId, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel invitation' })
  async cancelInvitation(
    @Param('id') invitationId: string,
    @GetUser() user: User,
  ): Promise<void> {
    await this.invitationsService.cancelInvitation(invitationId, user.id);
  }

  @Post('workspaces/:workspaceId/pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get pending invitations for workspace' })
  @ApiResponse({ status: 200, type: [InvitationResponseDto] })
  async getPendingInvitations(
    @Param('workspaceId') workspaceId: string,
    @GetUser() user: User,
  ): Promise<InvitationResponseDto[]> {
    return this.invitationsService.getPendingInvitations(workspaceId, user.id);
  }
}
