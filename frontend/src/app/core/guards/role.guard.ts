import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

function homeForRole(role: UserRole | null): string {
  if (role === 'restaurateur') {
    return '/restaurant-dashboard';
  }
  if (role === 'admin') {
    return '/admin/statistics';
  }
  return '/';
}

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;
  const role = auth.getRole();

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  return role && allowedRoles?.includes(role)
    ? true
    : router.createUrlTree([homeForRole(role)]);
};
