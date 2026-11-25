import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import {
  Order,
  OrderStatus,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_BADGES,
} from '../../../core/models/order.model';
import { User } from '../../../core/models/user.model';
import { PortalNavComponent } from '../../../shared/portal-nav/portal-nav.component';

interface StatusTab {
  id: string;
  label: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, DatePipe, PortalNavComponent],
  template: `
    <div class="container py-4 py-md-5">
      <app-portal-nav area="restaurateur" />
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge text-bg-warning px-2 py-1">Restaurateur Portal</span>
            <span class="live-dot" title="Live order updates active"></span>
            <span class="text-muted small">Auto-refresh 15s</span>
          </div>
          <h1 class="h2 fw-bold mb-1">Manage Orders</h1>
          <p class="text-muted mb-0">Track incoming client orders and update their preparation lifecycle</p>
        </div>

        <div class="d-flex align-items-center gap-2">
          @if (pendingCount > 0) {
            <span class="badge bg-warning text-dark px-3 py-2 fs-6 shadow-sm">
              ⚠️ {{ pendingCount }} Pending Order{{ pendingCount > 1 ? 's' : '' }}
            </span>
          }
          <button
            type="button"
            class="btn btn-outline-secondary rounded-pill px-3"
            (click)="loadOrders(true)"
            [disabled]="loading"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Action Alerts -->
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

      <!-- Status Filter Tabs -->
      <div class="d-flex gap-2 overflow-auto pb-2 mb-4 status-tabs">
        @for (tab of tabs; track tab.id) {
          <button
            type="button"
            class="btn rounded-pill px-3 py-2 fw-semibold text-nowrap d-flex align-items-center gap-2 tab-btn"
            [class.btn-primary]="activeTab === tab.id"
            [class.btn-light]="activeTab !== tab.id"
            [class.border]="activeTab !== tab.id"
            (click)="setTab(tab.id)"
          >
            <span>{{ tab.label }}</span>
            <span
              class="badge rounded-pill"
              [class.bg-white]="activeTab === tab.id"
              [class.text-primary]="activeTab === tab.id"
              [class.bg-secondary]="activeTab !== tab.id"
              [class.text-white]="activeTab !== tab.id"
            >
              {{ getCountForTab(tab.id) }}
            </span>
          </button>
        }
      </div>

      <!-- Orders Display -->
      @if (loading && allOrders.length === 0) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading orders...</span>
          </div>
          <p class="text-muted mt-2">Loading restaurant orders...</p>
        </div>
      } @else if (filteredOrders.length === 0) {
        <div class="card food-card text-center p-5 mx-auto empty-card my-4">
          <div class="fs-1 mb-2">🍽️</div>
          <h2 class="h4 fw-bold mb-2">No orders in this category</h2>
          <p class="text-muted mb-0">
            @if (activeTab === 'all') {
              No customer orders have been received yet.
            } @else {
              No orders currently have status "{{ getStatusLabel(activeTab) }}".
            }
          </p>
        </div>
      } @else {
        <!-- Table / Cards of Orders -->
        <div class="card food-card overflow-hidden shadow-sm border-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light text-uppercase small text-secondary">
                <tr>
                  <th scope="col" class="py-3 ps-4">Order Ref</th>
                  <th scope="col" class="py-3">Client</th>
                  <th scope="col" class="py-3">Items</th>
                  <th scope="col" class="py-3">Total</th>
                  <th scope="col" class="py-3">Status</th>
                  <th scope="col" class="py-3">Date</th>
                  <th scope="col" class="py-3 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (order of filteredOrders; track order._id) {
                  <tr [class.table-warning]="order.statut === 'en_attente'">
                    <!-- ID & Restaurant -->
                    <td class="ps-4">
                      <div class="fw-bold text-dark">#{{ order._id.slice(-6).toUpperCase() }}</div>
                      <div class="small text-muted text-truncate max-w-150">
                        {{ getRestaurantName(order) }}
                      </div>
                    </td>

                    <!-- Client Info -->
                    <td>
                      <div class="fw-semibold text-dark">{{ getClientName(order) }}</div>
                      <div class="small text-muted">{{ getClientPhone(order) }}</div>
                    </td>

                    <!-- Items Summary -->
                    <td>
                      <div class="small fw-medium text-dark text-truncate max-w-200" [title]="getItemsTooltip(order)">
                        {{ getItemsSummary(order) }}
                      </div>
                      <div class="small text-muted">{{ order.articles.length }} item{{ order.articles.length > 1 ? 's' : '' }}</div>
                    </td>

                    <!-- Total -->
                    <td>
                      <span class="fw-bold text-primary">{{ order.total.toFixed(2) }} DT</span>
                    </td>

                    <!-- Status Badge -->
                    <td>
                      <span [class]="'badge rounded-pill ' + getBadgeClass(order.statut)">
                        {{ getStatusLabel(order.statut) }}
                      </span>
                    </td>

                    <!-- Date -->
                    <td>
                      <div class="small text-dark">{{ order.createdAt | date: 'dd/MM/yyyy' }}</div>
                      <div class="small text-muted">{{ order.createdAt | date: 'HH:mm' }}</div>
                    </td>

                    <!-- Action Controls -->
                    <td class="text-end pe-4">
                      <div class="d-inline-flex align-items-center gap-2">
                        <!-- Details Button -->
                        <button
                          type="button"
                          class="btn btn-outline-secondary btn-sm rounded-pill px-3"
                          (click)="openDetailsModal(order)"
                          title="View order details"
                        >
                          Details
                        </button>

                        <!-- Transition Actions -->
                        @if (order.statut === 'en_attente') {
                          <button
                            type="button"
                            class="btn btn-success btn-sm rounded-pill px-3 fw-semibold"
                            (click)="updateStatus(order, 'acceptee')"
                            [disabled]="actionLoadingId === order._id"
                            title="Accept order"
                          >
                            @if (actionLoadingId === order._id) {
                              <span class="spinner-border spinner-border-sm me-1"></span>
                            }
                            ✓ Accept
                          </button>
                          <button
                            type="button"
                            class="btn btn-outline-danger btn-sm rounded-pill px-2"
                            (click)="updateStatus(order, 'annulee')"
                            [disabled]="actionLoadingId === order._id"
                            title="Refuse / Cancel"
                          >
                            ✕ Refuse
                          </button>
                        } @else if (order.statut === 'acceptee') {
                          <button
                            type="button"
                            class="btn btn-primary btn-sm rounded-pill px-3 fw-semibold"
                            (click)="updateStatus(order, 'en_preparation')"
                            [disabled]="actionLoadingId === order._id"
                          >
                            @if (actionLoadingId === order._id) {
                              <span class="spinner-border spinner-border-sm me-1"></span>
                            }
                            👨‍🍳 Start Prep
                          </button>
                        } @else if (order.statut === 'en_preparation') {
                          <button
                            type="button"
                            class="btn btn-primary btn-sm rounded-pill px-3 fw-semibold"
                            (click)="updateStatus(order, 'en_livraison')"
                            [disabled]="actionLoadingId === order._id"
                          >
                            @if (actionLoadingId === order._id) {
                              <span class="spinner-border spinner-border-sm me-1"></span>
                            }
                            🛵 Send Delivery
                          </button>
                        } @else if (order.statut === 'en_livraison') {
                          <button
                            type="button"
                            class="btn btn-success btn-sm rounded-pill px-3 fw-semibold"
                            (click)="updateStatus(order, 'livree')"
                            [disabled]="actionLoadingId === order._id"
                          >
                            @if (actionLoadingId === order._id) {
                              <span class="spinner-border spinner-border-sm me-1"></span>
                            }
                            🎉 Mark Delivered
                          </button>
                        } @else {
                          <span class="text-muted small fst-italic">Final</span>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Order Details Modal -->
      @if (selectedOrder) {
        <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); z-index: 1060;">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content border-0 food-card overflow-hidden">
              <div class="modal-header bg-light">
                <div>
                  <h2 class="modal-title h5 fw-bold mb-0">
                    Order #{{ selectedOrder._id.slice(-6).toUpperCase() }}
                  </h2>
                  <span class="small text-muted">
                    Placed on {{ selectedOrder.createdAt | date: 'dd MMMM yyyy at HH:mm' }}
                  </span>
                </div>
                <button type="button" class="btn-close" (click)="selectedOrder = null" aria-label="Close"></button>
              </div>

              <div class="modal-body p-4">
                <div class="row g-4 mb-4">
                  <!-- Customer Info -->
                  <div class="col-md-6">
                    <div class="p-3 rounded-3 bg-light h-100">
                      <h3 class="h6 fw-bold mb-2 text-uppercase text-secondary small">Customer Information</h3>
                      <div class="fw-semibold text-dark">{{ getClientName(selectedOrder) }}</div>
                      <div class="small text-muted mb-1">📞 {{ getClientPhone(selectedOrder) }}</div>
                      <div class="small text-muted">📧 {{ getClientEmail(selectedOrder) }}</div>
                    </div>
                  </div>

                  <!-- Delivery & Notes -->
                  <div class="col-md-6">
                    <div class="p-3 rounded-3 bg-light h-100">
                      <h3 class="h6 fw-bold mb-2 text-uppercase text-secondary small">Delivery Details</h3>
                      <div class="small mb-2">
                        <strong class="d-block text-dark">Address:</strong>
                        <span class="text-muted">{{ selectedOrder.adresseLivraison }}</span>
                      </div>
                      @if (selectedOrder.remarque) {
                        <div class="small">
                          <strong class="d-block text-dark">Customer Remark:</strong>
                          <span class="fst-italic text-dark">"{{ selectedOrder.remarque }}"</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Articles Table -->
                <h3 class="h6 fw-bold mb-3 text-uppercase text-secondary small">Ordered Items</h3>
                <div class="table-responsive mb-4">
                  <table class="table table-sm align-middle">
                    <thead class="table-light">
                      <tr>
                        <th scope="col">Item</th>
                        <th scope="col" class="text-center">Quantity</th>
                        <th scope="col" class="text-end">Unit Price</th>
                        <th scope="col" class="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of selectedOrder.articles; track item.plat) {
                        <tr>
                          <td class="fw-medium text-dark">{{ item.nom }}</td>
                          <td class="text-center">{{ item.quantite }}</td>
                          <td class="text-end">{{ item.prixUnitaire.toFixed(2) }} DT</td>
                          <td class="text-end fw-semibold">
                            {{ (item.quantite * item.prixUnitaire).toFixed(2) }} DT
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Financial Breakdown -->
                <div class="d-flex flex-column align-items-end border-top pt-3">
                  <div class="d-flex justify-content-between w-50 small text-muted mb-1">
                    <span>Subtotal:</span>
                    <span>{{ selectedOrder.sousTotal.toFixed(2) }} DT</span>
                  </div>
                  <div class="d-flex justify-content-between w-50 small text-muted mb-2">
                    <span>Delivery Fee:</span>
                    <span>{{ selectedOrder.fraisLivraison.toFixed(2) }} DT</span>
                  </div>
                  <div class="d-flex justify-content-between w-50 fw-bold fs-5 text-dark border-top pt-2">
                    <span>Grand Total:</span>
                    <span class="text-primary">{{ selectedOrder.total.toFixed(2) }} DT</span>
                  </div>
                </div>
              </div>

              <div class="modal-footer bg-light justify-content-between">
                <div>
                  <span class="badge rounded-pill" [class]="getBadgeClass(selectedOrder.statut)">
                    Status: {{ getStatusLabel(selectedOrder.statut) }}
                  </span>
                </div>
                <button type="button" class="btn btn-secondary rounded-pill px-4" (click)="selectedOrder = null">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .empty-card {
      max-width: 500px;
    }
    .max-w-150 {
      max-width: 150px;
    }
    .max-w-200 {
      max-width: 200px;
    }
    .status-tabs::-webkit-scrollbar {
      height: 4px;
    }
    .status-tabs::-webkit-scrollbar-thumb {
      background: #e5e7eb;
      border-radius: 4px;
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
  `],
})
export class ManageOrdersComponent implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);

  readonly tabs: StatusTab[] = [
    { id: 'all', label: 'All' },
    { id: 'en_attente', label: 'En attente' },
    { id: 'acceptee', label: 'Acceptée' },
    { id: 'en_preparation', label: 'En préparation' },
    { id: 'en_livraison', label: 'En livraison' },
    { id: 'livree', label: 'Livrée' },
    { id: 'annulee', label: 'Annulée' },
  ];

  allOrders: Order[] = [];
  activeTab = 'all';
  loading = true;
  actionLoadingId: string | null = null;
  actionError: string | null = null;
  actionSuccess: string | null = null;
  selectedOrder: Order | null = null;

  private pollSubscription?: Subscription;

  get pendingCount(): number {
    return this.allOrders.filter((o) => o.statut === 'en_attente').length;
  }

  get filteredOrders(): Order[] {
    if (this.activeTab === 'all') {
      return this.allOrders;
    }
    return this.allOrders.filter((o) => o.statut === this.activeTab);
  }

  ngOnInit(): void {
    this.loadOrders(true);

    // Poll every 15 seconds
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
    this.orderService.getRestaurantOrders().subscribe({
      next: (orders) => {
        this.allOrders = orders;
        this.loading = false;
        // If modal is open, refresh selected order data
        if (this.selectedOrder) {
          const updated = orders.find((o) => o._id === this.selectedOrder!._id);
          if (updated) {
            this.selectedOrder = updated;
          }
        }
      },
      error: (err) => {
        console.error('Failed to load restaurant orders', err);
        this.loading = false;
      },
    });
  }

  setTab(tabId: string): void {
    this.activeTab = tabId;
  }

  getCountForTab(tabId: string): number {
    if (tabId === 'all') {
      return this.allOrders.length;
    }
    return this.allOrders.filter((o) => o.statut === tabId).length;
  }

  updateStatus(order: Order, newStatus: OrderStatus): void {
    this.actionLoadingId = order._id;
    this.actionError = null;
    this.actionSuccess = null;

    this.orderService.updateStatus(order._id, newStatus).subscribe({
      next: (updatedOrder) => {
        this.actionLoadingId = null;
        this.actionSuccess = `Order #${order._id.slice(-6).toUpperCase()} status updated to ${this.getStatusLabel(newStatus)}.`;
        // Update in-memory orders
        const idx = this.allOrders.findIndex((o) => o._id === order._id);
        if (idx !== -1) {
          this.allOrders[idx] = updatedOrder;
        }
        if (this.selectedOrder && this.selectedOrder._id === order._id) {
          this.selectedOrder = updatedOrder;
        }
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.actionError = err.error?.message || 'Failed to update order status.';
      },
    });
  }

  openDetailsModal(order: Order): void {
    this.selectedOrder = order;
  }

  getStatusLabel(status: string): string {
    return ORDER_STATUS_LABELS[status as OrderStatus] || status;
  }

  getBadgeClass(status: OrderStatus): string {
    return ORDER_STATUS_BADGES[status] || 'bg-secondary text-white';
  }

  getClientName(order: Order): string {
    if (typeof order.client === 'object' && order.client !== null) {
      const c = order.client as User;
      return `${c.prenom || ''} ${c.nom || ''}`.trim() || 'Client';
    }
    return 'Client';
  }

  getClientPhone(order: Order): string {
    if (typeof order.client === 'object' && order.client !== null) {
      return (order.client as User).telephone || 'N/A';
    }
    return 'N/A';
  }

  getClientEmail(order: Order): string {
    if (typeof order.client === 'object' && order.client !== null) {
      return (order.client as User).email || 'N/A';
    }
    return 'N/A';
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

  getItemsTooltip(order: Order): string {
    return order.articles.map((a) => `${a.nom} (${a.quantite}x ${a.prixUnitaire} DT)`).join('\n');
  }
}
