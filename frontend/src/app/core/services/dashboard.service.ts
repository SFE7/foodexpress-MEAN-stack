/**
 * FILE: frontend/src/app/core/services/dashboard.service.ts
 * ROLE: Angular API service.
 * USED BY / TALKS TO: Components and other Angular services.
 * KEY IDEA: HTTP calls return RxJS Observables.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderStatus } from '../models/order.model';

export interface TopDishStat {
  nom: string;
  quantite: number;
}

export interface RestaurantDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  revenue: number;
  topDishes: TopDishStat[];
}

export interface OrderStatusCount {
  statut: OrderStatus;
  count: number;
}

export interface AdminDashboardStats {
  clientsCount: number;
  restaurantsCount: number;
  ordersCount: number;
  globalRevenue: number;
  ordersByStatus: OrderStatusCount[];
}

@Injectable({ providedIn: 'root' })
// KEY: An injectable service shares API logic across components.
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/dashboard';

  getRestaurantStats(restaurantId?: string): Observable<RestaurantDashboardStats> {
    let params = new HttpParams();
    if (restaurantId) {
      params = params.set('restaurant', restaurantId);
    }
    return this.http.get<RestaurantDashboardStats>(`${this.baseUrl}/restaurant`, { params });
  }

// GET ${this.baseUrl}/admin; Observable returns Observable<AdminDashboardStats>.
  getAdminStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.baseUrl}/admin`);
  }
}
