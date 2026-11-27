/**
 * FILE: frontend/src/app/core/guards/auth.guard.ts
 * ROLE: Angular route guard.
 * USED BY / TALKS TO: app.routes.ts.
 * KEY IDEA: Guards hide routes but server authorization is final.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // No token means no page; redirect to login instead of showing protected data.
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
