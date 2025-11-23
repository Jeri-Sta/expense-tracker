import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type CategoryType = 'income' | 'expense';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  type: CategoryType;
  color: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  transactionCount?: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  type: CategoryType;
  color: string;
  icon: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  type?: CategoryType;
  color?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  constructor(private readonly http: HttpClient) {}

  getCategories(type?: CategoryType): Observable<Category[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<Category[]>(this.apiUrl, { params });
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  updateCategory(id: string, category: UpdateCategoryDto): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createDefaultCategories(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/defaults`, {});
  }

  // Helper method to get category icon options
  getCategoryIcons(): string[] {
    return [
      'pi pi-money-bill',
      'pi pi-credit-card', 
      'pi pi-briefcase',
      'pi pi-shopping-cart',
      'pi pi-home',
      'pi pi-car',
      'pi pi-heart',
      'pi pi-star',
      'pi pi-book',
      'pi pi-gift',
      'pi pi-phone',
      'pi pi-globe',
      'pi pi-cog',
      'pi pi-building',
      'pi pi-users',
      'pi pi-user',
      'pi pi-calendar',
      'pi pi-clock',
      'pi pi-tag',
      'pi pi-folder',
      'pi pi-file',
      'pi pi-bookmark',
      'pi pi-wrench',
      'pi pi-bolt',
      'pi pi-flag',
      'pi pi-circle',
      'pi pi-check',
      'pi pi-times',
      'pi pi-plus',
      'pi pi-minus',
      'pi pi-question',
      'pi pi-info',
      'pi pi-exclamation-triangle',
      'pi pi-search',
      'pi pi-pencil',
      'pi pi-trash',
      'pi pi-save',
      'pi pi-arrow-up',
      'pi pi-arrow-down'
    ];
  }

  // Helper method to get predefined colors
  getCategoryColors(): string[] {
    return [
      '#10B981', // green
      '#3B82F6', // blue
      '#EF4444', // red
      '#F59E0B', // yellow
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#14B8A6', // teal
      '#F97316', // orange
      '#6B7280', // gray
      '#84CC16', // lime
      '#06B6D4', // cyan
      '#A855F7'  // violet
    ];
  }
}