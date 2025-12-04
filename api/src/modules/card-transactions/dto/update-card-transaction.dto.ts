import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCardTransactionDto } from './create-card-transaction.dto';

export class UpdateCardTransactionDto extends PartialType(
  OmitType(CreateCardTransactionDto, [
    'creditCardId',
    'isInstallment',
    'totalInstallments',
  ] as const),
) {}
