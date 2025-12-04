import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { CreditCardResponseDto } from './dto/credit-card-response.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Credit Cards')
@Controller('credit-cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new credit card' })
  @ApiResponse({
    status: 201,
    description: 'Credit card created successfully',
    type: CreditCardResponseDto,
  })
  create(
    @GetUser() user: User,
    @Body() createDto: CreateCreditCardDto,
  ): Promise<CreditCardResponseDto> {
    return this.creditCardsService.create(user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all credit cards' })
  @ApiResponse({
    status: 200,
    description: 'Credit cards retrieved successfully',
    type: [CreditCardResponseDto],
  })
  findAll(@GetUser() user: User): Promise<CreditCardResponseDto[]> {
    return this.creditCardsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get credit card by ID' })
  @ApiResponse({
    status: 200,
    description: 'Credit card retrieved successfully',
    type: CreditCardResponseDto,
  })
  findOne(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CreditCardResponseDto> {
    return this.creditCardsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update credit card' })
  @ApiResponse({
    status: 200,
    description: 'Credit card updated successfully',
    type: CreditCardResponseDto,
  })
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCreditCardDto,
  ): Promise<CreditCardResponseDto> {
    return this.creditCardsService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete credit card' })
  @ApiResponse({
    status: 200,
    description: 'Credit card deleted successfully',
  })
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.creditCardsService.remove(id, user.id);
  }
}
