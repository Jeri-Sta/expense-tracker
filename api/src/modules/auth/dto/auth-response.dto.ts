import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  lastLoginAt: Date;

  @ApiProperty()
  isInvitedUser: boolean;

  @ApiProperty()
  canInvite: boolean;

  @ApiProperty()
  workspaceId: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty()
  expiresIn: string;
}
