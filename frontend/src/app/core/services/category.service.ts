/**
 * FILE: frontend/src/app/core/services/category.service.ts
 * ROLE: Angular API service.
 * USED BY / TALKS TO: Components and other Angular services.
 * KEY IDEA: HTTP calls return RxJS Observables.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/restaurant.model';

@Injectable({ providedIn: 'root' })
// KEY: An injectable service shares API logic across components.
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/categories';

  getCategories(restaurantId?: string): Observable<Category[]> {
    let params = new HttpParams();
    if (restaurantId) {
      params = params.set('restaurant', restaurantId);
    }
    return this.http.get<Category[]>(this.baseUrl, { params });
  }

  create(payload: { nom: string; description?: string; restaurant?: string | null }): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, payload);
  }

  update(id: string, payload: { nom: string; description?: string }): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, payload);
  }

// DELETE ${this.baseUrl}/${id}; Observable returns Observable<.
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
