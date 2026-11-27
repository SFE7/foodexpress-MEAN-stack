/**
 * FILE: frontend/src/app/pages/checkout/checkout.component.ts
 * ROLE: Angular page component.
 * USED BY / TALKS TO: app.routes.ts and templates.
 * KEY IDEA: A component connects UI bindings to TypeScript.
 */
import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CartService, CartState } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { CreateOrderPayload } from '../../core/models/order.model';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-4 py-md-5">
      @if (cart$ | async; as cart) {
        @if (cart.items.length === 0) {
          <!-- Empty Cart Notice -->
          <div class="card food-card text-center p-5 mx-auto empty-card">
            <div class="display-3 mb-3 text-primary"><i class="bi bi-cart3"></i></div>
            <h1 class="h3 fw-bold mb-2">No items to checkout</h1>
            <p class="text-muted mb-4">Your cart is currently empty. Please select some dishes first!</p>
            <div>
              <a routerLink="/restaurants" class="btn btn-primary rounded-pill px-4 py-2 fw-semibold">
                Browse Restaurants
              </a>
            </div>
          </div>
        } @else {
          <!-- Checkout Flow -->
          <div class="mb-4">
            <a routerLink="/cart" class="text-decoration-none fw-medium text-primary small">
              ← Return to Cart
            </a>
            <h1 class="h2 fw-bold mt-2 mb-1">Checkout</h1>
            <p class="text-muted mb-0">
              Complete your delivery details for your order from <strong class="text-dark">{{ cart.restaurantName }}</strong>
            </p>
          </div>

          @if (errorMessage) {
            <div class="alert alert-danger alert-dismissible fade show rounded-3 mb-4 shadow-sm" role="alert">
              <strong>Order placement failed:</strong> {{ errorMessage }}
              <button type="button" class="btn-close" (click)="errorMessage = null" aria-label="Close"></button>
            </div>
          }

          @if (successMessage) {
            <div class="alert alert-success rounded-3 mb-4 shadow-sm p-4 text-center">
              <h2 class="h4 fw-bold mb-2"><i class="bi bi-bag-check-fill me-2"></i>{{ successMessage }}</h2>
              <p class="text-secondary mb-0">Redirecting to your orders page...</p>
            </div>
          } @else {
            <div class="row g-4">
              <!-- Checkout Form -->
              <div class="col-lg-7">
                <form [formGroup]="form" (ngSubmit)="submitOrder(cart)" novalidate>
                  <!-- 1. Delivery Address -->
                  <div class="card food-card p-4 mb-4">
                    <h2 class="h5 fw-bold mb-3 d-flex align-items-center gap-2">
                      <i class="bi bi-geo-alt-fill text-primary"></i> 1. Delivery Address
                    </h2>

                    <div class="mb-3">
                      <label for="adresseLivraison" class="form-label fw-semibold">
                        Full Address <span class="text-danger">*</span>
                      </label>
                      <textarea
                        id="adresseLivraison"
                        rows="3"
                        class="form-control"
                        placeholder="e.g. 15 Avenue Habib Bourguiba, Apt 4B, Tunis"
                        formControlName="adresseLivraison"
                        [class.is-invalid]="form.controls.adresseLivraison.touched && form.controls.adresseLivraison.invalid"
                      ></textarea>
                      @if (form.controls.adresseLivraison.touched && form.controls.adresseLivraison.invalid) {
                        <div class="invalid-feedback">
                          Please enter a valid delivery address (minimum 5 characters).
                        </div>
                      }
                      <div class="form-text text-muted">
                        Include street name, building number, and apartment/floor if applicable.
                      </div>
                    </div>

                    <!-- Remark / Note to restaurant -->
                    <div class="mb-0">
                      <label for="remarque" class="form-label fw-semibold">
                        Order Notes / Special Instructions <span class="text-muted small fw-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="remarque"
                        class="form-control"
                        placeholder="e.g. Please ring doorbell twice, no spicy sauce"
                        formControlName="remarque"
                      />
                    </div>
                  </div>

                  <!-- 2. Payment Method -->
                  <div class="card food-card p-4 mb-4">
                    <h2 class="h5 fw-bold mb-3 d-flex align-items-center gap-2">
                      <i class="bi bi-credit-card text-primary"></i> 2. Payment Method
                    </h2>

                    <div class="d-flex flex-column gap-3">
                      <!-- Cash on delivery -->
                      <label
                        class="payment-option d-flex align-items-center p-3 rounded-3 border"
                        [class.active]="form.controls.modePaiement.value === 'livraison'"
                      >
                        <input
                          type="radio"
                          class="form-check-input me-3 mt-0"
                          value="livraison"
                          formControlName="modePaiement"
                        />
                        <div class="flex-grow-1">
                          <div class="fw-bold text-dark">Cash on Delivery (Paiement à la livraison)</div>
                          <div class="text-muted small">Pay with cash when your food is delivered to your door.</div>
                        </div>
                        <span class="fs-4 text-success"><i class="bi bi-cash"></i></span>
                      </label>

                      <!-- Online payment (disabled) -->
                      <label
                        class="payment-option d-flex align-items-center p-3 rounded-3 border bg-light opacity-75 position-relative"
                        style="cursor: not-allowed;"
                      >
                        <input
                          type="radio"
                          class="form-check-input me-3 mt-0"
                          value="en_ligne"
                          disabled
                        />
                        <div class="flex-grow-1">
                          <div class="d-flex align-items-center gap-2">
                            <span class="fw-bold text-muted">Credit / Debit Card (Online Payment)</span>
                            <span class="badge bg-secondary">Coming soon</span>
                          </div>
                          <div class="text-muted small">Secure online credit card processing is under development.</div>
                        </div>
                        <span class="fs-4 opacity-50"><i class="bi bi-credit-card"></i></span>
                      </label>
                    </div>
                  </div>

                  <!-- Submit Button -->
                  <div class="d-none d-lg-block">
                    <button
                      type="submit"
                      class="btn btn-primary w-100 py-3 rounded-pill fw-bold fs-5 shadow-sm submit-btn"
                      [disabled]="submitting || form.invalid"
                    >
                      @if (submitting) {
                        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing Order...
                      } @else {
                        Confirm & Place Order ({{ getTotal().toFixed(2) }} DT)
                      }
                    </button>
                  </div>
                </form>
              </div>

              <!-- Order Summary Sidebar -->
              <div class="col-lg-5">
                <div class="card food-card p-4 sticky-top" style="top: 90px; z-index: 10;">
                  <h2 class="h5 fw-bold mb-3">Order Overview</h2>

                  <!-- Items snapshot -->
                  <div class="d-flex flex-column gap-2 mb-3 max-h-300 overflow-auto">
                    @for (item of cart.items; track item.dishId) {
                      <div class="d-flex align-items-center justify-content-between py-1 border-bottom border-light-subtle">
                        <div class="d-flex align-items-center gap-2 text-truncate">
                          <span class="badge text-bg-light border text-dark fw-bold">{{ item.quantite }}x</span>
                          <span class="small text-truncate fw-medium text-dark">{{ item.nom }}</span>
                        </div>
                        <span class="small fw-semibold text-nowrap ms-2">
                          {{ (item.prix * item.quantite).toFixed(2) }} DT
                        </span>
                      </div>
                    }
                  </div>

                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted small">Subtotal</span>
                    <span class="fw-semibold small">{{ getSubTotal().toFixed(2) }} DT</span>
                  </div>

                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted small">Delivery fee</span>
                    <span class="fw-semibold small">{{ getDeliveryFee().toFixed(2) }} DT</span>
                  </div>

                  <hr class="my-2 text-secondary opacity-25" />

                  <div class="d-flex justify-content-between align-items-baseline mb-4">
                    <span class="h6 fw-bold mb-0">Total</span>
                    <span class="h4 fw-bold text-primary mb-0">{{ getTotal().toFixed(2) }} DT</span>
                  </div>

                  <!-- Submit button for mobile -->
                  <div class="d-lg-none">
                    <button
                      type="button"
                      class="btn btn-primary w-100 py-3 rounded-pill fw-bold fs-5 shadow-sm submit-btn"
                      [disabled]="submitting || form.invalid"
                      (click)="submitOrder(cart)"
                    >
                      @if (submitting) {
                        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing...
                      } @else {
                        Confirm & Place Order ({{ getTotal().toFixed(2) }} DT)
                      }
                    </button>
                  </div>

                  <div class="mt-3 p-3 rounded-3 bg-light bg-opacity-75 small text-muted">
                    <i class="bi bi-info-circle-fill text-primary me-1"></i> Prices are verified server-side. Delivery is fulfilled directly by <strong>{{ cart.restaurantName }}</strong>.
                  </div>
                </div>
              </div>
            </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .empty-card {
      max-width: 500px;
    }
    .payment-option {
      cursor: pointer;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }
    .payment-option.active {
      border-color: var(--food-primary) !important;
      background-color: #fff8f2 !important;
    }
    .max-h-300 {
      max-height: 240px;
    }
    .submit-btn {
      transition: transform 0.15s ease, background-color 0.15s ease;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
    }
  `],
})
// KEY: A component links TypeScript state to the page template.
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly cart$ = this.cartService.cart$;
  submitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  protected readonly form = this.fb.nonNullable.group({
    adresseLivraison: ['', [Validators.required, Validators.minLength(5)]],
    remarque: [''],
    modePaiement: ['livraison', Validators.required],
  });

// Lifecycle: Angular calls ngOnInit once after initial data setup.
  ngOnInit(): void {
    // Pre-fill user details if available
    const user = this.auth.getUser();
    if (user && (user as unknown as { adresse?: string }).adresse) {
      this.form.patchValue({
        adresseLivraison: (user as unknown as { adresse: string }).adresse,
      });
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

  submitOrder(cart: CartState): void {
    // DEMO TIP: frontend totals are display-only; the server reloads prices.
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    if (!cart.restaurantId || cart.items.length === 0) {
      this.errorMessage = 'Your cart is empty or invalid.';
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    // Send ONLY IDs and quantities, never client prices
    const payload: CreateOrderPayload = {
      restaurant: cart.restaurantId,
      articles: cart.items.map((item) => ({
        plat: item.dishId,
        quantite: item.quantite,
      })),
      adresseLivraison: this.form.controls.adresseLivraison.value.trim(),
      modePaiement: this.form.controls.modePaiement.value as 'livraison' | 'en_ligne',
      remarque: this.form.controls.remarque.value.trim(),
    };

    this.orderService.createOrder(payload).subscribe({
      next: (order) => {
        this.submitting = false;
        this.cartService.clear();
        this.successMessage = `Order #${order._id.slice(-6).toUpperCase()} placed successfully!`;
        setTimeout(() => {
          void this.router.navigate(['/my-orders']);
        }, 1500);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.errorMessage = error.error?.message || 'Failed to place your order. Please try again.';
      },
    });
  }
}
