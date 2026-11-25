import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateOrderPayload, Order, OrderStatus } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>('/api/orders', payload);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('/api/orders/my-orders');
  }

  getRestaurantOrders(statut?: string): Observable<Order[]> {
    let params = new HttpParams();
    if (statut && statut !== 'all') {
      params = params.set('statut', statut);
    }
    return this.http.get<Order[]>('/api/orders/restaurant', { params });
  }

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`/api/orders/${id}`);
  }

  updateStatus(id: string, statut: OrderStatus): Observable<Order> {
    return this.http.put<Order>(`/api/orders/${id}/status`, { statut });
  }
}
