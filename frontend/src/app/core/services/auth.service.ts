import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { AuthResponse, User, UserRole } from '../models/user.model';
import { environment } from '../../../environment/environment';

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
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userSubject = new BehaviorSubject<User | null>(this.readStoredUser());
  readonly currentUser$ = this.userSubject.asObservable();

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((response) => this.storeSession(response)),
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response) => this.storeSession(response)),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
  }

  getMe(): Observable<User> {
    return this.http.get<{ user: User }>(`${environment.apiUrl}/auth/me`).pipe(
      map((response) => response.user),
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.userSubject.next(user);
      }),
    );
  }

  updateProfile(payload: ProfileUpdate): Observable<User> {
    return this.http.put<{ user: User }>(`${environment.apiUrl}/auth/profile`, payload).pipe(
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
