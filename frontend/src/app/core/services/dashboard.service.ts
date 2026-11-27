import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
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
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  getRestaurantStats(restaurantId?: string): Observable<RestaurantDashboardStats> {
    let params = new HttpParams();
    if (restaurantId) {
      params = params.set('restaurant', restaurantId);
    }
    return this.http.get<RestaurantDashboardStats>(`${this.baseUrl}/restaurant`, { params });
  }

  getAdminStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.baseUrl}/admin`);
  }
}
