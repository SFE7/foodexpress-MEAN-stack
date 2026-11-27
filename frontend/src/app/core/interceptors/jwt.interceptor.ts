/**
 * FILE: frontend/src/app/core/interceptors/jwt.interceptor.ts
 * ROLE: Angular HTTP interceptor.
 * USED BY / TALKS TO: app.config.ts enables it.
 * KEY IDEA: Interceptors change every matching HTTP request.
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  // Relative API calls receive the token; external URLs do not need FoodExpress auth.
  if (!/(^|\/)api\//.test(request.url)) {
    return next(request);
  }

  const token = inject(AuthService).getToken();
  if (!token) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
