/**
 * FILE: frontend/src/app/pages/register/register.component.ts
 * ROLE: Angular page component.
 * USED BY / TALKS TO: app.routes.ts and templates.
 * KEY IDEA: A component connects UI bindings to TypeScript.
 */
import { ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

function matchingPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page container py-5">
      <div class="auth-card food-card card mx-auto p-4 p-md-5">
        <a class="auth-brand" routerLink="/">FoodExpress</a>
        <p class="eyebrow mt-4 mb-2">JOIN FOOD EXPRESS</p>
        <h1 class="h2 fw-bold mb-2">Create your account</h1>
        <p class="text-secondary mb-4">Sign up to order or bring your restaurant on board.</p>
        @if (errorMessage) {
          <div class="alert alert-danger" role="alert">{{ errorMessage }}</div>
        }
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="row g-3">
            <div class="col-sm-6">
              <label class="form-label" for="prenom">First name</label>
              <input class="form-control" id="prenom" formControlName="prenom" autocomplete="given-name">
              @if (form.controls.prenom.touched && form.controls.prenom.invalid) { <div class="field-error">First name is required.</div> }
            </div>
            <div class="col-sm-6">
              <label class="form-label" for="nom">Last name</label>
              <input class="form-control" id="nom" formControlName="nom" autocomplete="family-name">
              @if (form.controls.nom.touched && form.controls.nom.invalid) { <div class="field-error">Last name is required.</div> }
            </div>
            <div class="col-12">
              <label class="form-label" for="email">Email</label>
              <input class="form-control" id="email" type="email" formControlName="email" autocomplete="email">
              @if (form.controls.email.touched && form.controls.email.invalid) { <div class="field-error">Enter a valid email address.</div> }
            </div>
            <div class="col-12">
              <label class="form-label" for="telephone">Phone</label>
              <input class="form-control" id="telephone" type="tel" formControlName="telephone" autocomplete="tel">
              @if (form.controls.telephone.touched && form.controls.telephone.invalid) { <div class="field-error">Phone number is required.</div> }
            </div>
            <div class="col-12">
              <label class="form-label" for="role">I am joining as</label>
              <select class="form-select" id="role" formControlName="role">
                <option value="client">Client</option>
                <option value="restaurateur">Restaurateur</option>
              </select>
            </div>
            <div class="col-sm-6">
              <label class="form-label" for="password">Password</label>
              <input class="form-control" id="password" type="password" formControlName="password" autocomplete="new-password">
              @if (form.controls.password.touched && form.controls.password.invalid) { <div class="field-error">Use at least 8 characters.</div> }
            </div>
            <div class="col-sm-6">
              <label class="form-label" for="confirmPassword">Confirm password</label>
              <input class="form-control" id="confirmPassword" type="password" formControlName="confirmPassword" autocomplete="new-password">
              @if (form.controls.confirmPassword.touched && form.hasError('passwordMismatch')) { <div class="field-error">Passwords do not match.</div> }
            </div>
          </div>
          <button class="btn btn-primary w-100 py-2 mt-4" [disabled]="form.invalid || loading">
            {{ loading ? 'Creating account…' : 'Create account' }}
          </button>
        </form>
        <p class="text-center mt-4 mb-0">Already registered? <a routerLink="/login">Log in</a></p>
      </div>
    </section>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: grid; place-items: center; }
    .auth-card { width: min(100%, 560px); }
    .auth-brand { color: #e4572e; font-weight: 850; text-decoration: none; font-size: 1.35rem; }
    .eyebrow { color: #e4572e; font-size: .75rem; font-weight: 800; letter-spacing: .12em; }
    .field-error { color: #b42318; font-size: .8rem; margin-top: .25rem; }
  `],
})
// KEY: A component links TypeScript state to the page template.
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.required],
    role: ['client' as 'client' | 'restaurateur', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: matchingPasswords });
  protected loading = false;
  protected errorMessage = '';

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.auth.register(this.form.getRawValue()).subscribe({
      next: ({ user }) => {
        this.loading = false;
        void this.router.navigateByUrl(this.homeForRole(user.role));
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = error.error?.message ?? 'Unable to register. Please try again.';
      },
    });
  }

  private homeForRole(role: UserRole): string {
    return role === 'restaurateur' ? '/restaurant-dashboard' : '/';
  }
}
