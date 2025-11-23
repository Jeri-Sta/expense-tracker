import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallmentsService } from './installments.service';
import { InstallmentsController } from './installments.controller';
import { InstallmentPlan } from './entities/installment-plan.entity';
import { Installment } from './entities/installment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstallmentPlan, Installment])],
  controllers: [InstallmentsController],
  providers: [InstallmentsService],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}