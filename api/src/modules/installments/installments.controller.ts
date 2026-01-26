import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InstallmentsService } from './installments.service';
import {
  CreateInstallmentPlanDto,
  UpdateInstallmentPlanDto,
  PayInstallmentDto,
  InstallmentPlanResponseDto,
  InstallmentPlanSummaryDto,
} from './dto';
import { GetUser } from '@/common/decorators/get-user.decorator';

@ApiTags('Installments')
@Controller('installments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo plano de financiamento' })
  @ApiResponse({
    status: 201,
    description: 'Plano de financiamento criado com sucesso',
    type: InstallmentPlanResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async create(
    @GetUser() user,
    @Body() createInstallmentPlanDto: CreateInstallmentPlanDto,
  ): Promise<InstallmentPlanResponseDto> {
    return this.installmentsService.create(user.id, user.workspaceId, createInstallmentPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os planos de financiamento' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos de financiamento',
    type: [InstallmentPlanSummaryDto],
  })
  async findAll(@GetUser() user: any): Promise<InstallmentPlanSummaryDto[]> {
    return this.installmentsService.findAll(user.workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar plano de financiamento por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do plano de financiamento',
  })
  @ApiResponse({
    status: 200,
    description: 'Plano de financiamento encontrado',
    type: InstallmentPlanResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Plano de financiamento não encontrado',
  })
  async findOne(
    @GetUser() user: any,
    @Param('id') id: string,
  ): Promise<InstallmentPlanResponseDto> {
    return this.installmentsService.findOne(user.workspaceId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar plano de financiamento' })
  @ApiParam({
    name: 'id',
    description: 'ID do plano de financiamento',
  })
  @ApiResponse({
    status: 200,
    description: 'Plano de financiamento atualizado com sucesso',
    type: InstallmentPlanResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Plano de financiamento não encontrado',
  })
  async update(
    @GetUser() user,
    @Param('id') id: string,
    @Body() updateInstallmentPlanDto: UpdateInstallmentPlanDto,
  ): Promise<InstallmentPlanResponseDto> {
    return this.installmentsService.update(user.id, user.workspaceId, id, updateInstallmentPlanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir plano de financiamento' })
  @ApiParam({
    name: 'id',
    description: 'ID do plano de financiamento',
  })
  @ApiResponse({
    status: 204,
    description: 'Plano de financiamento excluído com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Plano de financiamento não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Não é possível excluir plano com parcelas pagas',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@GetUser() user: any, @Param('id') id: string): Promise<void> {
    return this.installmentsService.remove(user.workspaceId, id);
  }

  @Post(':installmentId/pay')
  @ApiOperation({ summary: 'Pagar uma parcela específica' })
  @ApiParam({
    name: 'installmentId',
    description: 'ID da parcela a ser paga',
  })
  @ApiResponse({
    status: 200,
    description: 'Parcela paga com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Parcela não encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'Parcela já foi paga',
  })
  @HttpCode(HttpStatus.OK)
  async payInstallment(
    @GetUser() user: any,
    @Param('installmentId') installmentId: string,
    @Body() payInstallmentDto: PayInstallmentDto,
  ): Promise<{ message: string }> {
    await this.installmentsService.payInstallment(
      user.workspaceId,
      installmentId,
      payInstallmentDto,
    );
    return { message: 'Parcela paga com sucesso' };
  }

  @Delete(':installmentId/payment')
  @ApiOperation({ summary: 'Excluir pagamento de uma parcela' })
  @ApiParam({
    name: 'installmentId',
    description: 'ID da parcela',
  })
  @ApiResponse({
    status: 204,
    description: 'Pagamento excluído com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Parcela não encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'Parcela não está paga',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePayment(
    @GetUser() user: any,
    @Param('installmentId') installmentId: string,
  ): Promise<void> {
    return this.installmentsService.deletePayment(user.workspaceId, installmentId);
  }
}
