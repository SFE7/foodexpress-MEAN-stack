import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { CategoryService } from '../../../core/services/category.service';
import { DishService } from '../../../core/services/dish.service';
import { AuthService } from '../../../core/services/auth.service';
import { Category, Dish, Restaurant } from '../../../core/models/restaurant.model';
import { PortalNavComponent } from '../../../shared/portal-nav/portal-nav.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-manage-dishes',
  standalone: true,
  imports: [CommonModule, FormsModule, PortalNavComponent],
  template: `
    <div class="container py-4">
      <app-portal-nav area="restaurateur" />
      <!-- Page Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1">Restaurant Management</h1>
          <p class="text-muted mb-0">Manage your restaurants, menu categories, and dishes</p>
        </div>
        <button class="btn btn-outline-primary rounded-pill px-4" (click)="openCreateRestaurantModal()">
          + Add New Restaurant
        </button>
      </div>

      <!-- Alerts -->
      @if (alertMessage) {
        <div class="alert alert-dismissible fade show mb-4" [ngClass]="'alert-' + alertType" role="alert">
          {{ alertMessage }}
          <button type="button" class="btn-close" (click)="alertMessage = ''" aria-label="Close"></button>
        </div>
      }

      @if (loading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (myRestaurants.length === 0) {
        <!-- No Restaurant Form / Empty State -->
        <div class="card food-card text-center p-5">
          <div class="fs-1 mb-2">🏪</div>
          <h2 class="h4 fw-bold mb-2">No restaurant yet</h2>
          <p class="text-muted mb-4">Create your first restaurant to start adding categories and dishes.</p>
          <div>
            <button class="btn btn-primary rounded-pill px-4" (click)="openCreateRestaurantModal()">
              Create Restaurant Now
            </button>
          </div>
        </div>
      } @else {
        <!-- Restaurant Selection & Status Card -->
        <div class="card food-card p-4 mb-4">
          <div class="row g-3 align-items-center">
            <div class="col-12 col-md-6">
              <label class="form-label fw-bold">Select Active Restaurant:</label>
              <select class="form-select" [ngModel]="selectedRestaurant?._id" (ngModelChange)="onSelectRestaurant($event)">
                @for (rest of myRestaurants; track rest._id) {
                  <option [value]="rest._id">
                    {{ rest.nom }} ({{ rest.status }})
                  </option>
                }
              </select>
            </div>

            <div class="col-12 col-md-6">
              @if (selectedRestaurant) {
                <div class="d-flex flex-wrap align-items-center gap-2 pt-md-4">
                  <span class="fw-semibold">Status:</span>
                  @if (selectedRestaurant.status === 'validated') {
                    <span class="badge bg-success fs-6">Validated</span>
                  } @else if (selectedRestaurant.status === 'pending') {
                    <span class="badge bg-warning text-dark fs-6">Pending Validation</span>
                  } @else {
                    <span class="badge bg-danger fs-6">Suspended</span>
                  }

                  <span class="ms-auto">
                    <button class="btn btn-sm btn-outline-secondary me-2" (click)="openEditRestaurantModal()">
                      Edit Info
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteSelectedRestaurant()">
                      Delete
                    </button>
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Pending Validation Alert -->
          @if (selectedRestaurant?.status === 'pending') {
            <div class="alert alert-warning mt-3 mb-0 d-flex align-items-center gap-2" role="alert">
              <span>⏳</span>
              <div>
                <strong>Restaurant pending validation:</strong> Your restaurant has been submitted and is waiting for administrator approval before becoming publicly visible in browsing pages. You can still set up your menu and categories in the meantime!
              </div>
            </div>
          }
        </div>

        @if (selectedRestaurant) {
          <!-- Categories & Dishes Tabs -->
          <ul class="nav nav-pills mb-4 gap-2">
            <li class="nav-item">
              <button
                class="nav-link rounded-pill px-4 fw-semibold"
                [class.active]="activeTab === 'dishes'"
                (click)="activeTab = 'dishes'"
              >
                Dishes ({{ dishes.length }})
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link rounded-pill px-4 fw-semibold"
                [class.active]="activeTab === 'categories'"
                (click)="activeTab = 'categories'"
              >
                Categories ({{ categories.length }})
              </button>
            </li>
          </ul>

          <!-- DISHES TAB -->
          @if (activeTab === 'dishes') {
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h2 class="h4 fw-bold mb-0">Menu Dishes</h2>
              <button class="btn btn-primary rounded-pill px-3" (click)="openDishModal()">
                + Add Dish
              </button>
            </div>

            @if (dishes.length === 0) {
              <div class="card food-card text-center p-5">
                <p class="text-muted mb-3">No dishes yet for this restaurant.</p>
                <div>
                  <button class="btn btn-outline-primary rounded-pill px-4" (click)="openDishModal()">
                    Add First Dish
                  </button>
                </div>
              </div>
            } @else {
              <div class="card food-card overflow-hidden">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Dish</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Availability</th>
                        <th class="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (dish of dishes; track dish._id) {
                        <tr>
                          <td>
                            <div class="d-flex align-items-center gap-3">
                              <img
                                [src]="dish.image || defaultDishImage"
                                [alt]="dish.nom"
                                class="rounded"
                                style="width: 48px; height: 48px; object-fit: cover;"
                              />
                              <div>
                                <div class="fw-bold">{{ dish.nom }}</div>
                                <small class="text-muted text-truncate d-inline-block" style="max-width: 250px;">
                                  {{ dish.description || 'No description' }}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span class="badge bg-light text-dark border">
                              {{ getCategoryName(dish) || 'Uncategorized' }}
                            </span>
                          </td>
                          <td>
                            <span class="fw-bold text-primary">{{ dish.prix }} DT</span>
                          </td>
                          <td>
                            <div class="form-check form-switch">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                role="switch"
                                [checked]="dish.disponible"
                                (change)="toggleDishAvailability(dish)"
                              />
                              <label class="form-check-label small">
                                {{ dish.disponible ? 'Available' : 'Unavailable' }}
                              </label>
                            </div>
                          </td>
                          <td class="text-end">
                            <button class="btn btn-sm btn-outline-primary me-2" (click)="openDishModal(dish)">
                              Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" (click)="confirmDeleteDish(dish)">
                              Delete
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          }

          <!-- CATEGORIES TAB -->
          @if (activeTab === 'categories') {
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h2 class="h4 fw-bold mb-0">Menu Categories</h2>
              <button class="btn btn-primary rounded-pill px-3" (click)="openCategoryModal()">
                + Add Category
              </button>
            </div>

            @if (categories.length === 0) {
              <div class="card food-card text-center p-5">
                <p class="text-muted mb-3">No categories yet for this restaurant.</p>
                <div>
                  <button class="btn btn-outline-primary rounded-pill px-4" (click)="openCategoryModal()">
                    Add First Category
                  </button>
                </div>
              </div>
            } @else {
              <div class="card food-card overflow-hidden">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Category Name</th>
                        <th>Description</th>
                        <th class="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (cat of categories; track cat._id) {
                        <tr>
                          <td class="fw-bold">{{ cat.nom }}</td>
                          <td class="text-muted">{{ cat.description || '-' }}</td>
                          <td class="text-end">
                            <button class="btn btn-sm btn-outline-primary me-2" (click)="openCategoryModal(cat)">
                              Rename / Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" (click)="deleteCategory(cat)">
                              Delete
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          }
        }
      }
    </div>

    <!-- RESTAURANT MODAL (Create / Edit) -->
    @if (showRestaurantModal) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content food-card border-0">
            <div class="modal-header">
              <h5 class="modal-title fw-bold">
                {{ isEditingRestaurant ? 'Edit Restaurant Info' : 'Create New Restaurant' }}
              </h5>
              <button type="button" class="btn-close" (click)="showRestaurantModal = false"></button>
            </div>
            <form (ngSubmit)="saveRestaurant()">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label fw-medium">Restaurant Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="restaurantForm.nom" name="restNom" required />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Description</label>
                  <textarea class="form-control" rows="2" [(ngModel)]="restaurantForm.description" name="restDesc"></textarea>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label fw-medium">Cuisine Type</label>
                    <input type="text" class="form-control" placeholder="e.g. Italian, Tunisian, Burgers" [(ngModel)]="restaurantForm.typeCuisine" name="restCuisine" />
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-medium">Delivery Fee (DT)</label>
                    <input type="number" step="0.5" min="0" class="form-control" [(ngModel)]="restaurantForm.fraisLivraison" name="restFrais" />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Address</label>
                  <input type="text" class="form-control" placeholder="Street, City" [(ngModel)]="restaurantForm.adresse" name="restAddr" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Hours</label>
                  <input type="text" class="form-control" placeholder="e.g. 10:00 - 23:00" [(ngModel)]="restaurantForm.horaires" name="restHours" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Image URL</label>
                  <input type="url" class="form-control" placeholder="https://..." [(ngModel)]="restaurantForm.image" name="restImg" />
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" role="switch" id="isOpenModal" [(ngModel)]="restaurantForm.isOpen" name="restOpen" />
                  <label class="form-check-label fw-medium" for="isOpenModal">Restaurant is Open</label>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light" (click)="showRestaurantModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="!restaurantForm.nom?.trim()">
                  {{ isEditingRestaurant ? 'Save Changes' : 'Create Restaurant' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- DISH MODAL (Create / Edit) -->
    @if (showDishModal) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content food-card border-0">
            <div class="modal-header">
              <h5 class="modal-title fw-bold">
                {{ editingDish ? 'Edit Dish' : 'Add New Dish' }}
              </h5>
              <button type="button" class="btn-close" (click)="showDishModal = false"></button>
            </div>
            <form (ngSubmit)="saveDish()">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label fw-medium">Dish Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="dishForm.nom" name="dishNom" required />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Description</label>
                  <textarea class="form-control" rows="2" [(ngModel)]="dishForm.description" name="dishDesc"></textarea>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label fw-medium">Price (DT) *</label>
                    <input type="number" step="0.5" min="0" class="form-control" [(ngModel)]="dishForm.prix" name="dishPrix" required />
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-medium">Category</label>
                    <select class="form-select" [(ngModel)]="dishForm.categorie" name="dishCat">
                      <option [ngValue]="null">No Category</option>
                      @for (cat of categories; track cat._id) {
                        <option [value]="cat._id">{{ cat.nom }}</option>
                      }
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Image URL</label>
                  <input type="url" class="form-control" placeholder="https://..." [(ngModel)]="dishForm.image" name="dishImg" />
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" role="switch" id="isDispoModal" [(ngModel)]="dishForm.disponible" name="dishDispo" />
                  <label class="form-check-label fw-medium" for="isDispoModal">Available for order</label>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light" (click)="showDishModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="!dishForm.nom?.trim() || dishForm.prix == null || dishForm.prix < 0">
                  {{ editingDish ? 'Update Dish' : 'Add Dish' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- CATEGORY MODAL (Create / Edit) -->
    @if (showCategoryModal) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content food-card border-0">
            <div class="modal-header">
              <h5 class="modal-title fw-bold">
                {{ editingCategory ? 'Rename / Edit Category' : 'Add New Category' }}
              </h5>
              <button type="button" class="btn-close" (click)="showCategoryModal = false"></button>
            </div>
            <form (ngSubmit)="saveCategory()">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label fw-medium">Category Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="categoryForm.nom" name="catNom" required placeholder="e.g. Entrées, Plats, Desserts..." />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Description (optional)</label>
                  <input type="text" class="form-control" [(ngModel)]="categoryForm.description" name="catDesc" />
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light" (click)="showCategoryModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="!categoryForm.nom?.trim()">
                  {{ editingCategory ? 'Save Category' : 'Create Category' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .nav-pills .nav-link.active {
      background-color: var(--food-primary);
    }
  `],
})
export class ManageDishesComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);
  private readonly categoryService = inject(CategoryService);
  private readonly dishService = inject(DishService);
  protected readonly auth = inject(AuthService);

  readonly defaultDishImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  myRestaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  categories: Category[] = [];
  dishes: Dish[] = [];

  loading = true;
  activeTab: 'dishes' | 'categories' = 'dishes';

  alertMessage = '';
  alertType: 'success' | 'danger' | 'warning' = 'success';

  // Restaurant Modal State
  showRestaurantModal = false;
  isEditingRestaurant = false;
  restaurantForm: Partial<Restaurant> = {};

  // Dish Modal State
  showDishModal = false;
  editingDish: Dish | null = null;
  dishForm: Partial<Dish> = {};

  // Category Modal State
  showCategoryModal = false;
  editingCategory: Category | null = null;
  categoryForm: { nom: string; description: string } = { nom: '', description: '' };

  ngOnInit(): void {
    this.loadMyRestaurants();
  }

  loadMyRestaurants(): void {
    this.loading = true;
    this.restaurantService.getMine().subscribe({
      next: (restaurants) => {
        this.myRestaurants = restaurants;
        if (restaurants.length > 0) {
          // Keep current selection or default to first
          const currentId = this.selectedRestaurant?._id;
          const found = restaurants.find((r) => r._id === currentId);
          this.selectedRestaurant = found || restaurants[0];
          this.loadRestaurantDetails(this.selectedRestaurant._id);
        } else {
          this.selectedRestaurant = null;
          this.categories = [];
          this.dishes = [];
          this.loading = false;
        }
      },
      error: (err) => {
        this.showAlert('Failed to load restaurants: ' + (err?.error?.message || err.message), 'danger');
        this.loading = false;
      },
    });
  }

  onSelectRestaurant(restaurantId: string): void {
    const found = this.myRestaurants.find((r) => r._id === restaurantId);
    if (found) {
      this.selectedRestaurant = found;
      this.loadRestaurantDetails(found._id);
    }
  }

  loadRestaurantDetails(restaurantId: string): void {
    this.loading = true;
    this.categoryService.getCategories(restaurantId).subscribe({
      next: (cats) => (this.categories = cats),
      error: (err) => console.error('Error fetching categories', err),
    });

    this.dishService.getDishes({ restaurant: restaurantId }).subscribe({
      next: (dishes) => {
        this.dishes = dishes;
        this.loading = false;
      },
      error: (err) => {
        this.showAlert('Error fetching dishes', 'danger');
        this.loading = false;
      },
    });
  }

  // RESTAURANT MODAL HANDLERS
  openCreateRestaurantModal(): void {
    this.isEditingRestaurant = false;
    this.restaurantForm = {
      nom: '',
      description: '',
      adresse: '',
      typeCuisine: '',
      image: '',
      fraisLivraison: 0,
      horaires: '',
      isOpen: true,
    };
    this.showRestaurantModal = true;
  }

  openEditRestaurantModal(): void {
    if (!this.selectedRestaurant) return;
    this.isEditingRestaurant = true;
    this.restaurantForm = { ...this.selectedRestaurant };
    this.showRestaurantModal = true;
  }

  saveRestaurant(): void {
    if (this.isEditingRestaurant && this.selectedRestaurant) {
      this.restaurantService.update(this.selectedRestaurant._id, this.restaurantForm).subscribe({
        next: (updated) => {
          this.showAlert('Restaurant updated successfully!', 'success');
          this.showRestaurantModal = false;
          this.loadMyRestaurants();
        },
        error: (err) => this.showAlert(err?.error?.message || 'Failed to update restaurant', 'danger'),
      });
    } else {
      this.restaurantService.create(this.restaurantForm).subscribe({
        next: (created) => {
          this.showAlert('Restaurant created successfully!', 'success');
          this.showRestaurantModal = false;
          this.loadMyRestaurants();
        },
        error: (err) => this.showAlert(err?.error?.message || 'Failed to create restaurant', 'danger'),
      });
    }
  }

  deleteSelectedRestaurant(): void {
    if (!this.selectedRestaurant) return;
    if (!window.confirm(`Are you sure you want to delete "${this.selectedRestaurant.nom}"? All dishes and categories will also be deleted!`)) {
      return;
    }
    this.restaurantService.delete(this.selectedRestaurant._id).subscribe({
      next: () => {
        this.showAlert('Restaurant deleted successfully', 'success');
        this.loadMyRestaurants();
      },
      error: (err) => this.showAlert(err?.error?.message || 'Failed to delete restaurant', 'danger'),
    });
  }

  // DISH ACTIONS
  openDishModal(dish?: Dish): void {
    if (dish) {
      this.editingDish = dish;
      this.dishForm = {
        nom: dish.nom,
        description: dish.description,
        prix: dish.prix,
        image: dish.image,
        disponible: dish.disponible,
        categorie: typeof dish.categorie === 'object' && dish.categorie ? dish.categorie._id : dish.categorie,
      };
    } else {
      this.editingDish = null;
      this.dishForm = {
        nom: '',
        description: '',
        prix: 0,
        image: '',
        disponible: true,
        categorie: null,
      };
    }
    this.showDishModal = true;
  }

  saveDish(): void {
    if (!this.selectedRestaurant) return;

    if (this.editingDish) {
      this.dishService.update(this.editingDish._id, this.dishForm).subscribe({
        next: () => {
          this.showAlert('Dish updated successfully', 'success');
          this.showDishModal = false;
          this.loadRestaurantDetails(this.selectedRestaurant!._id);
        },
        error: (err) => this.showAlert(err?.error?.message || 'Failed to update dish', 'danger'),
      });
    } else {
      const payload = {
        ...this.dishForm,
        restaurant: this.selectedRestaurant._id as any,
      };
      this.dishService.create(payload).subscribe({
        next: () => {
          this.showAlert('Dish created successfully', 'success');
          this.showDishModal = false;
          this.loadRestaurantDetails(this.selectedRestaurant!._id);
        },
        error: (err) => this.showAlert(err?.error?.message || 'Failed to create dish', 'danger'),
      });
    }
  }

  toggleDishAvailability(dish: Dish): void {
    const newStatus = !dish.disponible;
    this.dishService.update(dish._id, { disponible: newStatus }).subscribe({
      next: (updated) => {
        dish.disponible = updated.disponible;
        this.showAlert(`"${dish.nom}" is now ${dish.disponible ? 'available' : 'unavailable'}`, 'success');
      },
      error: (err) => {
        dish.disponible = !newStatus; // revert
        this.showAlert(err?.error?.message || 'Failed to update availability', 'danger');
      },
    });
  }

  confirmDeleteDish(dish: Dish): void {
    if (!window.confirm(`Are you sure you want to delete "${dish.nom}"?`)) {
      return;
    }
    this.dishService.delete(dish._id).subscribe({
      next: () => {
        this.showAlert('Dish deleted successfully', 'success');
        this.loadRestaurantDetails(this.selectedRestaurant!._id);
      },
      error: (err) => this.showAlert(err?.error?.message || 'Failed to delete dish', 'danger'),
    });
  }

  // CATEGORY ACTIONS
  openCategoryModal(cat?: Category): void {
    if (cat) {
      this.editingCategory = cat;
      this.categoryForm = { nom: cat.nom, description: cat.description || '' };
    } else {
      this.editingCategory = null;
      this.categoryForm = { nom: '', description: '' };
    }
    this.showCategoryModal = true;
  }

  saveCategory(): void {
    if (!this.selectedRestaurant) return;

    if (this.editingCategory) {
      this.categoryService.update(this.editingCategory._id, this.categoryForm).subscribe({
        next: () => {
          this.showAlert('Category updated successfully', 'success');
          this.showCategoryModal = false;
          this.loadRestaurantDetails(this.selectedRestaurant!._id);
        },
        error: (err) => this.showAlert(err?.error?.message || 'Failed to update category', 'danger'),
      });
    } else {
      const payload = {
        nom: this.categoryForm.nom,
        description: this.categoryForm.description,
        restaurant: this.selectedRestaurant._id,
      };
      this.categoryService.create(payload).subscribe({
        next: () => {
          this.showAlert('Category created successfully', 'success');
          this.showCategoryModal = false;
          this.loadRestaurantDetails(this.selectedRestaurant!._id);
        },
        error: (err) => this.showAlert(err?.error?.message || 'Failed to create category', 'danger'),
      });
    }
  }

  deleteCategory(cat: Category): void {
    if (!window.confirm(`Are you sure you want to delete category "${cat.nom}"?`)) {
      return;
    }
    this.categoryService.delete(cat._id).subscribe({
      next: () => {
        this.showAlert('Category deleted successfully', 'success');
        this.loadRestaurantDetails(this.selectedRestaurant!._id);
      },
      error: (err) => {
        this.showAlert(err?.error?.message || 'Failed to delete category', 'danger');
      },
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

  private showAlert(message: string, type: 'success' | 'danger' | 'warning'): void {
    this.alertMessage = message;
    this.alertType = type;
  }
}
