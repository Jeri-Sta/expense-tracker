import { ApiProperty } from '@nestjs/swagger';

export class CreditCardResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  color: string;

  @ApiProperty({ description: 'Invoice closing day (1-31)' })
  closingDay: number;

  @ApiProperty({ description: 'Invoice due day (1-31)' })
  dueDay: number;

  @ApiProperty({ description: 'Total credit limit' })
  totalLimit: number;

  @ApiProperty({ description: 'Current used amount' })
  usedLimit?: number;

  @ApiProperty({ description: 'Available credit limit' })
  availableLimit?: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
