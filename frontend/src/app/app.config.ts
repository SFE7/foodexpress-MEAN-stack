/**
 * FILE: frontend/src/app/app.config.ts
 * ROLE: Angular application providers.
 * USED BY / TALKS TO: Angular bootstraps this config.
 * KEY IDEA: Dependency injection is configured here.
 */
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { refreshInterceptor } from './core/interceptors/refresh.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Router configuration supplies navigation and route guards to the app.
    provideRouter(routes),
    // HttpClient uses the JWT interceptor for API authorization.
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideHttpClient(withInterceptors([jwtInterceptor, refreshInterceptor])),

  ]
};
