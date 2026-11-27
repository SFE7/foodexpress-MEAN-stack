import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { OrderService } from '../../core/services/order.service';
import {
  Order,
  OrderStatus,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_BADGES,
  ORDER_STATUS_COLORS,
} from '../../core/models/order.model';
import { Restaurant } from '../../core/models/restaurant.model';

interface StepDef {
  key: OrderStatus;
  label: string;
  icon: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="container py-4 py-md-5">
      <!-- Title & Live Indicator -->
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1">My Orders</h1>
          <p class="text-muted mb-0">Track your order statuses in real-time</p>
        </div>
        <div class="d-flex flex-wrap align-items-center gap-2">
          <span class="live-dot" title="Live status updates active"></span>
          <span class="small text-muted">Auto-refreshes every 15s</span>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary rounded-pill px-3 ms-sm-2"
            (click)="loadOrders(true)"
            [disabled]="loading"
          >
            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>
      </div>

      <!-- Action Feedback Alerts -->
      @if (actionError) {
        <div class="alert alert-danger alert-dismissible fade show rounded-3 mb-4 shadow-sm" role="alert">
          {{ actionError }}
          <button type="button" class="btn-close" (click)="actionError = null"></button>
        </div>
      }
      @if (actionSuccess) {
        <div class="alert alert-success alert-dismissible fade show rounded-3 mb-4 shadow-sm" role="alert">
          {{ actionSuccess }}
          <button type="button" class="btn-close" (click)="actionSuccess = null"></button>
        </div>
      }

      <!-- Loading State -->
      @if (loading && orders.length === 0) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading orders...</span>
          </div>
          <p class="text-muted mt-2">Loading your orders...</p>
        </div>
      } @else if (orders.length === 0) {
        <!-- Empty Orders State -->
        <div class="card food-card text-center p-5 mx-auto empty-card">
          <div class="display-3 mb-3 text-muted"><i class="bi bi-box-seam"></i></div>
          <h2 class="h4 fw-bold mb-2">No orders placed yet</h2>
          <p class="text-muted mb-4">
            You haven't ordered any meals yet. Browse our selection of popular restaurants and treat yourself!
          </p>
          <div>
            <a routerLink="/restaurants" class="btn btn-primary rounded-pill px-4 py-2 fw-semibold">
              Explore Restaurants
            </a>
          </div>
        </div>
      } @else {
        <!-- Orders List -->
        <div class="d-flex flex-column gap-4">
          @for (order of orders; track order._id) {
            <div class="card food-card overflow-hidden border-0 shadow-sm order-card">
              <!-- Order Header -->
              <div class="p-3 p-md-4 bg-white border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div class="d-flex align-items-center gap-3">
                  <img
                    [src]="getRestaurantImage(order)"
                    [alt]="getRestaurantName(order)"
                    class="rounded-3 restaurant-thumb"
                    (error)="onImageError($event)"
                  />
                  <div>
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <h2 class="h5 fw-bold mb-0 text-dark">{{ getRestaurantName(order) }}</h2>
                      <span [class]="'badge rounded-pill ' + getBadgeClass(order.statut)">
                        {{ getStatusLabel(order.statut) }}
                      </span>
                    </div>
                    <div class="small text-muted d-flex flex-wrap align-items-center gap-3">
                      <span>Ref: <strong>#{{ order._id.slice(-6).toUpperCase() }}</strong></span>
                      <span>•</span>
                      <span>{{ order.createdAt | date: 'dd MMM yyyy, HH:mm' }}</span>
                      <span>•</span>
                      <span>{{ order.articles.length }} item{{ order.articles.length > 1 ? 's' : '' }}</span>
                    </div>
                  </div>
                </div>

                <div class="d-flex align-items-center justify-content-between justify-content-md-end gap-3">
                  <div class="text-md-end">
                    <span class="d-block small text-muted">Total Paid</span>
                    <span class="fs-5 fw-bold text-primary">{{ order.total.toFixed(2) }} DT</span>
                  </div>

                  <!-- Cancel Button (Only if en_attente) -->
                  @if (order.statut === 'en_attente') {
                    <button
                      type="button"
                      class="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
                      (click)="cancelOrder(order)"
                      [disabled]="cancellingId === order._id"
                    >
                      @if (cancellingId === order._id) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      }
                      Cancel Order
                    </button>
                  }
                </div>
              </div>

              <!-- Tracking Stepper / Cancelled Banner -->
              <div class="p-4 bg-light bg-opacity-50 border-bottom">
                @if (order.statut === 'annulee') {
                  <!-- Cancelled Banner -->
                  <div class="alert alert-danger mb-0 d-flex align-items-center gap-3 py-3 px-4 rounded-3 border-danger-subtle">
                    <span class="fs-3"><i class="bi bi-x-octagon-fill"></i></span>
                    <div>
                      <div class="fw-bold">Order Cancelled</div>
                      <div class="small text-danger-emphasis">
                        This order was cancelled and is no longer being prepared or delivered.
                      </div>
                    </div>
                  </div>
                } @else {
                  <!-- 5-Step Visual Stepper -->
                  <div class="stepper-wrapper">
                    <div class="stepper-progress-bar" [style.width]="getStepProgressPercent(order.statut)"></div>
                    <div class="stepper-steps">
                      @for (step of steps; track step.key; let i = $index) {
                        <div
                          class="step-item text-center"
                          [class.completed]="isStepCompleted(order.statut, i)"
                          [class.active]="isStepActive(order.statut, i)"
                        >
                          <div class="step-circle mx-auto mb-2 shadow-sm">
                            @if (isStepCompleted(order.statut, i)) {
                              <i class="bi bi-check-lg"></i>
                            } @else {
                              <i [class]="'bi ' + step.icon"></i>
                            }
                          </div>
                          <div class="step-label small fw-semibold">
                            {{ step.label }}
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Collapsible Details Toggle -->
              <div class="px-4 py-2 bg-white d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  class="btn btn-link text-decoration-none text-secondary p-0 small fw-semibold d-flex align-items-center gap-1"
                  (click)="toggleDetails(order._id)"
                >
                  <span>{{ isExpanded(order._id) ? '▲ Hide Details' : '▼ View Order Details' }}</span>
                </button>
                <span class="small text-muted text-capitalize">
                  Payment: {{ order.modePaiement === 'livraison' ? 'Cash on Delivery' : 'Online' }}
                </span>
              </div>

              <!-- Expanded Details Section -->
              @if (isExpanded(order._id)) {
                <div class="p-4 bg-white border-top">
                  <div class="row g-4">
                    <!-- Articles Table -->
                    <div class="col-md-7">
                      <h3 class="h6 fw-bold mb-3 text-secondary text-uppercase small">Dishes Ordered</h3>
                      <div class="table-responsive">
                        <table class="table table-sm align-middle mb-0">
                          <thead class="table-light">
                            <tr>
                              <th scope="col" class="border-0">Item</th>
                              <th scope="col" class="border-0 text-center">Qty</th>
                              <th scope="col" class="border-0 text-end">Price</th>
                              <th scope="col" class="border-0 text-end">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (item of order.articles; track item.plat) {
                              <tr>
                                <td class="fw-medium text-dark">{{ item.nom }}</td>
                                <td class="text-center">{{ item.quantite }}</td>
                                <td class="text-end text-muted">{{ item.prixUnitaire.toFixed(2) }} DT</td>
                                <td class="text-end fw-semibold">
                                  {{ (item.quantite * item.prixUnitaire).toFixed(2) }} DT
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- Delivery & Cost Breakdown -->
                    <div class="col-md-5">
                      <div class="p-3 rounded-3 bg-light bg-opacity-75 h-100 d-flex flex-column justify-content-between">
                        <div>
                          <h3 class="h6 fw-bold mb-2 text-secondary text-uppercase small">Delivery Details</h3>
                          <div class="small mb-2">
                            <span class="text-muted d-block">Delivery Address:</span>
                            <span class="fw-semibold text-dark">{{ order.adresseLivraison }}</span>
                          </div>
                          @if (order.remarque) {
                            <div class="small mb-3">
                              <span class="text-muted d-block">Order Note:</span>
                              <span class="fst-italic text-dark">"{{ order.remarque }}"</span>
                            </div>
                          }
                        </div>

                        <div class="border-top pt-2 mt-2">
                          <div class="d-flex justify-content-between small text-muted mb-1">
                            <span>Subtotal:</span>
                            <span>{{ order.sousTotal.toFixed(2) }} DT</span>
                          </div>
                          <div class="d-flex justify-content-between small text-muted mb-2">
                            <span>Delivery Fee:</span>
                            <span>{{ order.fraisLivraison.toFixed(2) }} DT</span>
                          </div>
                          <div class="d-flex justify-content-between fw-bold text-dark fs-6 pt-1 border-top">
                            <span>Grand Total:</span>
                            <span class="text-primary">{{ order.total.toFixed(2) }} DT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .empty-card {
      max-width: 520px;
    }
    .restaurant-thumb {
      width: 56px;
      height: 56px;
      object-fit: cover;
      background: #f3f4f6;
    }
    .live-dot {
      width: 10px;
      height: 10px;
      background-color: #10b981;
      border-radius: 50%;
      display: inline-block;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { box-shadow: 0 0 0 7px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    /* Stepper Styling */
    .stepper-wrapper {
      position: relative;
      margin: 10px 0;
    }
    .stepper-progress-bar {
      position: absolute;
      top: 20px;
      left: 10%;
      height: 4px;
      background: var(--food-primary);
      transition: width 0.4s ease;
      z-index: 1;
    }
    .stepper-steps {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 2;
    }
    .step-item {
      flex: 1;
      position: relative;
    }
    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid #e5e7eb;
      color: #9ca3af;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }
    .step-item.completed .step-circle {
      background: #10b981;
      border-color: #10b981;
      color: #fff;
    }
    .step-item.active .step-circle {
      background: var(--food-primary);
      border-color: var(--food-primary);
      color: #fff;
      transform: scale(1.15);
      box-shadow: 0 4px 12px rgba(228, 87, 46, 0.35) !important;
    }
    .step-label {
      color: #9ca3af;
      font-size: 0.8rem;
    }
    .step-item.active .step-label {
      color: var(--food-primary);
      font-weight: 700;
    }
    .step-item.completed .step-label {
      color: #1f2937;
    }
    @media (max-width: 576px) {
      .step-circle {
        width: 30px;
        height: 30px;
        font-size: 0.75rem;
      }
      .step-label {
        font-size: 0.65rem;
        line-height: 1.15;
        word-break: break-word;
        padding: 0 2px;
      }
      .stepper-progress-bar {
        top: 15px;
      }
    }
  `],
})
export class MyOrdersComponent implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);

  readonly defaultRestaurantImage =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';

  readonly steps: StepDef[] = [
    { key: 'en_attente', label: 'En attente', icon: 'bi-hourglass-split' },
    { key: 'acceptee', label: 'Acceptée', icon: 'bi-check-circle-fill' },
    { key: 'en_preparation', label: 'En préparation', icon: 'bi-fire' },
    { key: 'en_livraison', label: 'En livraison', icon: 'bi-scooter' },
    { key: 'livree', label: 'Livrée', icon: 'bi-bag-check-fill' },
  ];

  private readonly stepOrder: OrderStatus[] = [
    'en_attente',
    'acceptee',
    'en_preparation',
    'en_livraison',
    'livree',
  ];

  orders: Order[] = [];
  loading = true;
  cancellingId: string | null = null;
  actionError: string | null = null;
  actionSuccess: string | null = null;
  expandedOrders = new Set<string>();

  private pollSubscription?: Subscription;

  ngOnInit(): void {
    this.loadOrders(true);

    // Poll every 15 seconds for live status updates
    this.pollSubscription = interval(15000).subscribe(() => {
      this.loadOrders(false);
    });
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  loadOrders(showSpinner = false): void {
    if (showSpinner) {
      this.loading = true;
    }
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.loading = false;
      },
    });
  }

  cancelOrder(order: Order): void {
    if (!window.confirm('Are you sure you want to cancel this pending order?')) {
      return;
    }

    this.cancellingId = order._id;
    this.actionError = null;
    this.actionSuccess = null;

    this.orderService.updateStatus(order._id, 'annulee').subscribe({
      next: (updatedOrder) => {
        this.cancellingId = null;
        this.actionSuccess = `Order #${order._id.slice(-6).toUpperCase()} was cancelled.`;
        // Update local state
        const idx = this.orders.findIndex((o) => o._id === order._id);
        if (idx !== -1) {
          this.orders[idx] = updatedOrder;
        }
      },
      error: (err) => {
        this.cancellingId = null;
        this.actionError = err.error?.message || 'Could not cancel order. Please try again.';
      },
    });
  }

  toggleDetails(orderId: string): void {
    if (this.expandedOrders.has(orderId)) {
      this.expandedOrders.delete(orderId);
    } else {
      this.expandedOrders.add(orderId);
    }
  }

  isExpanded(orderId: string): boolean {
    return this.expandedOrders.has(orderId);
  }

  getStatusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] || status;
  }

  getBadgeClass(status: OrderStatus): string {
    return ORDER_STATUS_BADGES[status] || 'bg-secondary text-white';
  }

  getRestaurantName(order: Order): string {
    if (typeof order.restaurant === 'object' && order.restaurant !== null) {
      return order.restaurant.nom || 'Restaurant';
    }
    return 'Restaurant';
  }

  getRestaurantImage(order: Order): string {
    if (typeof order.restaurant === 'object' && order.restaurant !== null && order.restaurant.image) {
      return order.restaurant.image;
    }
    return this.defaultRestaurantImage;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultRestaurantImage;
  }

  getStepIndex(status: OrderStatus): number {
    return this.stepOrder.indexOf(status);
  }

  isStepCompleted(currentStatus: OrderStatus, stepIndex: number): boolean {
    const curIdx = this.getStepIndex(currentStatus);
    return curIdx > stepIndex;
  }

  isStepActive(currentStatus: OrderStatus, stepIndex: number): boolean {
    const curIdx = this.getStepIndex(currentStatus);
    return curIdx === stepIndex;
  }

  getStepProgressPercent(status: OrderStatus): string {
    const curIdx = this.getStepIndex(status);
    if (curIdx <= 0) return '0%';
    const pct = (curIdx / (this.stepOrder.length - 1)) * 80;
    return `${pct}%`;
  }
}
