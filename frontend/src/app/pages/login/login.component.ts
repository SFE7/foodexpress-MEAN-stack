/**
 * FILE: frontend/src/app/pages/login/login.component.ts
 * ROLE: Angular page component.
 * USED BY / TALKS TO: app.routes.ts and templates.
 * KEY IDEA: A component connects UI bindings to TypeScript.
 */
import { ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page container py-5">
      <div class="auth-card food-card card mx-auto p-4 p-md-5">
        <a class="auth-brand" routerLink="/">FoodExpress</a>
        <p class="eyebrow mt-4 mb-2">WELCOME BACK</p>
        <h1 class="h2 fw-bold mb-2">Log in to your account</h1>
        <p class="text-secondary mb-4">Your next great meal is just a few clicks away.</p>
        @if (errorMessage) {
          <div class="alert alert-danger" role="alert">{{ errorMessage }}</div>
        }
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label class="form-label" for="email">Email</label>
          <input class="form-control mb-3" id="email" type="email" formControlName="email" autocomplete="email">
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <div class="field-error mb-2">Enter a valid email address.</div>
          }
          <label class="form-label" for="password">Password</label>
          <input class="form-control mb-4" id="password" type="password" formControlName="password" autocomplete="current-password">
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <div class="field-error mb-3">Password is required.</div>
          }
          <button class="btn btn-primary w-100 py-2" [disabled]="form.invalid || loading">
            {{ loading ? 'Signing in…' : 'Log in' }}
          </button>
        </form>
        <p class="text-center mt-4 mb-0">New to FoodExpress? <a routerLink="/register">Create an account</a></p>
      </div>
    </section>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: grid; place-items: center; }
    .auth-card { width: min(100%, 480px); }
    .auth-brand { color: #e4572e; font-weight: 850; text-decoration: none; font-size: 1.35rem; }
    .eyebrow { color: #e4572e; font-size: .75rem; font-weight: 800; letter-spacing: .12em; }
    .field-error { color: #b42318; font-size: .875rem; }
  `],
})
// KEY: A component links TypeScript state to the page template.
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected loading = false;
  protected errorMessage = '';

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: ({ user }) => {
        this.loading = false;
        void this.router.navigateByUrl(this.homeForRole(user.role));
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = error.error?.message ?? 'Unable to log in. Please try again.';
      },
    });
  }

  private homeForRole(role: UserRole): string {
    if (role === 'restaurateur') {
      return '/restaurant-dashboard';
    }
    return role === 'admin' ? '/admin/statistics' : '/';
  }
}
