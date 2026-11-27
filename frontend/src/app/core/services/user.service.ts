/**
 * FILE: frontend/src/app/core/services/user.service.ts
 * ROLE: Angular API service.
 * USED BY / TALKS TO: Components and other Angular services.
 * KEY IDEA: HTTP calls return RxJS Observables.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
// KEY: An injectable service shares API logic across components.
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getUsers(search?: string): Observable<User[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<{ users: User[] }>(this.baseUrl, { params }).pipe(
      map((res) => res.users),
    );
  }

// PATCH ${this.baseUrl}/${id}/toggle-active; Observable returns Observable<User>.
  toggleActive(id: string): Observable<User> {
    return this.http.patch<{ user: User }>(`${this.baseUrl}/${id}/toggle-active`, {}).pipe(
      map((res) => res.user),
    );
  }
}
