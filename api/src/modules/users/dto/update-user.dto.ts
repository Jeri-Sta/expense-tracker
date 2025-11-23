import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}