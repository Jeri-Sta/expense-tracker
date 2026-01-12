import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CategoryType } from '../../common/enums';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(
    userId: string,
    workspaceId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    // Get the next sort order
    const maxSortOrder = await this.categoriesRepository
      .createQueryBuilder('category')
      .select('MAX(category.sortOrder)', 'max')
      .where('category.userId = :userId AND category.workspaceId = :workspaceId', {
        userId,
        workspaceId,
      })
      .andWhere('category.type = :type', { type: createCategoryDto.type })
      .getRawOne();

    const sortOrder = (maxSortOrder.max || 0) + 1;

    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      userId,
      workspaceId,
      sortOrder,
    });

    const savedCategory = await this.categoriesRepository.save(category);
    return this.mapToResponseDto(savedCategory);
  }

  async findAll(
    userId: string,
    workspaceId: string,
    type?: CategoryType,
  ): Promise<CategoryResponseDto[]> {
    const queryBuilder = this.categoriesRepository
      .createQueryBuilder('category')
      .leftJoin('category.transactions', 'transaction')
      .addSelect('COUNT(transaction.id)', 'transactionCount')
      .where('category.userId = :userId AND category.workspaceId = :workspaceId', {
        userId,
        workspaceId,
      })
      .andWhere('category.isActive = :isActive', { isActive: true })
      .groupBy('category.id')
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC');

    if (type) {
      queryBuilder.andWhere('category.type = :type', { type });
    }

    const result = await queryBuilder.getRawAndEntities();

    return result.entities.map((category, index) => ({
      ...this.mapToResponseDto(category),
      transactionCount: Number.parseInt(result.raw[index].transactionCount) || 0,
    }));
  }

  async findOne(id: string, userId: string, workspaceId: string): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findOne({
      where: { id, userId, workspaceId },
      relations: ['transactions'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.mapToResponseDto(category);
  }

  async update(
    id: string,
    userId: string,
    workspaceId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.userId !== userId || category.workspaceId !== workspaceId) {
      throw new ForbiddenException('You can only update your own categories');
    }

    Object.assign(category, updateCategoryDto);
    const savedCategory = await this.categoriesRepository.save(category);
    return this.mapToResponseDto(savedCategory);
  }

  async remove(id: string, userId: string, workspaceId: string): Promise<void> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.userId !== userId || category.workspaceId !== workspaceId) {
      throw new ForbiddenException('You can only delete your own categories');
    }

    // Check if category has transactions
    if (category.transactions && category.transactions.length > 0) {
      // Soft delete to preserve transaction history
      await this.categoriesRepository.update(id, { isActive: false });
    } else {
      // Hard delete if no transactions
      await this.categoriesRepository.delete(id);
    }
  }

  async reorderCategories(
    userId: string,
    workspaceId: string,
    categories: Array<{ id: string; sortOrder: number }>,
  ): Promise<void> {
    for (const category of categories) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: { id: category.id, userId, workspaceId },
      });

      if (!existingCategory) {
        throw new NotFoundException(`Category ${category.id} not found`);
      }

      await this.categoriesRepository.update(category.id, {
        sortOrder: category.sortOrder,
      });
    }
  }

  async getByType(
    userId: string,
    workspaceId: string,
    type: CategoryType,
  ): Promise<CategoryResponseDto[]> {
    return this.findAll(userId, workspaceId, type);
  }

  async getDefaultCategories(userId: string, workspaceId: string): Promise<void> {
    // Create default categories for new users
    const defaultCategories = [
      // Income categories
      { name: 'Salário', type: CategoryType.INCOME, color: '#10B981', icon: 'pi-money-bill' },
      { name: 'Freelance', type: CategoryType.INCOME, color: '#8B5CF6', icon: 'pi-briefcase' },
      { name: 'Investimentos', type: CategoryType.INCOME, color: '#F59E0B', icon: 'pi-chart-line' },

      // Expense categories
      {
        name: 'Alimentação',
        type: CategoryType.EXPENSE,
        color: '#EF4444',
        icon: 'pi-shopping-cart',
      },
      { name: 'Transporte', type: CategoryType.EXPENSE, color: '#3B82F6', icon: 'pi-car' },
      { name: 'Moradia', type: CategoryType.EXPENSE, color: '#6B7280', icon: 'pi-home' },
      { name: 'Saúde', type: CategoryType.EXPENSE, color: '#EC4899', icon: 'pi-heart' },
      { name: 'Educação', type: CategoryType.EXPENSE, color: '#14B8A6', icon: 'pi-book' },
      { name: 'Entretenimento', type: CategoryType.EXPENSE, color: '#F97316', icon: 'pi-star' },
      { name: 'Outros', type: CategoryType.EXPENSE, color: '#6B7280', icon: 'pi-ellipsis-h' },
    ];

    const categories = defaultCategories.map((cat, index) =>
      this.categoriesRepository.create({
        ...cat,
        userId,
        workspaceId,
        sortOrder: index + 1,
      }),
    );

    await this.categoriesRepository.save(categories);
  }

  private mapToResponseDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      type: category.type,
      color: category.color,
      icon: category.icon,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
