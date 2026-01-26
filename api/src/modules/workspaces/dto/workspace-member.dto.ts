import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceMemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  isInvitedUser: boolean;

  @ApiProperty()
  createdAt: Date;
}
