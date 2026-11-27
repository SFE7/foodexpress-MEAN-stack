/**
 * FILE: frontend/src/app/pages/admin-dashboard/restaurants/restaurants.component.ts
 * ROLE: Angular page component.
 * USED BY / TALKS TO: app.routes.ts and templates.
 * KEY IDEA: A component connects UI bindings to TypeScript.
 */
import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { UserService } from '../../../core/services/user.service';
import { Category, Restaurant, RestaurantStatus } from '../../../core/models/restaurant.model';
import { User } from '../../../core/models/user.model';
import { PortalNavComponent } from '../../../shared/portal-nav/portal-nav.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule, PortalNavComponent],
  template: `
    <div class="container py-4">
      <app-portal-nav area="admin" />

      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1">Restaurants & Cuisine Categories</h1>
          <p class="text-muted mb-0">Validate, suspend, create, or edit restaurants and manage global cuisine categories</p>
        </div>
        <button type="button" class="btn btn-primary rounded-pill px-4 fw-semibold" (click)="openRestaurantModal()">
          + Add restaurant
        </button>
      </div>

      @if (alertMessage) {
        <div class="alert alert-dismissible fade show mb-4" [ngClass]="'alert-' + alertType" role="alert">
          {{ alertMessage }}
          <button type="button" class="btn-close" (click)="alertMessage = ''"></button>
        </div>
      }

      <!-- Restaurants Table -->
      <div class="card food-card overflow-hidden mb-5">
        <div class="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <h2 class="h5 fw-bold mb-0">All Restaurants ({{ restaurants.length }})</h2>
        </div>

        @if (loadingRestaurants) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading restaurants...</span>
            </div>
          </div>
        } @else if (restaurants.length === 0) {
          <div class="text-center p-5 text-muted">No restaurants registered yet.</div>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">Restaurant</th>
                  <th>Owner</th>
                  <th>Cuisine</th>
                  <th>Status</th>
                  <th class="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (rest of restaurants; track rest._id) {
                  <tr>
                    <td class="ps-4">
                      <div class="d-flex align-items-center gap-3">
                        <img
                          [src]="rest.image || defaultImage"
                          [alt]="rest.nom"
                          class="rounded-3 rest-thumb"
                          (error)="onImageError($event)"
                        />
                        <div>
                          <div class="fw-bold text-dark">{{ rest.nom }}</div>
                          <div class="small text-muted">{{ rest.adresse || 'No address' }}</div>
                          <div class="small text-muted">
                            Delivery: {{ rest.fraisLivraison }} DT · {{ rest.horaires || 'Hours N/A' }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="fw-medium text-dark">{{ getOwnerName(rest) }}</div>
                      <div class="small text-muted">{{ getOwnerEmail(rest) }}</div>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark border text-capitalize">
                        {{ rest.typeCuisine || 'Unspecified' }}
                      </span>
                    </td>
                    <td>
                      <span class="badge rounded-pill text-capitalize" [ngClass]="getStatusBadgeClass(rest.status)">
                        {{ rest.status }}
                      </span>
                    </td>
                    <td class="text-end pe-4">
                      <div class="d-inline-flex flex-wrap justify-content-end gap-1">
                        @if (rest.status !== 'validated') {
                          <button
                            type="button"
                            class="btn btn-sm btn-success rounded-pill px-3"
                            (click)="changeStatus(rest, 'validated')"
                            [disabled]="busyId === rest._id"
                          >
                            Validate
                          </button>
                        }
                        @if (rest.status !== 'suspended') {
                          <button
                            type="button"
                            class="btn btn-sm btn-warning rounded-pill px-3"
                            (click)="changeStatus(rest, 'suspended')"
                            [disabled]="busyId === rest._id"
                          >
                            Suspend
                          </button>
                        }
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-primary rounded-pill px-3"
                          (click)="openRestaurantModal(rest)"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-danger rounded-pill px-3"
                          (click)="deleteRestaurant(rest)"
                          [disabled]="busyId === rest._id"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Cuisine Categories Section -->
      <div class="card food-card p-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 class="h4 fw-bold mb-1">Cuisine Categories</h2>
            <p class="text-muted small mb-0">General platform categories (not tied to a specific restaurant)</p>
          </div>
          <form (ngSubmit)="addCategory()" class="d-flex gap-2 category-form">
            <input
              type="text"
              class="form-control form-control-sm rounded-pill px-3"
              placeholder="New cuisine category..."
              [(ngModel)]="newCategoryName"
              name="newCategoryName"
              required
            />
            <button
              type="submit"
              class="btn btn-primary btn-sm rounded-pill px-3 text-nowrap fw-semibold"
              [disabled]="!newCategoryName.trim() || savingCategory"
            >
              + Add
            </button>
          </form>
        </div>

        @if (loadingCategories) {
          <div class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          </div>
        } @else if (categories.length === 0) {
          <p class="text-muted mb-0">No general cuisine categories yet.</p>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (cat of categories; track cat._id) {
                  <tr>
                    <td class="fw-bold text-dark">
                      @if (editingCategoryId === cat._id) {
                        <input
                          type="text"
                          class="form-control form-control-sm"
                          [(ngModel)]="editingCategoryName"
                          [name]="'editCat_' + cat._id"
                        />
                      } @else {
                        {{ cat.nom }}
                      }
                    </td>
                    <td class="text-muted">{{ cat.description || '-' }}</td>
                    <td class="text-end">
                      @if (editingCategoryId === cat._id) {
                        <button
                          type="button"
                          class="btn btn-sm btn-success rounded-pill px-3 me-2"
                          (click)="saveCategoryRename(cat)"
                          [disabled]="!editingCategoryName.trim()"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-light rounded-pill px-3"
                          (click)="editingCategoryId = null"
                        >
                          Cancel
                        </button>
                      } @else {
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-primary rounded-pill px-3 me-2"
                          (click)="startRenameCategory(cat)"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-danger rounded-pill px-3"
                          (click)="deleteCategory(cat)"
                        >
                          Delete
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    <!-- Add / Edit Restaurant Modal -->
    @if (showRestaurantModal) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content food-card border-0">
            <div class="modal-header">
              <h2 class="modal-title h5 fw-bold mb-0">
                {{ editingRestaurant ? 'Edit Restaurant' : 'Add Restaurant' }}
              </h2>
              <button type="button" class="btn-close" (click)="showRestaurantModal = false"></button>
            </div>
            <form (ngSubmit)="saveRestaurant()">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label fw-medium">Name (nom) *</label>
                  <input type="text" class="form-control" [(ngModel)]="restaurantForm.nom" name="nom" required />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Description</label>
                  <textarea class="form-control" rows="2" [(ngModel)]="restaurantForm.description" name="description"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Address (adresse)</label>
                  <input type="text" class="form-control" [(ngModel)]="restaurantForm.adresse" name="adresse" />
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label fw-medium">Cuisine Type</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="e.g. Italien, Fast-food"
                      [(ngModel)]="restaurantForm.typeCuisine"
                      name="typeCuisine"
                    />
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-medium">Delivery Fee (DT)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      class="form-control"
                      [(ngModel)]="restaurantForm.fraisLivraison"
                      name="fraisLivraison"
                    />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Hours (horaires)</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="10:00 - 23:00"
                    [(ngModel)]="restaurantForm.horaires"
                    name="horaires"
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Image URL</label>
                  <input
                    type="url"
                    class="form-control"
                    placeholder="https://..."
                    [(ngModel)]="restaurantForm.image"
                    name="image"
                  />
                </div>
                @if (!editingRestaurant && restaurateurs.length > 0) {
                  <div class="mb-3">
                    <label class="form-label fw-medium">Owner (optional)</label>
                    <select class="form-select" [(ngModel)]="selectedOwnerId" name="owner">
                      <option value="">Assign to current admin</option>
                      @for (owner of restaurateurs; track owner._id) {
                        <option [value]="owner._id">{{ owner.prenom }} {{ owner.nom }} ({{ owner.email }})</option>
                      }
                    </select>
                  </div>
                }
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="adminRestOpen"
                    [(ngModel)]="restaurantForm.isOpen"
                    name="isOpen"
                  />
                  <label class="form-check-label fw-medium" for="adminRestOpen">Restaurant is Open</label>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light rounded-pill px-3" (click)="showRestaurantModal = false">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary rounded-pill px-4" [disabled]="!restaurantForm.nom?.trim()">
                  {{ editingRestaurant ? 'Save Changes' : 'Create Restaurant' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .rest-thumb {
      width: 56px;
      height: 56px;
      object-fit: cover;
      background: #f3f4f6;
      flex-shrink: 0;
    }
    .category-form {
      min-width: min(100%, 340px);
    }
  `],
})
// KEY: A component links TypeScript state to the page template.
export class AdminRestaurantsComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);
  private readonly categoryService = inject(CategoryService);
  private readonly userService = inject(UserService);

  readonly defaultImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80';

  restaurants: Restaurant[] = [];
  categories: Category[] = [];
  restaurateurs: User[] = [];

  loadingRestaurants = true;
  loadingCategories = true;
  busyId: string | null = null;
  savingCategory = false;

  alertMessage = '';
  alertType: 'success' | 'danger' = 'success';

  showRestaurantModal = false;
  editingRestaurant: Restaurant | null = null;
  restaurantForm: Partial<Restaurant> = {};
  selectedOwnerId = '';

  newCategoryName = '';
  editingCategoryId: string | null = null;
  editingCategoryName = '';

// Lifecycle: Angular calls ngOnInit once after initial data setup.
  ngOnInit(): void {
    this.loadRestaurants();
    this.loadCategories();
    this.loadRestaurateurs();
  }

  loadRestaurants(): void {
    this.loadingRestaurants = true;
    this.restaurantService.getAllAdmin().subscribe({
      next: (list) => {
        this.restaurants = list;
        this.loadingRestaurants = false;
      },
      error: (err) => {
        this.showAlert(err?.error?.message || 'Failed to load restaurants.', 'danger');
        this.loadingRestaurants = false;
      },
    });
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loadingCategories = false;
      },
      error: (err) => {
        this.showAlert(err?.error?.message || 'Failed to load cuisine categories.', 'danger');
        this.loadingCategories = false;
      },
    });
  }

  loadRestaurateurs(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.restaurateurs = users.filter((u) => u.role === 'restaurateur');
      },
      error: () => {
        this.restaurateurs = [];
      },
    });
  }

  openRestaurantModal(rest?: Restaurant): void {
    if (rest) {
      this.editingRestaurant = rest;
      this.restaurantForm = {
        nom: rest.nom,
        description: rest.description,
        adresse: rest.adresse,
        typeCuisine: rest.typeCuisine,
        image: rest.image,
        fraisLivraison: rest.fraisLivraison,
        horaires: rest.horaires,
        isOpen: rest.isOpen,
      };
    } else {
      this.editingRestaurant = null;
      this.selectedOwnerId = '';
      this.restaurantForm = {
        nom: '',
        description: '',
        adresse: '',
        typeCuisine: '',
        image: '',
        fraisLivraison: 3,
        horaires: '10:00 - 23:00',
        isOpen: true,
      };
    }
    this.showRestaurantModal = true;
  }

  saveRestaurant(): void {
    if (this.editingRestaurant) {
      this.restaurantService.update(this.editingRestaurant._id, this.restaurantForm).subscribe({
        next: (updated) => {
          this.showRestaurantModal = false;
          this.showAlert(`"${updated.nom}" updated.`, 'success');
          this.loadRestaurants();
        },
        error: (err) => this.showAlert(err?.error?.message || 'Failed to update restaurant.', 'danger'),
      });
    } else {
      const payload: Partial<Restaurant> = { ...this.restaurantForm };
      if (this.selectedOwnerId) {
        payload.owner = this.selectedOwnerId;
      }
      this.restaurantService.create(payload).subscribe({
        next: (created) => {
          this.showRestaurantModal = false;
          this.showAlert(`"${created.nom}" created and validated.`, 'success');
          this.loadRestaurants();
        },
        error: (err) => this.showAlert(err?.error?.message || 'Failed to create restaurant.', 'danger'),
      });
    }
  }

  changeStatus(rest: Restaurant, status: RestaurantStatus): void {
    this.busyId = rest._id;
    this.restaurantService.updateStatus(rest._id, status).subscribe({
      next: (updated) => {
        this.busyId = null;
        const idx = this.restaurants.findIndex((r) => r._id === rest._id);
        if (idx !== -1) {
          this.restaurants[idx] = updated;
        }
        this.showAlert(`"${updated.nom}" status changed to ${status}.`, 'success');
      },
      error: (err) => {
        this.busyId = null;
        this.showAlert(err?.error?.message || 'Failed to update status.', 'danger');
      },
    });
  }

  deleteRestaurant(rest: Restaurant): void {
    if (!window.confirm(`Delete "${rest.nom}" and all its dishes and categories?`)) {
      return;
    }
    this.busyId = rest._id;
    this.restaurantService.delete(rest._id).subscribe({
      next: () => {
        this.busyId = null;
        this.restaurants = this.restaurants.filter((r) => r._id !== rest._id);
        this.showAlert(`"${rest.nom}" deleted.`, 'success');
      },
      error: (err) => {
        this.busyId = null;
        this.showAlert(err?.error?.message || 'Failed to delete restaurant.', 'danger');
      },
    });
  }

  addCategory(): void {
    const nom = this.newCategoryName.trim();
    if (!nom) return;
    this.savingCategory = true;
    this.categoryService.create({ nom }).subscribe({
      next: () => {
        this.savingCategory = false;
        this.newCategoryName = '';
        this.showAlert(`Cuisine category "${nom}" added.`, 'success');
        this.loadCategories();
      },
      error: (err) => {
        this.savingCategory = false;
        this.showAlert(err?.error?.message || 'Failed to add category.', 'danger');
      },
    });
  }

  startRenameCategory(cat: Category): void {
    this.editingCategoryId = cat._id;
    this.editingCategoryName = cat.nom;
  }

  saveCategoryRename(cat: Category): void {
    const nom = this.editingCategoryName.trim();
    if (!nom) return;
    this.categoryService.update(cat._id, { nom }).subscribe({
      next: () => {
        this.editingCategoryId = null;
        this.showAlert(`Category renamed to "${nom}".`, 'success');
        this.loadCategories();
      },
      error: (err) => this.showAlert(err?.error?.message || 'Failed to rename category.', 'danger'),
    });
  }

  deleteCategory(cat: Category): void {
    if (!window.confirm(`Delete cuisine category "${cat.nom}"?`)) {
      return;
    }
    this.categoryService.delete(cat._id).subscribe({
      next: () => {
        this.showAlert(`Category "${cat.nom}" deleted.`, 'success');
        this.loadCategories();
      },
      error: (err) => this.showAlert(err?.error?.message || 'Failed to delete category.', 'danger'),
    });
  }

  getOwnerName(rest: Restaurant): string {
    if (typeof rest.owner === 'object' && rest.owner !== null) {
      return `${rest.owner.prenom || ''} ${rest.owner.nom || ''}`.trim() || 'Owner';
    }
    return 'Owner';
  }

  getOwnerEmail(rest: Restaurant): string {
    if (typeof rest.owner === 'object' && rest.owner !== null) {
      return rest.owner.email || '';
    }
    return '';
  }

  getStatusBadgeClass(status: RestaurantStatus): string {
    if (status === 'validated') return 'bg-success text-white';
    if (status === 'pending') return 'bg-warning text-dark';
    return 'bg-danger text-white';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
  }
}
