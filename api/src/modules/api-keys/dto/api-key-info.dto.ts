import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyInfoDto {
  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-04-03T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ nullable: true, example: null })
  lastUsedAt: Date | null;

  @ApiProperty({ nullable: true, example: null })
  expiresAt: Date | null;
}
