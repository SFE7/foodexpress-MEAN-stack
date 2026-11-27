import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AdminDashboardStats,
  DashboardService,
} from '../../../core/services/dashboard.service';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  OrderStatus,
} from '../../../core/models/order.model';
import { PortalNavComponent } from '../../../shared/portal-nav/portal-nav.component';

interface StatusSegment {
  statut: OrderStatus;
  label: string;
  color: string;
  count: number;
  percentage: number;
  dashArray: string;
  dashOffset: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [CommonModule, PortalNavComponent],
  template: `
    <div class="container py-4">
      <app-portal-nav area="admin" />

      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1">Platform Statistics</h1>
        <p class="text-muted mb-0">Global FoodExpress metrics and order distribution by status</p>
      </div>

      @if (errorMessage) {
        <div class="alert alert-danger mb-4" role="alert">{{ errorMessage }}</div>
      }

      @if (loading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading statistics...</span>
          </div>
        </div>
      } @else {
        <!-- Global KPI Cards -->
        <div class="row g-3 g-md-4 mb-4">
          <div class="col-6 col-lg-3">
            <div class="card food-card p-3 p-md-4 h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-muted small fw-semibold text-uppercase">Clients</span>
                <span class="kpi-badge kpi-clients"><i class="bi bi-people-fill"></i></span>
              </div>
              <div class="display-6 fw-bold text-dark">{{ stats.clientsCount }}</div>
              <div class="small text-muted mt-1">Registered clients</div>
            </div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="card food-card p-3 p-md-4 h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-muted small fw-semibold text-uppercase">Restaurants</span>
                <span class="kpi-badge kpi-restaurants"><i class="bi bi-shop"></i></span>
              </div>
              <div class="display-6 fw-bold text-primary">{{ stats.restaurantsCount }}</div>
              <div class="small text-muted mt-1">All listed venues</div>
            </div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="card food-card p-3 p-md-4 h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-muted small fw-semibold text-uppercase">Orders</span>
                <span class="kpi-badge kpi-orders"><i class="bi bi-box-seam"></i></span>
              </div>
              <div class="display-6 fw-bold text-dark">{{ stats.ordersCount }}</div>
              <div class="small text-muted mt-1">Total orders placed</div>
            </div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="card food-card p-3 p-md-4 h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-muted small fw-semibold text-uppercase">Global Revenue</span>
                <span class="kpi-badge kpi-revenue"><i class="bi bi-cash-stack"></i></span>
              </div>
              <div class="h2 fw-bold text-success mb-0 mt-1">{{ stats.globalRevenue.toFixed(2) }} DT</div>
              <div class="small text-muted mt-2">Excludes cancelled orders</div>
            </div>
          </div>
        </div>

        <!-- Orders by Status Chart (Pure SVG Donut + CSS Bars) -->
        <div class="card food-card p-4">
          <h2 class="h5 fw-bold mb-1">Orders by Status</h2>
          <p class="text-muted small mb-4">Distribution across every order lifecycle stage</p>

          @if (totalStatusOrders === 0) {
            <div class="text-center py-4 text-muted">No orders recorded yet.</div>
          } @else {
            <div class="row align-items-center g-4">
              <!-- Pure SVG Donut Chart -->
              <div class="col-12 col-md-5 d-flex justify-content-center">
                <div class="donut-wrapper position-relative">
                  <svg viewBox="0 0 180 180" class="donut-svg" role="img" aria-label="Orders by status chart">
                    <circle
                      cx="90"
                      cy="90"
                      r="68"
                      fill="transparent"
                      stroke="#f3ece6"
                      stroke-width="24"
                    />
                    @for (seg of segments; track seg.statut) {
                      @if (seg.count > 0) {
                        <circle
                          cx="90"
                          cy="90"
                          r="68"
                          fill="transparent"
                          [attr.stroke]="seg.color"
                          stroke-width="24"
                          [attr.stroke-dasharray]="seg.dashArray"
                          [attr.stroke-dashoffset]="seg.dashOffset"
                          transform="rotate(-90 90 90)"
                        />
                      }
                    }
                  </svg>
                  <div class="donut-center text-center">
                    <div class="h3 fw-bold mb-0 text-dark">{{ totalStatusOrders }}</div>
                    <div class="small text-muted">Orders</div>
                  </div>
                </div>
              </div>

              <!-- CSS Bar Breakdown -->
              <div class="col-12 col-md-7">
                <div class="d-flex flex-column gap-3">
                  @for (seg of segments; track seg.statut) {
                    <div>
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <div class="d-flex align-items-center gap-2">
                          <span class="status-dot" [style.background-color]="seg.color"></span>
                          <span class="fw-semibold text-dark">{{ seg.label }}</span>
                        </div>
                        <span class="small fw-bold text-dark">
                          {{ seg.count }} ({{ seg.percentage }}%)
                        </span>
                      </div>
                      <div class="bar-track">
                        <div
                          class="bar-fill"
                          [style.width.%]="seg.percentage"
                          [style.background-color]="seg.color"
                        ></div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .kpi-badge {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .kpi-clients { background: rgba(59, 130, 246, 0.12); }
    .kpi-restaurants { background: rgba(228, 87, 46, 0.12); }
    .kpi-orders { background: rgba(255, 180, 0, 0.18); }
    .kpi-revenue { background: rgba(16, 185, 129, 0.12); }
    .donut-wrapper {
      width: 210px;
      max-width: 100%;
      height: 210px;
    }
    .donut-svg {
      width: 100%;
      height: 100%;
    }
    .donut-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .status-dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      display: inline-block;
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
      transition: width 0.35s ease;
    }
  `],
})
export class StatisticsComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  stats: AdminDashboardStats = {
    clientsCount: 0,
    restaurantsCount: 0,
    ordersCount: 0,
    globalRevenue: 0,
    ordersByStatus: [],
  };
  segments: StatusSegment[] = [];
  totalStatusOrders = 0;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.dashboardService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.buildChartSegments();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to load admin statistics.';
        this.loading = false;
      },
    });
  }

  private buildChartSegments(): void {
    const circumference = 2 * Math.PI * 68;
    const total = this.stats.ordersByStatus.reduce((sum, item) => sum + item.count, 0);
    this.totalStatusOrders = total;

    let cumulativeLength = 0;
    this.segments = this.stats.ordersByStatus.map((item) => {
      const fraction = total > 0 ? item.count / total : 0;
      const segmentLength = fraction * circumference;
      const segment: StatusSegment = {
        statut: item.statut,
        label: ORDER_STATUS_LABELS[item.statut] || item.statut,
        color: ORDER_STATUS_COLORS[item.statut] || '#6b7280',
        count: item.count,
        percentage: total > 0 ? Math.round(fraction * 100) : 0,
        dashArray: `${segmentLength} ${circumference - segmentLength}`,
        dashOffset: -cumulativeLength,
      };
      cumulativeLength += segmentLength;
      return segment;
    });
  }
}
