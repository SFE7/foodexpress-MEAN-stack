/**
 * FILE: frontend/src/app/pages/cart/cart.component.ts
 * ROLE: Angular page component.
 * USED BY / TALKS TO: app.routes.ts and templates.
 * KEY IDEA: A component connects UI bindings to TypeScript.
 */
import { ChangeDetectionStrategy } from '@angular/core';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4 py-md-5">
      @if (cart$ | async; as cart) {
        @if (cart.items.length === 0) {
          <!-- Empty Cart State -->
          <div class="card food-card text-center p-5 mx-auto empty-card">
            <div class="display-3 mb-3 text-primary"><i class="bi bi-cart3"></i></div>
            <h1 class="h3 fw-bold mb-2">Your cart is empty</h1>
            <p class="text-muted mb-4">
              Looks like you haven't added anything to your cart yet. Explore our restaurant menus to find something delicious!
            </p>
            <div>
              <a routerLink="/restaurants" class="btn btn-primary rounded-pill px-4 py-2 fw-semibold">
                Explore Restaurants
              </a>
            </div>
          </div>
        } @else {
          <!-- Active Cart View -->
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <h1 class="h2 fw-bold mb-1">Your Cart</h1>
              <p class="text-muted mb-0">
                Ordering from <strong class="text-dark">{{ cart.restaurantName || 'Restaurant' }}</strong>
              </p>
            </div>
            <button
              type="button"
              class="btn btn-outline-danger btn-sm rounded-pill px-3 align-self-start align-self-md-auto"
              (click)="clearCart()"
            >
              <i class="bi bi-trash3 me-1"></i> Clear Cart
            </button>
          </div>

          <div class="row g-4">
            <!-- Items List -->
            <div class="col-lg-8">
              <div class="card food-card overflow-hidden">
                <div class="p-3 p-md-4 border-bottom bg-light bg-opacity-50">
                  <span class="fw-semibold text-secondary small text-uppercase">Items ({{ cart.items.length }})</span>
                </div>
                <div class="p-3 p-md-4">
                  <div class="d-flex flex-column gap-3">
                    @for (item of cart.items; track item.dishId) {
                      <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between p-3 rounded-3 bg-white border border-light-subtle shadow-sm gap-3">
                        <div class="d-flex align-items-center gap-3">
                          <img
                            [src]="item.image || defaultDishImage"
                            [alt]="item.nom"
                            class="rounded-3 item-thumbnail"
                            (error)="onImageError($event)"
                          />
                          <div>
                            <h2 class="h6 fw-bold mb-1 text-dark">{{ item.nom }}</h2>
                            <span class="text-primary fw-semibold">{{ item.prix.toFixed(2) }} DT</span>
                            <span class="text-muted small"> / item</span>
                          </div>
                        </div>

                        <div class="d-flex align-items-center justify-content-between justify-content-sm-end gap-3">
                          <!-- Quantity Controls -->
                          <div class="input-group input-group-sm qty-control">
                            <button
                              class="btn btn-outline-secondary px-2"
                              type="button"
                              (click)="decreaseQty(item.dishId)"
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <span class="input-group-text bg-white px-3 fw-bold">{{ item.quantite }}</span>
                            <button
                              class="btn btn-outline-secondary px-2"
                              type="button"
                              (click)="increaseQty(item.dishId)"
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <!-- Line Total -->
                          <div class="text-end min-w-80">
                            <span class="fw-bold fs-6 text-dark">
                              {{ (item.prix * item.quantite).toFixed(2) }} DT
                            </span>
                          </div>

                          <!-- Remove Button -->
                          <button
                            type="button"
                            class="btn btn-link text-danger p-1 text-decoration-none"
                            (click)="removeItem(item.dishId)"
                            title="Remove item"
                          >
                            <i class="bi bi-x-lg"></i>
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Continue shopping link -->
              <div class="mt-3">
                <a routerLink="/restaurants" class="text-decoration-none fw-medium text-primary">
                  ← Continue shopping at other restaurants
                </a>
              </div>
            </div>

            <!-- Order Summary Sidebar -->
            <div class="col-lg-4">
              <div class="card food-card p-4 sticky-top" style="top: 90px; z-index: 10;">
                <h2 class="h5 fw-bold mb-3">Order Summary</h2>

                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Subtotal</span>
                  <span class="fw-semibold">{{ getSubTotal().toFixed(2) }} DT</span>
                </div>

                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Delivery fee</span>
                  <span class="fw-semibold">{{ getDeliveryFee().toFixed(2) }} DT</span>
                </div>

                <hr class="my-3 text-secondary opacity-25" />

                <div class="d-flex justify-content-between align-items-baseline mb-4">
                  <span class="h6 fw-bold mb-0">Total</span>
                  <span class="h4 fw-bold text-primary mb-0">{{ getTotal().toFixed(2) }} DT</span>
                </div>

                @if (clientError) {
                  <div class="alert alert-warning py-2 px-3 small rounded-3 mb-3">
                    {{ clientError }}
                  </div>
                }

                <button
                  type="button"
                  class="btn btn-primary w-100 py-2 rounded-pill fw-bold fs-6 shadow-sm checkout-btn"
                  (click)="proceedToCheckout()"
                >
                  Proceed to Checkout →
                </button>

                <p class="text-center text-muted small mt-3 mb-0">
                  <i class="bi bi-lock-fill me-1"></i> Secure checkout & server-validated pricing
                </p>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .empty-card {
      max-width: 550px;
    }
    .item-thumbnail {
      width: 64px;
      height: 64px;
      object-fit: cover;
      background: #f3f4f6;
    }
    .qty-control {
      width: 105px;
    }
    .min-w-80 {
      min-width: 80px;
    }
    .checkout-btn {
      transition: transform 0.15s ease, background-color 0.15s ease;
    }
    .checkout-btn:hover {
      transform: translateY(-1px);
    }
  `],
})
// KEY: A component links TypeScript state to the page template.
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly cart$ = this.cartService.cart$;
  readonly defaultDishImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
  clientError: string | null = null;

  increaseQty(dishId: string): void {
    this.cartService.increase(dishId);
  }

  decreaseQty(dishId: string): void {
    this.cartService.decrease(dishId);
  }

  removeItem(dishId: string): void {
    this.cartService.remove(dishId);
  }

  clearCart(): void {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clear();
    }
  }

  getSubTotal(): number {
    return this.cartService.getSubTotal();
  }

  getDeliveryFee(): number {
    return this.cartService.getDeliveryFee();
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }

  proceedToCheckout(): void {
    this.clientError = null;

    if (!this.auth.isLoggedIn()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    const role = this.auth.getRole();
    if (role && role !== 'client') {
      this.clientError = `Orders can only be placed by client accounts. You are currently logged in as ${role}.`;
      return;
    }

    void this.router.navigate(['/checkout']);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultDishImage;
  }
}
