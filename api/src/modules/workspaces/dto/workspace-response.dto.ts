import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceMemberDto } from './workspace-member.dto';

export class WorkspaceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty({ type: [WorkspaceMemberDto] })
  members: WorkspaceMemberDto[];

  @ApiProperty()
  createdAt: Date;
}
