import { ApiProperty } from '@nestjs/swagger';

export class GenerateApiKeyResponseDto {
  @ApiProperty({
    description: 'API key in plain text. This is the only time it will be shown.',
    example: 'ek_a1b2c3d4e5f6...',
  })
  key: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-04-03T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ nullable: true, example: null })
  lastUsedAt: Date | null;

  @ApiProperty({ nullable: true, example: null })
  expiresAt: Date | null;
}
