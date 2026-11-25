import { ChangeDetectionStrategy } from '@angular/core';
import { Component, Input, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface PortalNavItem {
  label: string;
  route: string;
  exact?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-portal-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="portal-nav card food-card px-3 py-2 mb-4">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div class="d-flex flex-wrap align-items-center gap-2">
          <span class="portal-label text-uppercase small fw-bold me-1">
            {{ area === 'admin' ? 'Admin Space' : 'Restaurateur Space' }}
          </span>
          @for (item of items; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="portal-link-active"
              [routerLinkActiveOptions]="{ exact: !!item.exact }"
              class="btn btn-sm portal-link rounded-pill px-3 fw-semibold"
            >
              {{ item.label }}
            </a>
          }
        </div>

        @if (isAdmin) {
          <div class="d-flex align-items-center gap-2">
            @if (area === 'admin') {
              <a routerLink="/restaurant-dashboard" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
                Restaurateur View
              </a>
            } @else {
              <a routerLink="/admin/statistics" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
                Admin Space
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .portal-nav {
      background: #fff;
    }
    .portal-label {
      color: var(--food-primary);
      letter-spacing: 0.06em;
      font-size: 0.72rem;
    }
    .portal-link {
      color: var(--food-text);
      background: #fff8f2;
      border: 1px solid #f3dfd2;
      transition: all 0.15s ease;
    }
    .portal-link:hover {
      background: #ffe8d9;
      color: var(--food-primary);
    }
    .portal-link-active {
      background: var(--food-primary) !important;
      color: #fff !important;
      border-color: var(--food-primary) !important;
    }
  `],
})
export class PortalNavComponent {
  private readonly auth = inject(AuthService);

  @Input() area: 'restaurateur' | 'admin' = 'restaurateur';

  get isAdmin(): boolean {
    return this.auth.getRole() === 'admin';
  }

  get items(): PortalNavItem[] {
    if (this.area === 'admin') {
      return [
        { label: 'Statistics', route: '/admin/statistics', exact: true },
        { label: 'Restaurants & Categories', route: '/admin/restaurants', exact: true },
        { label: 'Users', route: '/admin/users', exact: true },
      ];
    }
    return [
      { label: 'Dashboard', route: '/restaurant-dashboard', exact: true },
      { label: 'Manage Dishes', route: '/restaurant-dashboard/dishes', exact: true },
      { label: 'Manage Orders', route: '/restaurant-dashboard/orders', exact: true },
    ];
  }
}
