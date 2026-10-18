import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  workspaceId: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: 'number' })
  amount: number;

  @ApiProperty({ minimum: 1, maximum: 31 })
  chargeDay: number;

  @ApiProperty({ format: 'date', example: '2026-10-18' })
  startDate: string;

  @ApiProperty({ format: 'date', example: '2026-10-28' })
  nextChargeDate: string;

  @ApiProperty({ format: 'uuid' })
  creditCardId: string;

  @ApiProperty()
  creditCardName: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
