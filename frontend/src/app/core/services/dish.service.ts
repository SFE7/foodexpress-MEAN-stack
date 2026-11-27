/**
 * FILE: frontend/src/app/core/services/dish.service.ts
 * ROLE: Angular API service.
 * USED BY / TALKS TO: Components and other Angular services.
 * KEY IDEA: HTTP calls return RxJS Observables.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Dish } from '../models/restaurant.model';
import { environment } from '../../../environment/environment';

export interface DishFilters {
  restaurant?: string;
  categorie?: string;
  search?: string;
  disponible?: boolean | string;
}

@Injectable({ providedIn: 'root' })
// KEY: An injectable service shares API logic across components.
export class DishService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dishes`;

  getDishes(filters?: DishFilters): Observable<Dish[]> {
    let params = new HttpParams();
    if (filters?.restaurant) {
      params = params.set('restaurant', filters.restaurant);
    }
    if (filters?.categorie) {
      params = params.set('categorie', filters.categorie);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.disponible !== undefined && filters.disponible !== '') {
      params = params.set('disponible', String(filters.disponible));
    }
    return this.http.get<Dish[]>(this.baseUrl, { params });
  }

// GET ${this.baseUrl}/${id}; Observable returns Observable<Dish>.
  getById(id: string): Observable<Dish> {
    return this.http.get<Dish>(`${this.baseUrl}/${id}`);
  }

// POST base URL; Observable returns Observable<Dish>.
  create(payload: Partial<Dish>): Observable<Dish> {
    return this.http.post<Dish>(this.baseUrl, payload);
  }

// PUT ${this.baseUrl}/${id}; Observable returns Observable<Dish>.
  update(id: string, payload: Partial<Dish>): Observable<Dish> {
    return this.http.put<Dish>(`${this.baseUrl}/${id}`, payload);
  }

// DELETE ${this.baseUrl}/${id}; Observable returns Observable<.
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
