import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg food-navbar">
      <div class="container">
        <a class="navbar-brand food-brand" routerLink="/">Food<span>Express</span></a>
        <button class="navbar-toggler" type="button" aria-label="Toggle navigation"
          (click)="menuOpen = !menuOpen" [attr.aria-expanded]="menuOpen">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" [class.show]="menuOpen">
          <div class="navbar-nav me-auto align-items-lg-center">
            <a class="nav-link" routerLink="/restaurants" routerLinkActive="active" (click)="menuOpen = false">Explore Restaurants</a>
            
            <a class="nav-link" routerLink="/cart" routerLinkActive="active" (click)="menuOpen = false">
              Cart <span class="badge rounded-pill text-bg-warning">{{ count$ | async }}</span>
            </a>

            @if ((auth.currentUser$ | async)?.role === 'client') {
              <a class="nav-link" routerLink="/my-orders" routerLinkActive="active" (click)="menuOpen = false">My Orders</a>
            }

            @if ((auth.currentUser$ | async)?.role === 'restaurateur' || (auth.currentUser$ | async)?.role === 'admin') {
              <div class="nav-item dropdown d-none d-lg-block">
                <a class="nav-link dropdown-toggle fw-semibold text-primary" href="#" role="button" (click)="$event.preventDefault(); dashboardDropdownOpen = !dashboardDropdownOpen">
                  Restaurateur Space
                </a>
                <ul class="dropdown-menu shadow-sm border-0" [class.show]="dashboardDropdownOpen">
                  <li><a class="dropdown-item py-2" routerLink="/restaurant-dashboard/dishes" (click)="closeMenus()">🍽️ Manage Menu & Restaurant</a></li>
                  <li><a class="dropdown-item py-2" routerLink="/restaurant-dashboard/orders" (click)="closeMenus()">📦 Orders Overview</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item py-2" routerLink="/restaurant-dashboard" (click)="closeMenus()">📊 Dashboard Home</a></li>
                </ul>
              </div>

              <!-- Mobile-friendly links for restaurateur -->
              <div class="d-lg-none border-top my-2 pt-2">
                <span class="text-muted small px-3 fw-bold d-block">RESTAURATEUR SPACE</span>
                <a class="nav-link" routerLink="/restaurant-dashboard/dishes" routerLinkActive="active" (click)="menuOpen = false">🍽️ Manage Menu & Restaurant</a>
                <a class="nav-link" routerLink="/restaurant-dashboard/orders" routerLinkActive="active" (click)="menuOpen = false">📦 Orders Overview</a>
              </div>
            }

            @if ((auth.currentUser$ | async)?.role === 'admin') {
              <a class="nav-link text-danger" routerLink="/admin/restaurants" routerLinkActive="active" (click)="menuOpen = false">
                Admin Panel
              </a>
            }
          </div>

          <div class="navbar-nav align-items-lg-center gap-lg-2">
            @if (auth.currentUser$ | async; as user) {
              <span class="badge bg-light text-dark border text-capitalize py-2 px-3 d-none d-lg-inline-block">
                {{ user.role }}
              </span>
              <a class="nav-link fw-semibold" routerLink="/profile" (click)="menuOpen = false">{{ user.prenom }} {{ user.nom }}</a>
              <button class="btn btn-outline-primary btn-sm rounded-pill px-3" type="button" (click)="logout()">Logout</button>
            } @else {
              <a class="nav-link" routerLink="/login" (click)="menuOpen = false">Login</a>
              <a class="btn btn-primary btn-sm px-3 rounded-pill" routerLink="/register" (click)="menuOpen = false">Register</a>
            }
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .food-navbar { background: #fff; box-shadow: 0 2px 18px rgb(31 41 55 / 6%); }
    .food-brand { color: #1f2937; font-weight: 850; letter-spacing: -.05em; font-size: 1.45rem; }
    .food-brand span { color: #e4572e; }
    .nav-link { font-weight: 550; }
    .dropdown-menu { border-radius: 12px; min-width: 230px; }
    @media (max-width: 991.98px) { .navbar-collapse { padding: .8rem 0; } }
  `],
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);
  protected readonly count$ = this.cart.count$;
  protected menuOpen = false;
  protected dashboardDropdownOpen = false;

  closeMenus(): void {
    this.menuOpen = false;
    this.dashboardDropdownOpen = false;
  }

  logout(): void {
    this.auth.logout();
    this.closeMenus();
    void this.router.navigateByUrl('/login');
  }
}
