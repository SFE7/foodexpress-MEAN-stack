/**
 * FILE: frontend/src/app/core/interceptors/refresh.interceptor.ts
 * ROLE: Angular HTTP interceptor.
 * USED BY / TALKS TO: app.config.ts enables it.
 * KEY IDEA: Interceptors change every matching HTTP request.
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { ApplicationRef, inject } from '@angular/core';
import { finalize } from 'rxjs';

// Forces a redraw once each HTTP call has finished
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const appRef = inject(ApplicationRef);
  return next(req).pipe(finalize(() => setTimeout(() => appRef.tick())));
};
