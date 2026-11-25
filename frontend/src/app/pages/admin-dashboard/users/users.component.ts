import { ChangeDetectionStrategy } from '@angular/core';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User, UserRole } from '../../../core/models/user.model';
import { PortalNavComponent } from '../../../shared/portal-nav/portal-nav.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, PortalNavComponent],
  template: `
    <div class="container py-4">
      <app-portal-nav area="admin" />

      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1">User Management</h1>
          <p class="text-muted mb-0">Search users and activate or deactivate platform accounts</p>
        </div>

        <form (ngSubmit)="fetchUsers()" class="d-flex gap-2 search-box">
          <input
            type="text"
            class="form-control rounded-pill px-3"
            placeholder="Search by name or email..."
            [(ngModel)]="search"
            name="search"
            (ngModelChange)="onSearchInput($event)"
          />
          @if (search) {
            <button type="button" class="btn btn-outline-secondary rounded-pill px-3" (click)="clearSearch()">
              Clear
            </button>
          }
        </form>
      </div>

      @if (alertMessage) {
        <div class="alert alert-dismissible fade show mb-4" [ngClass]="'alert-' + alertType" role="alert">
          {{ alertMessage }}
          <button type="button" class="btn-close" (click)="alertMessage = ''"></button>
        </div>
      }

      @if (loading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading users...</span>
          </div>
        </div>
      } @else if (users.length === 0) {
        <div class="card food-card text-center p-5">
          <div class="fs-1 mb-2">👥</div>
          <h2 class="h5 fw-bold mb-1">No users found</h2>
          <p class="text-muted mb-0">Try another search query.</p>
        </div>
      } @else {
        <div class="card food-card overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th class="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users; track user._id) {
                  <tr>
                    <td class="ps-4">
                      <div class="fw-bold text-dark">
                        {{ user.prenom }} {{ user.nom }}
                        @if (isSelf(user)) {
                          <span class="badge bg-light text-primary border ms-1">You</span>
                        }
                      </div>
                    </td>
                    <td class="text-muted">{{ user.email }}</td>
                    <td class="text-muted">{{ user.telephone }}</td>
                    <td>
                      <span class="badge rounded-pill text-capitalize" [ngClass]="getRoleBadgeClass(user.role)">
                        {{ user.role }}
                      </span>
                    </td>
                    <td>
                      @if (user.isActive !== false) {
                        <span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle">
                          Active
                        </span>
                      } @else {
                        <span class="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle">
                          Inactive
                        </span>
                      }
                    </td>
                    <td class="text-end pe-4">
                      <button
                        type="button"
                        class="btn btn-sm rounded-pill px-3 fw-semibold"
                        [ngClass]="user.isActive !== false ? 'btn-outline-danger' : 'btn-outline-success'"
                        [disabled]="isSelf(user) || togglingId === user._id"
                        [title]="isSelf(user) ? 'You cannot deactivate your own account' : ''"
                        (click)="toggleActive(user)"
                      >
                        @if (togglingId === user._id) {
                          <span class="spinner-border spinner-border-sm me-1"></span>
                        }
                        {{ user.isActive !== false ? 'Deactivate' : 'Activate' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-box {
      min-width: min(100%, 340px);
    }
  `],
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  users: User[] = [];
  search = '';
  loading = true;
  togglingId: string | null = null;
  alertMessage = '';
  alertType: 'success' | 'danger' = 'success';

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.fetchUsers());

    this.fetchUsers();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.search = '';
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.userService.getUsers(this.search).subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        this.showAlert(err?.error?.message || 'Failed to load users.', 'danger');
        this.loading = false;
      },
    });
  }

  isSelf(user: User): boolean {
    return this.auth.getUser()?._id === user._id;
  }

  toggleActive(user: User): void {
    if (this.isSelf(user)) {
      this.showAlert('You cannot deactivate your own account.', 'danger');
      return;
    }

    const willActivate = user.isActive === false;
    const actionLabel = willActivate ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${user.prenom} ${user.nom} (${user.email})?`)) {
      return;
    }

    this.togglingId = user._id;
    this.userService.toggleActive(user._id).subscribe({
      next: (updated) => {
        this.togglingId = null;
        const idx = this.users.findIndex((u) => u._id === user._id);
        if (idx !== -1) {
          this.users[idx] = updated;
        }
        this.showAlert(
          `Account ${updated.email} is now ${updated.isActive ? 'active' : 'inactive'}.`,
          'success',
        );
      },
      error: (err) => {
        this.togglingId = null;
        this.showAlert(err?.error?.message || 'Failed to update user status.', 'danger');
      },
    });
  }

  getRoleBadgeClass(role: UserRole): string {
    if (role === 'admin') return 'bg-danger text-white';
    if (role === 'restaurateur') return 'bg-warning text-dark';
    return 'bg-info-subtle text-dark border';
  }

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
  }
}
