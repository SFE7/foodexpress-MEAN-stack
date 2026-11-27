/**
 * FILE: frontend/src/app/core/services/restaurant.service.ts
 * ROLE: Angular API service.
 * USED BY / TALKS TO: Components and other Angular services.
 * KEY IDEA: HTTP calls return RxJS Observables.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Restaurant, RestaurantQueryFilters, RestaurantsResponse, RestaurantStatus } from '../models/restaurant.model';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
// KEY: An injectable service shares API logic across components.
export class RestaurantService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/restaurants`;

  getRestaurants(filters?: RestaurantQueryFilters, page = 1, limit = 12): Observable<RestaurantsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.typeCuisine) {
      params = params.set('typeCuisine', filters.typeCuisine);
    }
    if (filters?.isOpen !== undefined && filters.isOpen !== '') {
      params = params.set('isOpen', String(filters.isOpen));
    }
    if (filters?.sort) {
      params = params.set('sort', filters.sort);
    }

    return this.http.get<RestaurantsResponse>(this.baseUrl, { params });
  }

// GET ${this.baseUrl}/mine; Observable returns Observable<Restaurant[]>.
  getMine(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/mine`);
  }

// GET ${this.baseUrl}/admin/all; Observable returns Observable<Restaurant[]>.
  getAllAdmin(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/admin/all`);
  }

// GET ${this.baseUrl}/${id}; Observable returns Observable<Restaurant>.
  getById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.baseUrl}/${id}`);
  }

// GET ${this.baseUrl}/cuisines; Observable returns Observable<string[]>.
  getCuisines(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/cuisines`);
  }

// POST base URL; Observable returns Observable<Restaurant>.
  create(payload: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.baseUrl, payload);
  }

// PUT ${this.baseUrl}/${id}; Observable returns Observable<Restaurant>.
  update(id: string, payload: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/${id}`, payload);
  }

// DELETE ${this.baseUrl}/${id}; Observable returns Observable<.
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

// PATCH ${this.baseUrl}/${id}/status; Observable returns Observable<Restaurant>.
  updateStatus(id: string, status: RestaurantStatus): Observable<Restaurant> {
    return this.http.patch<Restaurant>(`${this.baseUrl}/${id}/status`, { status });
  }
}
