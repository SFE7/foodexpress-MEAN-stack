/**
 * FILE: frontend/src/app/core/guards/role.guard.ts
 * ROLE: Angular route guard.
 * USED BY / TALKS TO: app.routes.ts.
 * KEY IDEA: Guards hide routes but server authorization is final.
 */
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
  // Route data declares which roles may activate this page.
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;
  const role = auth.getRole();
  // DEMO TIP: explain guard hiding, but stress the backend role check is mandatory.

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  return role && allowedRoles?.includes(role)
    ? true
    : router.createUrlTree([homeForRole(role)]);
};
