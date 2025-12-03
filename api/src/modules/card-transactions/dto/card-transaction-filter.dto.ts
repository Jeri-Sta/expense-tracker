import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CardTransactionFilterDto {
  @ApiPropertyOptional({ description: 'Filter by credit card ID' })
  @IsOptional()
  @IsString()
  creditCardId?: string;

  @ApiPropertyOptional({ description: 'Filter by invoice period (YYYY-MM)' })
  @IsOptional()
  @IsString()
  invoicePeriod?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of records per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Field to sort by', 
    enum: ['transactionDate', 'description', 'amount', 'createdAt'],
    default: 'transactionDate' 
  })
  @IsOptional()
  @IsString()
  @IsIn(['transactionDate', 'description', 'amount', 'createdAt'])
  sortField?: string = 'transactionDate';

  @ApiPropertyOptional({ 
    description: 'Sort order', 
    enum: ['ASC', 'DESC'],
    default: 'DESC' 
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export interface PaginatedCardTransactionsResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
