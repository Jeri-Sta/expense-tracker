import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallmentPlan } from './entities/installment-plan.entity';
import { Installment } from './entities/installment.entity';
import { InstallmentStatus } from '../../common/enums';
import {
  CreateInstallmentPlanDto,
  UpdateInstallmentPlanDto,
  PayInstallmentDto,
  InstallmentPlanResponseDto,
  InstallmentPlanSummaryDto,
} from './dto';

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectRepository(InstallmentPlan)
    private readonly installmentPlanRepository: Repository<InstallmentPlan>,
    @InjectRepository(Installment)
    private readonly installmentRepository: Repository<Installment>,
  ) {}

  async create(
    userId: string,
    createDto: CreateInstallmentPlanDto,
  ): Promise<InstallmentPlanResponseDto> {
    const {
      name,
      financedAmount,
      installmentValue,
      totalInstallments,
      startDate,
      interestRate,
      description,
      metadata,
    } = createDto;

    // Calcular valores totais e juros
    const totalAmount = installmentValue * totalInstallments;
    const totalInterest = totalAmount - financedAmount;
    
    // Calcular data de fim
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + totalInstallments);

    // Criar o plano de financiamento
    const installmentPlan = this.installmentPlanRepository.create({
      name,
      financedAmount,
      installmentValue,
      totalInstallments,
      totalAmount,
      totalInterest,
      interestRate,
      startDate,
      endDate,
      description,
      metadata,
      userId,
    });

    const savedPlan = await this.installmentPlanRepository.save(installmentPlan);

    // Gerar todas as parcelas
    await this.generateInstallments(savedPlan);

    return this.findOne(userId, savedPlan.id);
  }

  async findAll(userId: string): Promise<InstallmentPlanSummaryDto[]> {
    const plans = await this.installmentPlanRepository
      .createQueryBuilder('plan')
      .leftJoin('plan.installments', 'installment')
      .addSelect([
        'installment.id',
        'installment.dueDate',
        'installment.status',
      ])
      .where('plan.userId = :userId', { userId })
      .orderBy('plan.createdAt', 'DESC')
      .getMany();

    return plans.map((plan) => {
      // Garantir que installments existe e filtrar/ordenar com tratamento de datas
      let nextInstallment = null;
      if (plan.installments && plan.installments.length > 0) {
        const pendingInstallments = plan.installments
          .filter(i => i.status === InstallmentStatus.PENDING)
          .map(installment => ({
            ...installment,
            dueDate: new Date(installment.dueDate) // Garantir que seja Date
          }))
          .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
        
        nextInstallment = pendingInstallments[0] || null;
      }

      return {
        id: plan.id,
        name: plan.name,
        financedAmount: plan.financedAmount,
        totalAmount: plan.totalAmount,
        totalInterest: plan.totalInterest,
        totalInstallments: plan.totalInstallments,
        paidInstallments: plan.paidInstallments,
        remainingInstallments: plan.remainingInstallments,
        totalPaid: plan.totalPaid,
        totalDiscount: plan.totalDiscount,
        remainingAmount: plan.remainingAmount,
        completionPercentage: plan.completionPercentage,
        nextDueDate: nextInstallment?.dueDate,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
      };
    });
  }

  async findOne(userId: string, id: string): Promise<InstallmentPlanResponseDto> {
    const plan = await this.installmentPlanRepository.findOne({
      where: { id, userId },
      relations: ['installments'],
      order: {
        installments: { installmentNumber: 'ASC' },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plano de financiamento não encontrado');
    }

    return {
      ...plan,
      installments: plan.installments.map(installment => ({
        ...installment,
        remainingAmount: installment.remainingAmount,
        effectiveAmount: installment.effectiveAmount,
        isOverdue: installment.isOverdue,
      })),
      remainingAmount: plan.remainingAmount,
      remainingInstallments: plan.remainingInstallments,
      completionPercentage: plan.completionPercentage,
    };
  }

  async update(
    userId: string,
    id: string,
    updateDto: UpdateInstallmentPlanDto,
  ): Promise<InstallmentPlanResponseDto> {
    const plan = await this.installmentPlanRepository.findOne({
      where: { id, userId },
    });

    if (!plan) {
      throw new NotFoundException('Plano de financiamento não encontrado');
    }

    Object.assign(plan, updateDto);
    await this.installmentPlanRepository.save(plan);

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string): Promise<void> {
    const plan = await this.installmentPlanRepository.findOne({
      where: { id, userId },
      relations: ['installments'],
    });

    if (!plan) {
      throw new NotFoundException('Plano de financiamento não encontrado');
    }

    // Verificar se existe alguma parcela paga
    const hasPaidInstallments = plan.installments.some(
      i => i.status === InstallmentStatus.PAID
    );

    if (hasPaidInstallments) {
      throw new BadRequestException(
        'Não é possível excluir um financiamento com parcelas pagas'
      );
    }

    // Excluir parcelas primeiro, depois o plano
    if (plan.installments && plan.installments.length > 0) {
      await this.installmentRepository.remove(plan.installments);
    }
    
    await this.installmentPlanRepository.remove(plan);
  }

  async payInstallment(
    userId: string,
    installmentId: string,
    payDto: PayInstallmentDto,
  ): Promise<void> {
    const installment = await this.installmentRepository.findOne({
      where: { id: installmentId },
      relations: ['installmentPlan'],
    });

    if (!installment?.installmentPlan || installment.installmentPlan?.userId !== userId) {
      throw new NotFoundException('Parcela não encontrada');
    }

    if (installment.status === InstallmentStatus.PAID) {
      throw new BadRequestException('Esta parcela já foi paga');
    }

    // Atualizar a parcela
    installment.paidAmount = payDto.paidAmount;
    installment.paidDate = payDto.paidDate || new Date();
    // Calcula o desconto automaticamente como a diferença entre valor original e valor pago
    installment.discountAmount = Math.max(0, installment.originalAmount - payDto.paidAmount);
    installment.notes = payDto.notes;
    installment.metadata = payDto.metadata;
    installment.status = InstallmentStatus.PAID;

    await this.installmentRepository.save(installment);

    // Atualizar o plano
    await this.updatePlanTotals(installment.installmentPlanId);
  }

  async markAsOverdue(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.installmentRepository
      .createQueryBuilder()
      .update(Installment)
      .set({ status: InstallmentStatus.OVERDUE })
      .where('status = :status', { status: InstallmentStatus.PENDING })
      .andWhere('dueDate < :today', { today })
      .execute();
  }

  private async generateInstallments(plan: InstallmentPlan): Promise<void> {
    const installments: Installment[] = [];

    for (let i = 1; i <= plan.totalInstallments; i++) {
      const dueDate = new Date(plan.startDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));

      const installment = this.installmentRepository.create({
        installmentNumber: i,
        originalAmount: plan.installmentValue,
        dueDate,
        installmentPlanId: plan.id,
        status: InstallmentStatus.PENDING,
      });

      installments.push(installment);
    }

    await this.installmentRepository.save(installments);
  }

  private async updatePlanTotals(planId: string): Promise<void> {
    const plan = await this.installmentPlanRepository.findOne({
      where: { id: planId },
      relations: ['installments'],
    });

    if (!plan) return;

    const paidInstallments = plan.installments.filter(
      i => i.status === InstallmentStatus.PAID
    );

    plan.paidInstallments = paidInstallments.length;
    plan.totalPaid = paidInstallments.reduce(
      (sum, i) => sum + Number(i.paidAmount || 0),
      0
    );
    plan.totalDiscount = paidInstallments.reduce(
      (sum, i) => sum + Number(i.discountAmount || 0),
      0
    );

    await this.installmentPlanRepository.save(plan);
  }

  /**
   * Retorna parcelas pagas em um determinado mês/ano baseado na paidDate
   * @param userId ID do usuário
   * @param year Ano
   * @param month Mês (1-12)
   * @returns Lista de parcelas pagas no mês com informações do plano
   */
  async getPaidInstallmentsForMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<{
    id: string;
    planId: string;
    planName: string;
    installmentNumber: number;
    totalInstallments: number;
    paidAmount: number;
    paidDate: Date;
    discountAmount: number;
  }[]> {
    // Criar range de datas para o mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const paidInstallments = await this.installmentRepository
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.installmentPlan', 'plan')
      .where('plan.userId = :userId', { userId })
      .andWhere('installment.status = :status', { status: InstallmentStatus.PAID })
      .andWhere('installment.paidDate >= :startDate', { startDate })
      .andWhere('installment.paidDate <= :endDate', { endDate })
      .orderBy('installment.paidDate', 'DESC')
      .getMany();

    return paidInstallments.map(installment => ({
      id: installment.id,
      planId: installment.installmentPlan.id,
      planName: installment.installmentPlan.name,
      installmentNumber: installment.installmentNumber,
      totalInstallments: installment.installmentPlan.totalInstallments,
      paidAmount: Number(installment.paidAmount || 0),
      paidDate: installment.paidDate,
      discountAmount: Number(installment.discountAmount || 0),
    }));
  }
}