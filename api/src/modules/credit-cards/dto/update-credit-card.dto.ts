import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateCreditCardDto } from './create-credit-card.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateCreditCardDto extends PartialType(CreateCreditCardDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
