/**
 * FILE: frontend/src/app/core/services/auth.service.ts
 * ROLE: Angular API service.
 * USED BY / TALKS TO: Components and other Angular services.
 * KEY IDEA: HTTP calls return RxJS Observables.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { AuthResponse, User, UserRole } from '../models/user.model';

export interface RegisterPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  confirmPassword: string;
  role: 'client' | 'restaurateur';
}

export type ProfileUpdate = Partial<Pick<User, 'nom' | 'prenom' | 'telephone'>> & {
  password?: string;
};

const TOKEN_KEY = 'foodexpress_token';
const USER_KEY = 'foodexpress_user';

@Injectable({ providedIn: 'root' })
// KEY: An injectable service shares API logic across components.
export class AuthService {
  private readonly http = inject(HttpClient);
  // BehaviorSubject lets many components react when login or logout changes.
  private readonly userSubject = new BehaviorSubject<User | null>(this.readStoredUser());
  readonly currentUser$ = this.userSubject.asObservable();

// POST /api/auth/register; Observable returns Observable<AuthResponse>.
  register(payload: RegisterPayload): Observable<AuthResponse> {
    // POST /api/auth/register; Observable emits the new JWT and public user.
    return this.http.post<AuthResponse>('/api/auth/register', payload).pipe(
      tap((response) => this.storeSession(response)),
    );
  }

// POST /api/auth/login; Observable returns Observable<AuthResponse>.
  login(email: string, password: string): Observable<AuthResponse> {
    // DEMO TIP: login POSTs credentials and stores the JWT plus user locally.
    // POST /api/auth/login; Observable emits session data after successful login.
    return this.http.post<AuthResponse>('/api/auth/login', { email, password }).pipe(
      tap((response) => this.storeSession(response)),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
  }

// GET /api/auth/me; Observable returns Observable<User>.
  getMe(): Observable<User> {
    return this.http.get<{ user: User }>('/api/auth/me').pipe(
      map((response) => response.user),
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.userSubject.next(user);
      }),
    );
  }

// PUT /api/auth/profile; Observable returns Observable<User>.
  updateProfile(payload: ProfileUpdate): Observable<User> {
    return this.http.put<{ user: User }>('/api/auth/profile', payload).pipe(
      map((response) => response.user),
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.userSubject.next(user);
      }),
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  getRole(): UserRole | null {
    return this.getUser()?.role ?? null;
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  private readStoredUser(): User | null {
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch (error) {
      console.error('Unable to read the stored user session', error);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  }
}
