/**
 * FILE: frontend/src/app/pages/restaurant-details/restaurant-details.component.ts
 * ROLE: Angular page component.
 * USED BY / TALKS TO: app.routes.ts and templates.
 * KEY IDEA: A component connects UI bindings to TypeScript.
 */
import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant.service';
import { CategoryService } from '../../core/services/category.service';
import { DishService } from '../../core/services/dish.service';
import { CartService } from '../../core/services/cart.service';
import { Category, Dish, Restaurant } from '../../core/models/restaurant.model';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (loading) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    } @else if (errorMsg || !restaurant) {
      <div class="container py-5">
        <div class="card food-card text-center p-5">
          <div class="fs-1 mb-2 text-warning"><i class="bi bi-exclamation-triangle-fill"></i></div>
          <h2 class="h4 fw-bold mb-2">{{ errorMsg || 'Restaurant not found' }}</h2>
          <p class="text-muted mb-4">The restaurant you are looking for may not be validated or is unavailable.</p>
          <div>
            <a routerLink="/restaurants" class="btn btn-primary rounded-pill px-4">Back to Restaurants</a>
          </div>
        </div>
      </div>
    } @else {
      <!-- Restaurant Header Banner -->
      <section class="restaurant-banner position-relative">
        <div class="container py-4">
          <div class="card food-card overflow-hidden">
            <div class="row g-0">
              <div class="col-md-5">
                <img
                  [src]="restaurant.image || defaultBannerImage"
                  [alt]="restaurant.nom"
                  class="img-fluid h-100 w-100 header-img"
                  (error)="onImageError($event)"
                />
              </div>
              <div class="col-md-7 p-4 p-lg-5 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <h1 class="h2 fw-bold text-dark mb-0">{{ restaurant.nom }}</h1>
                    @if (restaurant.isOpen) {
                      <span class="badge bg-success">Open</span>
                    } @else {
                      <span class="badge bg-secondary">Closed</span>
                    }
                    @if (restaurant.typeCuisine) {
                      <span class="badge bg-warning text-dark text-capitalize">{{ restaurant.typeCuisine }}</span>
                    }
                  </div>

                  <p class="text-muted mb-3">
                    {{ restaurant.description || 'Welcome! Discover our delicious dishes prepared carefully for you.' }}
                  </p>

                  <div class="small text-muted mb-3 d-flex flex-column gap-1">
                    @if (restaurant.adresse) {
                      <div><i class="bi bi-geo-alt-fill text-primary me-1"></i> <strong>Address:</strong> {{ restaurant.adresse }}</div>
                    }
                    @if (restaurant.horaires) {
                      <div><i class="bi bi-clock text-primary me-1"></i> <strong>Hours:</strong> {{ restaurant.horaires }}</div>
                    }
                    <div>
                      <i class="bi bi-scooter text-primary me-1"></i> <strong>Delivery Fee:</strong>
                      <span class="text-primary fw-semibold">{{ restaurant.fraisLivraison }} DT</span>
                    </div>
                  </div>
                </div>

                <!-- Closed Notice -->
                @if (!restaurant.isOpen) {
                  <div class="alert alert-warning mb-0 py-2 px-3 small rounded-3" role="alert">
                    <i class="bi bi-info-circle-fill me-1"></i> This restaurant is currently closed. You can still browse the menu, but ordering is disabled.
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Tabs & Dishes Section -->
      <section class="container my-4" [class.pb-5]="cartCount > 0">
        <!-- Category Tabs/Chips -->
        <div class="d-flex gap-2 overflow-auto pb-3 mb-4 category-tabs">
          <button
            type="button"
            class="btn rounded-pill px-4 fw-medium text-nowrap"
            [ngClass]="selectedCategoryId === null ? 'btn-primary shadow-sm' : 'btn-light border'"
            (click)="selectCategory(null)"
          >
            All Dishes ({{ dishes.length }})
          </button>
          @for (cat of categories; track cat._id) {
            <button
              type="button"
              class="btn rounded-pill px-4 fw-medium text-nowrap"
              [ngClass]="selectedCategoryId === cat._id ? 'btn-primary shadow-sm' : 'btn-light border'"
              (click)="selectCategory(cat._id)"
            >
              {{ cat.nom }}
            </button>
          }
        </div>

        <!-- Dishes Grid -->
        @if (filteredDishes.length === 0) {
          <div class="card food-card text-center p-5 my-4">
            <p class="text-muted fs-5 mb-0">No dishes available in this category.</p>
          </div>
        } @else {
          <div class="row g-4 mb-5">
            @for (dish of filteredDishes; track dish._id) {
              <div class="col-12 col-md-6 col-lg-4">
                <div class="card food-card h-100 overflow-hidden d-flex flex-column">
                  <div class="position-relative">
                    <img
                      [src]="dish.image || defaultDishImage"
                      [alt]="dish.nom"
                      class="card-img-top dish-img"
                      (error)="onDishImageError($event)"
                    />
                    @if (!dish.disponible) {
                      <div class="position-absolute top-0 end-0 m-3">
                        <span class="badge bg-danger shadow-sm">Unavailable</span>
                      </div>
                    }
                    @if (getCategoryName(dish)) {
                      <div class="position-absolute bottom-0 start-0 m-3">
                        <span class="badge bg-dark bg-opacity-75 shadow-sm">
                          {{ getCategoryName(dish) }}
                        </span>
                      </div>
                    }
                  </div>

                  <div class="card-body p-4 d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <h3 class="h5 fw-bold mb-0">{{ dish.nom }}</h3>
                      <span class="fs-5 fw-bold text-primary text-nowrap">{{ dish.prix }} DT</span>
                    </div>

                    <p class="text-muted small mb-3 text-truncate-2">
                      {{ dish.description || 'Delicious meal freshly prepared upon order.' }}
                    </p>

                    <div class="mt-auto pt-3 border-top">
                      @if (!dish.disponible) {
                        <button class="btn btn-secondary w-100 rounded-pill py-2 fw-medium" disabled>
                          Unavailable
                        </button>
                      } @else if (!restaurant.isOpen) {
                        <button class="btn btn-outline-secondary w-100 rounded-pill py-2 fw-medium" disabled>
                          Restaurant Closed
                        </button>
                      } @else {
                        <button
                          class="btn btn-primary w-100 rounded-pill py-2 fw-medium shadow-sm"
                          (click)="addToCart(dish)"
                        >
                          + Add to Cart
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- Small Floating Cart Summary linking to /cart -->
      @if (cartCount > 0) {
        <div class="floating-cart-bar shadow-lg">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="d-flex align-items-center gap-2 gap-sm-3">
              <span class="fs-4 text-white"><i class="bi bi-cart3"></i></span>
              <div>
                <strong class="d-block text-white">{{ cartCount }} item{{ cartCount > 1 ? 's' : '' }} in Cart</strong>
                <small class="text-white-50">Total: {{ cartTotal }} DT</small>
              </div>
            </div>
            <a routerLink="/cart" class="btn btn-light rounded-pill px-3 px-sm-4 fw-bold text-nowrap ms-auto">
              View Cart & Checkout →
            </a>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .header-img {
      min-height: 200px;
      max-height: 340px;
      object-fit: cover;
      background: #f3f4f6;
    }
    @media (max-width: 767.98px) {
      .header-img {
        max-height: 230px;
      }
      .floating-cart-bar {
        width: calc(100% - 24px);
        bottom: 12px;
        padding: 12px 16px;
        border-radius: 20px;
      }
    }
    .dish-img {
      height: 180px;
      object-fit: cover;
      background: #f3f4f6;
    }
    .text-truncate-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .category-tabs::-webkit-scrollbar {
      height: 4px;
    }
    .category-tabs::-webkit-scrollbar-thumb {
      background: #e5e7eb;
      border-radius: 4px;
    }
    .floating-cart-bar {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 40px);
      max-width: 700px;
      background: #1f2937;
      color: #fff;
      padding: 14px 20px;
      border-radius: 50px;
      z-index: 1050;
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { transform: translate(-50%, 100px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
  `],
})
// KEY: A component links TypeScript state to the page template.
export class RestaurantDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly restaurantService = inject(RestaurantService);
  private readonly categoryService = inject(CategoryService);
  private readonly dishService = inject(DishService);
  private readonly cartService = inject(CartService);

  readonly defaultBannerImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
  readonly defaultDishImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  restaurant: Restaurant | null = null;
  categories: Category[] = [];
  dishes: Dish[] = [];
  selectedCategoryId: string | null = null;

  loading = true;
  errorMsg = '';

  cartCount = 0;
  cartTotal = 0;

// Lifecycle: Angular calls ngOnInit once after initial data setup.
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMsg = 'Invalid restaurant ID';
      this.loading = false;
      return;
    }

    this.loadRestaurantData(id);

    this.cartService.cart$.subscribe((state) => {
      this.cartCount = state.items.reduce((acc, it) => acc + it.quantite, 0);
      this.cartTotal = this.cartService.getTotal();
    });
  }

  loadRestaurantData(id: string): void {
    this.loading = true;
    this.restaurantService.getById(id).subscribe({
      next: (rest) => {
        this.restaurant = rest;
        // Load categories for this restaurant
        this.categoryService.getCategories(id).subscribe({
          next: (cats) => (this.categories = cats),
          error: (err) => console.error('Error fetching categories', err),
        });

        // Load dishes for this restaurant
        this.dishService.getDishes({ restaurant: id }).subscribe({
          next: (dishes) => {
            this.dishes = dishes;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error fetching dishes', err),
            this.loading = false;
          },
        });
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to load restaurant details';
        this.loading = false;
      },
    });
  }

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId = categoryId;
  }

  get filteredDishes(): Dish[] {
    if (!this.selectedCategoryId) {
      return this.dishes;
    }
    return this.dishes.filter((dish) => {
      if (!dish.categorie) return false;
      if (typeof dish.categorie === 'string') {
        return dish.categorie === this.selectedCategoryId;
      }
      return dish.categorie._id === this.selectedCategoryId;
    });
  }

  getCategoryName(dish: Dish): string {
    if (!dish.categorie) return '';
    if (typeof dish.categorie === 'object' && dish.categorie.nom) {
      return dish.categorie.nom;
    }
    const cat = this.categories.find((c) => c._id === dish.categorie);
    return cat ? cat.nom : '';
  }

  addToCart(dish: Dish): void {
    if (!this.restaurant) return;
    this.cartService.addItem(
      {
        _id: dish._id,
        nom: dish.nom,
        prix: dish.prix,
        image: dish.image,
        disponible: dish.disponible,
      },
      {
        _id: this.restaurant._id,
        nom: this.restaurant.nom,
        fraisLivraison: this.restaurant.fraisLivraison,
      }
    );
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultBannerImage;
  }

  onDishImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultDishImage;
  }
}
