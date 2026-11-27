/**
 * FILE: frontend/src/app/core/services/order.service.ts
 * ROLE: Angular API service.
 * USED BY / TALKS TO: Components and other Angular services.
 * KEY IDEA: HTTP calls return RxJS Observables.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { CreateOrderPayload, Order, OrderStatus } from '../models/order.model';

@Injectable({ providedIn: 'root' })
// KEY: An injectable service shares API logic across components.
export class OrderService {
  private readonly http = inject(HttpClient);

// POST /api/orders; Observable returns Observable<Order>.
  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/orders`, payload);
  }

// GET /api/orders/my-orders; Observable returns Observable<Order[]>.
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.apiUrl}/orders/my-orders`);
  }

  getRestaurantOrders(statut?: string, restaurantId?: string): Observable<Order[]> {
    let params = new HttpParams();
    if (statut && statut !== 'all') {
      params = params.set('statut', statut);
    }
    if (restaurantId) {
      params = params.set('restaurant', restaurantId);
    }
    return this.http.get<Order[]>(`${environment.apiUrl}/orders/restaurant`, { params });
  }

// GET /api/orders/${id}; Observable returns Observable<Order>.
  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${id}`);
  }

// PUT /api/orders/${id}/status; Observable returns Observable<Order>.
  updateStatus(id: string, statut: OrderStatus): Observable<Order> {
    return this.http.put<Order>(`${environment.apiUrl}/orders/${id}/status`, { statut });
  }
}
