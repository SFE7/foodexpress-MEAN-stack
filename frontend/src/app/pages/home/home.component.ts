/**
 * FILE: frontend/src/app/pages/home/home.component.ts
 * ROLE: Angular page component.
 * USED BY / TALKS TO: app.routes.ts and templates.
 * KEY IDEA: A component connects UI bindings to TypeScript.
 */
import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Restaurant } from '../../core/models/restaurant.model';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="hero-section text-center py-4 py-md-5">
      <div class="container py-3 py-md-4">
        <h1 class="display-5 display-md-4 fw-bold text-dark mb-3">
          Craving something <span class="highlight">delicious</span>?
        </h1>
        <p class="lead text-muted mb-4 mx-auto" style="max-width: 600px;">
          Explore the best restaurants in your town, freshly prepared meals, and fast delivery right to your door.
        </p>
        <form (ngSubmit)="searchRestaurants()" class="search-form mx-auto d-flex flex-column flex-sm-row gap-2">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            name="searchQuery"
            class="form-control form-control-lg rounded-pill px-4 shadow-sm"
            placeholder="Search for restaurants, dishes, or flavors..."
          />
          <button type="submit" class="btn btn-primary btn-lg rounded-pill px-4 fw-semibold shadow-sm text-nowrap">Search</button>
        </form>
      </div>
    </section>

    @if (cuisines().length > 0) {
      <section class="container my-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h4 fw-bold mb-0">Explore by Cuisine</h2>
          <a routerLink="/restaurants" class="text-decoration-none fw-semibold">View all</a>
        </div>
        <div class="d-flex gap-2 overflow-auto pb-2 cuisine-scroll">
          @for (cuisine of cuisines(); track cuisine) {
            <button
              type="button"
              (click)="filterByCuisine(cuisine)"
              class="btn btn-light rounded-pill px-4 py-2 text-nowrap cuisine-chip fw-medium border shadow-xs"
            >
              <i class="bi bi-fork-knife me-1"></i> {{ cuisine }}
            </button>
          }
        </div>
      </section>
    }

    <section class="container my-5">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h2 class="h3 fw-bold mb-1">Popular Restaurants</h2>
          <p class="text-muted mb-0">Top-rated spots ready to take your order</p>
        </div>
        <a routerLink="/restaurants" class="btn btn-outline-primary btn-sm rounded-pill px-3">Browse All</a>
      </div>

      @if (loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (popularRestaurants().length === 0) {
        <div class="card food-card text-center p-5">
          <p class="text-muted fs-5 mb-0">No restaurants available right now. Check back soon!</p>
        </div>
      } @else {
        <div class="row g-4">
          @for (restaurant of popularRestaurants(); track restaurant._id) {
            <div class="col-12 col-md-6 col-lg-4">
              <div class="card food-card h-100 overflow-hidden d-flex flex-column">
                <div class="position-relative">
                  <img
                    [src]="restaurant.image || defaultImage"
                    [alt]="restaurant.nom"
                    class="card-img-top restaurant-img"
                    (error)="onImageError($event)"
                  />
                  <div class="position-absolute top-0 end-0 m-3">
                    @if (restaurant.isOpen) {
                      <span class="badge bg-success shadow-sm">Open</span>
                    } @else {
                      <span class="badge bg-secondary shadow-sm">Closed</span>
                    }
                  </div>
                  @if (restaurant.typeCuisine) {
                    <div class="position-absolute bottom-0 start-0 m-3">
                      <span class="badge bg-dark bg-opacity-75 shadow-sm text-capitalize">{{ restaurant.typeCuisine }}</span>
                    </div>
                  }
                </div>
                <div class="card-body p-4 d-flex flex-column">
                  <h3 class="h5 fw-bold mb-2">{{ restaurant.nom }}</h3>
                  <p class="text-muted small mb-2 text-truncate-2">
                    {{ restaurant.description || 'Delicious meals prepared fresh upon order.' }}
                  </p>
                  <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <div>
                      <span class="text-muted small d-block">Delivery Fee</span>
                      <strong class="text-primary">{{ restaurant.fraisLivraison }} DT</strong>
                    </div>
                    <a [routerLink]="['/restaurants', restaurant._id]" class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-medium">
                      View Menu
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .hero-section { background: linear-gradient(180deg, #fff2e5 0%, #fff8f2 100%); border-radius: 0 0 32px 32px; }
    .highlight { color: var(--food-primary); }
    .search-form { max-width: 600px; }
    .restaurant-img { height: 200px; object-fit: cover; background: #f3f4f6; }
    .text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .cuisine-chip:hover { background: var(--food-accent); color: #1f2937; border-color: var(--food-accent) !important; }
    .cuisine-scroll::-webkit-scrollbar { height: 4px; }
    .cuisine-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
  `],
})
// KEY: A component links TypeScript state to the page template.
export class HomeComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);
  private readonly router = inject(Router);

  readonly defaultImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80';
  searchQuery = '';
  cuisines = signal<string[]>([]);
  popularRestaurants = signal<Restaurant[]>([]);
  loading = signal(true);

// Lifecycle: Angular calls ngOnInit once after initial data setup.
  ngOnInit(): void {
    this.loadCuisines();
    this.loadPopularRestaurants();
  }

  loadCuisines(): void {
    this.restaurantService.getCuisines().subscribe({
      next: (data) => this.cuisines.set(data),
      error: (err) => console.error('Error fetching cuisines', err),
    });
  }

  loadPopularRestaurants(): void {
    this.loading.set(true);
    this.restaurantService.getRestaurants(undefined, 1, 6).subscribe({
      next: (res) => {
        console.log('restaurants received', res);
        this.popularRestaurants.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching popular restaurants', err);
        this.loading.set(false);
      },
    });
  }

  searchRestaurants(): void {
    const q = this.searchQuery.trim();
    void this.router.navigate(['/restaurants'], q ? { queryParams: { search: q } } : {});
  }

  filterByCuisine(cuisine: string): void {
    void this.router.navigate(['/restaurants'], { queryParams: { typeCuisine: cuisine } });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
