import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Restaurant, RestaurantQueryFilters, RestaurantsResponse, RestaurantStatus } from '../models/restaurant.model';

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/restaurants';

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

  getMine(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/mine`);
  }

  getById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.baseUrl}/${id}`);
  }

  getCuisines(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/cuisines`);
  }

  create(payload: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: string, status: RestaurantStatus): Observable<Restaurant> {
    return this.http.patch<Restaurant>(`${this.baseUrl}/${id}/status`, { status });
  }
}
