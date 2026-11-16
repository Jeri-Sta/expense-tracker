import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { InvoiceImportService, UploadedCsvFile } from './invoice-import.service';
import { PreviewNubankImportDto } from './dto/preview-nubank-import.dto';
import { ConfirmNubankImportDto } from './dto/confirm-nubank-import.dto';
import {
  ImportConfirmResult,
  ImportPreviewResult,
  MerchantCategoryRuleResponse,
} from './invoice-import.types';

@ApiTags('Invoice Import')
@Controller('card-transactions/import')
export class InvoiceImportController {
  constructor(private readonly invoiceImportService: InvoiceImportService) {}

  @Post('nubank/preview')
  @ApiOperation({ summary: 'Parse a Nubank CSV and preview the import (does not save)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'creditCardId', 'invoicePeriod'],
      properties: {
        file: { type: 'string', format: 'binary' },
        creditCardId: { type: 'string', format: 'uuid' },
        invoicePeriod: { type: 'string', example: '2026-12' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  preview(
    @GetUser() user: User,
    @Body() dto: PreviewNubankImportDto,
    @UploadedFile() file: UploadedCsvFile,
  ): Promise<ImportPreviewResult> {
    return this.invoiceImportService.preview(user.workspaceId, dto, file);
  }

  @Post('nubank/confirm')
  @ApiOperation({ summary: 'Confirm the selected rows of a Nubank import' })
  @ApiResponse({ status: 201, description: 'Import finished' })
  confirm(
    @GetUser() user: User,
    @Body() dto: ConfirmNubankImportDto,
  ): Promise<ImportConfirmResult> {
    return this.invoiceImportService.confirm(user.id, user.workspaceId, dto);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List merchant to category import rules' })
  getRules(@GetUser() user: User): Promise<MerchantCategoryRuleResponse[]> {
    return this.invoiceImportService.findRules(user.workspaceId);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Delete a merchant to category import rule' })
  async removeRule(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ deleted: true }> {
    await this.invoiceImportService.removeRule(id, user.workspaceId);
    return { deleted: true };
  }
}
