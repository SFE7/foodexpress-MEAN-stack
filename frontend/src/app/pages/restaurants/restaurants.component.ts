import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Restaurant } from '../../core/models/restaurant.model';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <!-- Title & Filters Bar -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1">Restaurants</h1>
          <p class="text-muted mb-0">Discover places to eat with top taste and fast delivery</p>
        </div>
      </div>

      <!-- Filter Controls Card -->
      <div class="card food-card p-3 p-md-4 mb-4">
        <div class="row g-3 align-items-center">
          <!-- Search input -->
          <div class="col-12 col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">🔍</span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search by restaurant name..."
                [(ngModel)]="search"
                (ngModelChange)="onFilterChange()"
              />
            </div>
          </div>

          <!-- Cuisine dropdown -->
          <div class="col-12 col-sm-6 col-md-3">
            <select class="form-select" [(ngModel)]="typeCuisine" (ngModelChange)="onFilterChange()">
              <option value="">All Cuisines</option>
              @for (c of cuisines; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>

          <!-- Open only toggle -->
          <div class="col-6 col-sm-3 col-md-2">
            <div class="form-check form-switch pt-1">
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="isOpenToggle"
                [(ngModel)]="isOpenOnly"
                (ngModelChange)="onFilterChange()"
              />
              <label class="form-check-label fw-medium ms-1" for="isOpenToggle">Open only</label>
            </div>
          </div>

          <!-- Sort -->
          <div class="col-6 col-sm-3 col-md-3">
            <select class="form-select" [(ngModel)]="sort" (ngModelChange)="onFilterChange()">
              <option value="alpha">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (restaurants.length === 0) {
        <!-- Empty State -->
        <div class="card food-card text-center p-5 my-4">
          <div class="fs-1 mb-2">🍽️</div>
          <h2 class="h4 fw-bold mb-2">No restaurants found</h2>
          <p class="text-muted mb-4">Try clearing some filters or searching for something else.</p>
          <div>
            <button class="btn btn-outline-primary rounded-pill px-4" (click)="resetFilters()">
              Clear Filters
            </button>
          </div>
        </div>
      } @else {
        <!-- Restaurant Cards Grid -->
        <div class="row g-4 mb-5">
          @for (restaurant of restaurants; track restaurant._id) {
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
                      <span class="badge bg-dark bg-opacity-75 shadow-sm text-capitalize">
                        {{ restaurant.typeCuisine }}
                      </span>
                    </div>
                  }
                </div>

                <div class="card-body p-4 d-flex flex-column">
                  <h2 class="h5 fw-bold mb-2">{{ restaurant.nom }}</h2>
                  <p class="text-muted small mb-2 text-truncate-2">
                    {{ restaurant.description || 'Quality food and fast delivery.' }}
                  </p>

                  <div class="small text-muted mb-3">
                    @if (restaurant.adresse) {
                      <div class="text-truncate mb-1">📍 {{ restaurant.adresse }}</div>
                    }
                    @if (restaurant.horaires) {
                      <div class="text-truncate">🕒 {{ restaurant.horaires }}</div>
                    }
                  </div>

                  <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <div>
                      <span class="text-muted small d-block">Delivery Fee</span>
                      <strong class="text-primary">{{ restaurant.fraisLivraison }} DT</strong>
                    </div>
                    <a [routerLink]="['/restaurants', restaurant._id]" class="btn btn-primary btn-sm rounded-pill px-3 fw-medium">
                      View Menu
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination Controls -->
        @if (totalPages > 1) {
          <div class="d-flex justify-content-center align-items-center gap-2 mb-5">
            <button
              class="btn btn-outline-secondary btn-sm px-3 rounded-pill"
              [disabled]="page <= 1"
              (click)="changePage(page - 1)"
            >
              Previous
            </button>
            <span class="text-muted small px-2">Page {{ page }} of {{ totalPages }} ({{ total }} total)</span>
            <button
              class="btn btn-outline-secondary btn-sm px-3 rounded-pill"
              [disabled]="page >= totalPages"
              (click)="changePage(page + 1)"
            >
              Next
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .restaurant-img {
      height: 190px;
      object-fit: cover;
      background: #f3f4f6;
    }
    .text-truncate-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class RestaurantsComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly defaultImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80';

  restaurants: Restaurant[] = [];
  cuisines: string[] = [];
  loading = true;

  search = '';
  typeCuisine = '';
  isOpenOnly = false;
  sort = 'alpha';
  page = 1;
  limit = 12;
  totalPages = 1;
  total = 0;

  ngOnInit(): void {
    this.restaurantService.getCuisines().subscribe({
      next: (c) => (this.cuisines = c),
    });

    this.route.queryParams.subscribe((params) => {
      this.search = params['search'] || '';
      this.typeCuisine = params['typeCuisine'] || '';
      this.isOpenOnly = params['isOpen'] === 'true';
      this.sort = params['sort'] || 'alpha';
      this.page = parseInt(params['page'], 10) || 1;
      this.fetchRestaurants();
    });
  }

  fetchRestaurants(): void {
    this.loading = true;
    this.restaurantService
      .getRestaurants(
        {
          search: this.search,
          typeCuisine: this.typeCuisine,
          isOpen: this.isOpenOnly ? true : undefined,
          sort: this.sort,
        },
        this.page,
        this.limit
      )
      .subscribe({
        next: (res) => {
          this.restaurants = res.data;
          this.page = res.page;
          this.totalPages = res.totalPages;
          this.total = res.total;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load restaurants', err);
          this.loading = false;
        },
      });
  }

  onFilterChange(): void {
    this.page = 1;
    this.syncUrlParams();
  }

  changePage(newPage: number): void {
    this.page = newPage;
    this.syncUrlParams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetFilters(): void {
    this.search = '';
    this.typeCuisine = '';
    this.isOpenOnly = false;
    this.sort = 'alpha';
    this.page = 1;
    this.syncUrlParams();
  }

  syncUrlParams(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.search || null,
        typeCuisine: this.typeCuisine || null,
        isOpen: this.isOpenOnly ? 'true' : null,
        sort: this.sort !== 'alpha' ? this.sort : null,
        page: this.page > 1 ? this.page : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
