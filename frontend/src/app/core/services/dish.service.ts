import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Dish } from '../models/restaurant.model';

export interface DishFilters {
  restaurant?: string;
  categorie?: string;
  search?: string;
  disponible?: boolean | string;
}

@Injectable({ providedIn: 'root' })
export class DishService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/dishes';

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

  getById(id: string): Observable<Dish> {
    return this.http.get<Dish>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Dish>): Observable<Dish> {
    return this.http.post<Dish>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<Dish>): Observable<Dish> {
    return this.http.put<Dish>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
