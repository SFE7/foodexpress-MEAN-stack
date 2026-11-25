import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import {
  DashboardService,
  RestaurantDashboardStats,
} from '../../../core/services/dashboard.service';
import { OrderService } from '../../../core/services/order.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { Order, ORDER_STATUS_LABELS } from '../../../core/models/order.model';
import { Restaurant } from '../../../core/models/restaurant.model';
import { User } from '../../../core/models/user.model';
import { PortalNavComponent } from '../../../shared/portal-nav/portal-nav.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-restaurant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe, PortalNavComponent],
  template: `
    <div class="container py-4">
      <app-portal-nav area="restaurateur" />

      <!-- Header & Restaurant Selector -->
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1">Restaurateur Dashboard</h1>
          <p class="text-muted mb-0">Monitor orders, revenue, and your top-selling dishes</p>
        </div>

        <div class="d-flex flex-wrap align-items-center gap-2">
          @if (restaurants.length > 1) {
            <select
              class="form-select form-select-sm rounded-pill px-3 shadow-sm restaurant-select"
              [(ngModel)]="selectedRestaurantId"
              (ngModelChange)="onRestaurantChange()"
              aria-label="Filter by restaurant"
            >
              <option value="">All Restaurants ({{ restaurants.length }})</option>
              @for (rest of restaurants; track rest._id) {
                <option [value]="rest._id">{{ rest.nom }}</option>
              }
            </select>
          } @else if (restaurants.length === 1) {
            <span class="badge bg-white text-dark border rounded-pill px-3 py-2 shadow-sm">
              🏪 {{ restaurants[0].nom }}
            </span>
          }

          <a routerLink="/restaurant-dashboard/dishes" class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold">
            🍽️ Manage Dishes
          </a>
          <a routerLink="/restaurant-dashboard/orders" class="btn btn-primary btn-sm rounded-pill px-3 fw-semibold">
            📦 Manage Orders
          </a>
        </div>
      </div>

      @if (errorMessage) {
        <div class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {{ errorMessage }}
          <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
        </div>
      }
      @if (actionSuccess) {
        <div class="alert alert-success alert-dismissible fade show mb-4" role="alert">
          {{ actionSuccess }}
          <button type="button" class="btn-close" (click)="actionSuccess = ''"></button>
        </div>
      }

      @if (loading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading dashboard...</span>
          </div>
        </div>
      } @else {
        <!-- KPI Cards -->
        <div class="row g-3 g-md-4 mb-4">
          <div class="col-6 col-lg-3">
            <div class="card food-card kpi-card p-3 p-md-4 h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-muted small fw-semibold text-uppercase">Total Orders</span>
                <span class="kpi-icon kpi-icon-primary">📦</span>
              </div>
              <div class="display-6 fw-bold text-dark">{{ stats.totalOrders }}</div>
              <div class="small text-muted mt-1">All recorded orders</div>
            </div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="card food-card kpi-card p-3 p-md-4 h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-muted small fw-semibold text-uppercase">Pending</span>
                <span class="kpi-icon kpi-icon-accent">⏳</span>
              </div>
              <div class="display-6 fw-bold text-warning-dark">{{ stats.pendingOrders }}</div>
              <div class="small text-muted mt-1">Awaiting acceptance</div>
            </div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="card food-card kpi-card p-3 p-md-4 h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-muted small fw-semibold text-uppercase">Accepted</span>
                <span class="kpi-icon kpi-icon-blue">✅</span>
              </div>
              <div class="display-6 fw-bold text-primary">{{ stats.acceptedOrders }}</div>
              <div class="small text-muted mt-1">Ready for kitchen</div>
            </div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="card food-card kpi-card p-3 p-md-4 h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-muted small fw-semibold text-uppercase">Revenue</span>
                <span class="kpi-icon kpi-icon-green">💰</span>
              </div>
              <div class="h2 fw-bold text-success mb-0 mt-1">{{ stats.revenue.toFixed(2) }} DT</div>
              <div class="small text-muted mt-2">Excludes cancelled orders</div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Most Ordered Dishes (CSS Bar Visualization) -->
          <div class="col-12 col-lg-6">
            <div class="card food-card p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 class="h5 fw-bold mb-0">Most Ordered Dishes</h2>
                  <small class="text-muted">Top 5 by quantity ordered</small>
                </div>
                <a routerLink="/restaurant-dashboard/dishes" class="small fw-semibold text-decoration-none">
                  Edit menu →
                </a>
              </div>

              @if (stats.topDishes.length === 0) {
                <div class="text-center py-4 text-muted">
                  No dish order data yet.
                </div>
              } @else {
                <div class="d-flex flex-column gap-3">
                  @for (dish of stats.topDishes; track dish.nom; let idx = $index) {
                    <div>
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-semibold text-dark">
                          <span class="rank-pill me-2">{{ idx + 1 }}</span>{{ dish.nom }}
                        </span>
                        <span class="badge rounded-pill text-bg-light border fw-bold">
                          {{ dish.quantite }} ordered
                        </span>
                      </div>
                      <div class="bar-track">
                        <div class="bar-fill" [style.width.%]="getDishBarWidth(dish.quantite)"></div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Latest New Orders Mini-List -->
          <div class="col-12 col-lg-6">
            <div class="card food-card p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 class="h5 fw-bold mb-0">Latest New Orders</h2>
                  <small class="text-muted">Pending orders waiting for your confirmation</small>
                </div>
                <a routerLink="/restaurant-dashboard/orders" class="small fw-semibold text-decoration-none">
                  View all →
                </a>
              </div>

              @if (pendingOrdersList.length === 0) {
                <div class="text-center py-4 text-muted">
                  🎉 No pending orders at the moment.
                </div>
              } @else {
                <div class="d-flex flex-column gap-3">
                  @for (order of pendingOrdersList; track order._id) {
                    <div class="pending-item p-3 rounded-3 border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                      <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                          <span class="fw-bold text-dark">#{{ order._id.slice(-6).toUpperCase() }}</span>
                          <span class="badge bg-warning text-dark rounded-pill">{{ getStatusLabel(order.statut) }}</span>
                          <span class="small text-muted">{{ order.createdAt | date: 'HH:mm' }}</span>
                        </div>
                        <div class="small text-dark fw-medium">
                          {{ getClientName(order) }} · {{ getRestaurantName(order) }}
                        </div>
                        <div class="small text-muted">
                          {{ getItemsSummary(order) }}
                        </div>
                      </div>

                      <div class="d-flex align-items-center gap-2 ms-sm-auto">
                        <span class="fw-bold text-primary text-nowrap">{{ order.total.toFixed(2) }} DT</span>
                        <button
                          type="button"
                          class="btn btn-success btn-sm rounded-pill px-3 fw-semibold text-nowrap"
                          (click)="acceptOrder(order)"
                          [disabled]="acceptingOrderId === order._id"
                        >
                          @if (acceptingOrderId === order._id) {
                            <span class="spinner-border spinner-border-sm me-1"></span>
                          }
                          Accept
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .restaurant-select {
      min-width: 210px;
      background-color: #fff;
    }
    .kpi-card {
      background: #fff;
    }
    .kpi-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .kpi-icon-primary { background: rgba(228, 87, 46, 0.12); }
    .kpi-icon-accent { background: rgba(255, 180, 0, 0.18); }
    .kpi-icon-blue { background: rgba(59, 130, 246, 0.12); }
    .kpi-icon-green { background: rgba(16, 185, 129, 0.12); }
    .text-warning-dark { color: #b45309; }
    .rank-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #fff3eb;
      color: var(--food-primary);
      font-size: 0.75rem;
      font-weight: 700;
    }
    .bar-track {
      height: 10px;
      border-radius: 999px;
      background: #f3ece6;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--food-primary), var(--food-accent));
      transition: width 0.35s ease;
    }
    .pending-item {
      background: #fffaf5;
      border-color: #f6e4d5 !important;
    }
  `],
})
export class RestaurantDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly orderService = inject(OrderService);
  private readonly restaurantService = inject(RestaurantService);

  restaurants: Restaurant[] = [];
  selectedRestaurantId = '';
  stats: RestaurantDashboardStats = {
    totalOrders: 0,
    pendingOrders: 0,
    acceptedOrders: 0,
    revenue: 0,
    topDishes: [],
  };
  pendingOrdersList: Order[] = [];

  loading = true;
  errorMessage = '';
  actionSuccess = '';
  acceptingOrderId: string | null = null;

  ngOnInit(): void {
    this.loadRestaurantsAndDashboard();
  }

  loadRestaurantsAndDashboard(): void {
    this.loading = true;
    const isAdmin = this.auth.getRole() === 'admin';
    const restaurants$ = isAdmin ? this.restaurantService.getAllAdmin() : this.restaurantService.getMine();

    restaurants$.subscribe({
      next: (list) => {
        this.restaurants = list;
        this.loadDashboardData();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to load restaurants.';
        this.loadDashboardData();
      },
    });
  }

  onRestaurantChange(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    const restId = this.selectedRestaurantId || undefined;
    forkJoin({
      stats: this.dashboardService.getRestaurantStats(restId),
      pendingOrders: this.orderService.getRestaurantOrders('en_attente', restId),
    }).subscribe({
      next: ({ stats, pendingOrders }) => {
        this.stats = stats;
        this.pendingOrdersList = pendingOrders.slice(0, 5);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to load dashboard statistics.';
        this.loading = false;
      },
    });
  }

  getDishBarWidth(quantite: number): number {
    const max = Math.max(...this.stats.topDishes.map((d) => d.quantite), 1);
    return Math.round((quantite / max) * 100);
  }

  acceptOrder(order: Order): void {
    this.acceptingOrderId = order._id;
    this.errorMessage = '';
    this.actionSuccess = '';
    this.orderService.updateStatus(order._id, 'acceptee').subscribe({
      next: () => {
        this.acceptingOrderId = null;
        this.actionSuccess = `Order #${order._id.slice(-6).toUpperCase()} accepted.`;
        this.loadDashboardData();
      },
      error: (err) => {
        this.acceptingOrderId = null;
        this.errorMessage = err?.error?.message || 'Failed to accept order.';
      },
    });
  }

  getStatusLabel(status: Order['statut']): string {
    return ORDER_STATUS_LABELS[status] || status;
  }

  getClientName(order: Order): string {
    if (typeof order.client === 'object' && order.client !== null) {
      const c = order.client as User;
      return `${c.prenom || ''} ${c.nom || ''}`.trim() || 'Client';
    }
    return 'Client';
  }

  getRestaurantName(order: Order): string {
    if (typeof order.restaurant === 'object' && order.restaurant !== null) {
      return order.restaurant.nom || 'Restaurant';
    }
    return 'Restaurant';
  }

  getItemsSummary(order: Order): string {
    return order.articles.map((a) => `${a.nom} x${a.quantite}`).join(', ');
  }
}
