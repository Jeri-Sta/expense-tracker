import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import {
  CategoryService,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../core/services/category.service';
import { CategoryType } from '../../core/types/common.types';
import { normalizeIcon } from '../../shared/utils/icon.utils';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = false;

  // Dialog states
  categoryDialog = false;
  editMode = false;
  submitted = false;

  // Forms
  categoryForm!: FormGroup;

  // Selected category for operations
  selectedCategory!: Category;

  // Category type options
  categoryTypes = [
    { label: 'Receita', value: 'income' as CategoryType },
    { label: 'Despesa', value: 'expense' as CategoryType },
  ];

  // Filter
  selectedType: CategoryType | undefined;

  // Predefined colors and icons
  availableColors: string[] = [];
  availableIcons: string[] = [];

  // Color picker
  showColorPicker = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPredefinedOptions();
    this.loadCategories();
  }

  initializeForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(255)],
      type: ['expense' as CategoryType, Validators.required],
      color: ['#6B7280', Validators.required],
      icon: ['pi pi-tag', Validators.required],
      sortOrder: [0, [Validators.min(0)]],
    });
  }

  loadPredefinedOptions(): void {
    this.availableColors = this.categoryService.getCategoryColors();
    this.availableIcons = this.categoryService.getCategoryIcons();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories(this.selectedType).subscribe({
      next: (categories) => {
        this.categories = categories.sort((a, b) => {
          // Sort by type first, then by sortOrder, then by name
          if (a.type !== b.type) {
            return a.type === 'income' ? -1 : 1;
          }
          if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder;
          }
          return a.name.localeCompare(b.name);
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar categorias',
        });
        this.loading = false;
      },
    });
  }

  filterByType(type: CategoryType | undefined): void {
    this.selectedType = type;
    this.loadCategories();
  }

  openNew(): void {
    this.selectedCategory = {} as Category;
    this.editMode = false;
    this.submitted = false;
    this.categoryForm.reset({
      type: 'expense',
      color: '#6B7280',
      icon: 'pi pi-tag',
      sortOrder: 0,
    });
    this.categoryDialog = true;
  }

  editCategory(category: Category): void {
    this.selectedCategory = { ...category };
    this.editMode = true;
    this.submitted = false;

    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || '',
      type: category.type,
      color: category.color,
      icon: category.icon,
      sortOrder: category.sortOrder,
    });

    this.categoryDialog = true;
  }

  deleteCategory(category: Category): void {
    if (category.transactionCount && category.transactionCount > 0) {
      this.confirmationService.confirm({
        message: `A categoria "${category.name}" possui ${category.transactionCount} transação(ões) vinculada(s). Ela será desativada ao invés de excluída. Deseja continuar?`,
        header: 'Confirmar Desativação',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.deactivateCategory(category);
        },
      });
    } else {
      this.confirmationService.confirm({
        message: `Tem certeza que deseja excluir a categoria "${category.name}"?`,
        header: 'Confirmar Exclusão',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.performDelete(category);
        },
      });
    }
  }

  private deactivateCategory(category: Category): void {
    this.categoryService.updateCategory(category.id, { isActive: false }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Categoria desativada com sucesso',
        });
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error deactivating category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao desativar categoria',
        });
      },
    });
  }

  private performDelete(category: Category): void {
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Categoria excluída com sucesso',
        });
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao excluir categoria',
        });
      },
    });
  }

  saveCategory(): void {
    this.submitted = true;

    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;

      if (this.editMode) {
        const updateDto: UpdateCategoryDto = {
          name: formValue.name,
          description: formValue.description,
          type: formValue.type,
          color: formValue.color,
          icon: formValue.icon,
          sortOrder: formValue.sortOrder,
        };

        this.categoryService.updateCategory(this.selectedCategory.id, updateDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categoria atualizada com sucesso',
            });
            this.hideDialog();
            this.loadCategories();
          },
          error: (error) => {
            console.error('Error updating category:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao atualizar categoria',
            });
          },
        });
      } else {
        const createDto: CreateCategoryDto = {
          name: formValue.name,
          description: formValue.description,
          type: formValue.type,
          color: formValue.color,
          icon: formValue.icon,
        };

        this.categoryService.createCategory(createDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categoria criada com sucesso',
            });
            this.hideDialog();
            this.loadCategories();
          },
          error: (error) => {
            console.error('Error creating category:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar categoria',
            });
          },
        });
      }
    }
  }

  hideDialog(): void {
    this.categoryDialog = false;
    this.submitted = false;
    this.showColorPicker = false;
    this.categoryForm.reset();
  }

  createDefaultCategories(): void {
    this.confirmationService.confirm({
      message:
        'Deseja criar as categorias padrão? Isso adicionará categorias básicas para receitas e despesas.',
      header: 'Criar Categorias Padrão',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.categoryService.createDefaultCategories().subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categorias padrão criadas com sucesso',
            });
            this.loadCategories();
            this.confirmationService.close();
          },
          error: (_error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar categorias padrão',
            });
            this.confirmationService.close();
          },
        });
      },
    });
  }

  selectColor(color: string): void {
    this.categoryForm.patchValue({ color });
    this.showColorPicker = false;
  }

  selectIcon(icon: string): void {
    this.categoryForm.patchValue({ icon });
  }

  getCategoryTypeLabel(type: CategoryType): string {
    return type === 'income' ? 'Receita' : 'Despesa';
  }

  getCategoryTypeClass(type: CategoryType): string {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Ativa' : 'Inativa';
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  reactivateCategory(category: Category): void {
    this.categoryService.updateCategory(category.id, { isActive: true }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Categoria reativada com sucesso',
        });
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error reactivating category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao reativar categoria',
        });
      },
    });
  }

  getPreviewIconClass(): string {
    return this.categoryForm.get('icon')?.value || 'pi pi-tag';
  }

  getPreviewColor(): string {
    return this.categoryForm.get('color')?.value || '#6B7280';
  }

  // Método para testar se um ícone é válido
  isValidIcon(icon: string): boolean {
    return !!(icon && (icon.startsWith('pi pi-') || icon.startsWith('pi-')));
  }

  // Método para normalizar ícones antigos
  normalizeIcon(icon: string): string {
    return normalizeIcon(icon);
  }
}
