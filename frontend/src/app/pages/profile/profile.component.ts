import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="container py-5">
      <div class="profile-card food-card card p-4 p-md-5 mx-auto">
        <p class="eyebrow mb-2">YOUR ACCOUNT</p>
        <h1 class="h2 fw-bold mb-4">Profile settings</h1>
        @if (errorMessage) { <div class="alert alert-danger">{{ errorMessage }}</div> }
        @if (successMessage) { <div class="alert alert-success">{{ successMessage }}</div> }
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="prenom">First name</label>
              <input class="form-control" id="prenom" formControlName="prenom">
            </div>
            <div class="col-md-6">
              <label class="form-label" for="nom">Last name</label>
              <input class="form-control" id="nom" formControlName="nom">
            </div>
            <div class="col-12">
              <label class="form-label" for="telephone">Phone</label>
              <input class="form-control" id="telephone" type="tel" formControlName="telephone">
            </div>
            <div class="col-12">
              <label class="form-label" for="password">New password <span class="text-secondary">(optional)</span></label>
              <input class="form-control" id="password" type="password" formControlName="password" autocomplete="new-password">
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <div class="field-error">Use at least 8 characters.</div>
              }
            </div>
          </div>
          <button class="btn btn-primary mt-4" [disabled]="form.invalid || saving">
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
        </form>
      </div>
    </section>
  `,
  styles: [`
    .profile-card { max-width: 680px; }
    .eyebrow { color: #e4572e; font-size: .75rem; font-weight: 800; letter-spacing: .12em; }
    .field-error { color: #b42318; font-size: .875rem; margin-top: .25rem; }
  `],
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  protected readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    telephone: ['', Validators.required],
    password: ['', Validators.minLength(8)],
  });
  protected errorMessage = '';
  protected successMessage = '';
  protected saving = false;

  ngOnInit(): void {
    this.auth.getMe().subscribe({
      next: (user) => this.form.patchValue({ nom: user.nom, prenom: user.prenom, telephone: user.telephone }),
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message ?? 'Unable to load your profile.';
      },
    });
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    const { password, ...details } = this.form.getRawValue();
    this.auth.updateProfile(password ? { ...details, password } : details).subscribe({
      next: (user) => {
        this.saving = false;
        this.form.patchValue({ nom: user.nom, prenom: user.prenom, telephone: user.telephone, password: '' });
        this.successMessage = 'Your profile has been updated.';
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.errorMessage = error.error?.message ?? 'Unable to save your profile.';
      },
    });
  }
}
