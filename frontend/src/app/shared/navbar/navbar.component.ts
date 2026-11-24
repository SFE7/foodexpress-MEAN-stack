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
          <div class="navbar-nav me-auto">
            <a class="nav-link" routerLink="/restaurants" routerLinkActive="active">Restaurants</a>
            <a class="nav-link" routerLink="/cart" routerLinkActive="active">
              Cart <span class="badge rounded-pill text-bg-warning">{{ count$ | async }}</span>
            </a>
            @if ((auth.currentUser$ | async)?.role === 'client') {
              <a class="nav-link" routerLink="/my-orders" routerLinkActive="active">My Orders</a>
            }
            @if ((auth.currentUser$ | async)?.role === 'restaurateur' || (auth.currentUser$ | async)?.role === 'admin') {
              <a class="nav-link" [routerLink]="dashboardLink" routerLinkActive="active">Dashboard</a>
            }
          </div>
          <div class="navbar-nav align-items-lg-center gap-lg-2">
            @if (auth.currentUser$ | async; as user) {
              <a class="nav-link" routerLink="/profile">{{ user.prenom }} {{ user.nom }}</a>
              <button class="btn btn-outline-primary btn-sm" type="button" (click)="logout()">Logout</button>
            } @else {
              <a class="nav-link" routerLink="/login">Login</a>
              <a class="btn btn-primary btn-sm px-3" routerLink="/register">Register</a>
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
    @media (max-width: 991.98px) { .navbar-collapse { padding: .8rem 0; } }
  `],
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);
  protected readonly count$ = this.cart.count$;
  protected menuOpen = false;

  get dashboardLink(): string {
    return this.auth.getRole() === 'admin' ? '/admin/statistics' : '/restaurant-dashboard';
  }

  logout(): void {
    this.auth.logout();
    this.menuOpen = false;
    void this.router.navigateByUrl('/login');
  }
}
