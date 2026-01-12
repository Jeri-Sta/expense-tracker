import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'My Personal Workspace' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
