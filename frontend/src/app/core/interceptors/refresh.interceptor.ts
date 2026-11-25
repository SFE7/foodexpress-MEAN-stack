import { HttpInterceptorFn } from '@angular/common/http';
import { ApplicationRef, inject } from '@angular/core';
import { finalize } from 'rxjs';

// Forces a redraw once each HTTP call has finished
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const appRef = inject(ApplicationRef);
  return next(req).pipe(finalize(() => setTimeout(() => appRef.tick())));
};
