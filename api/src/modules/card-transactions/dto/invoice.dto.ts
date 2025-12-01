import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { InvoiceStatus } from '../../../common/enums';

export class InvoiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Invoice period in YYYY-MM format' })
  period: string;

  @ApiProperty({ enum: InvoiceStatus })
  status: InvoiceStatus;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ required: false })
  paidAt?: Date;

  @ApiProperty({ required: false })
  closingDate?: Date;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty()
  creditCardId: string;

  @ApiProperty({ required: false })
  creditCardName?: string;

  @ApiProperty({ required: false })
  creditCardColor?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatus })
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
