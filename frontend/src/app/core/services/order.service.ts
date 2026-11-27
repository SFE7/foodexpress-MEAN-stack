import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { CreateOrderPayload, Order, OrderStatus } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/orders`, payload);
  }

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

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${id}`);
  }

  updateStatus(id: string, statut: OrderStatus): Observable<Order> {
    return this.http.put<Order>(`${environment.apiUrl}/orders/${id}/status`, { statut });
  }
}
