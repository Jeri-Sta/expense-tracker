import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus } from '../entities/invitation.entity';

export class InvitationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  workspaceId: string;

  @ApiProperty()
  invitedEmail: string;

  @ApiProperty()
  status: InvitationStatus;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  createdAt: Date;
}
