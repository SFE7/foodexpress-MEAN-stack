/**
 * FILE: frontend/src/app/core/models/user.model.ts
 * ROLE: Frontend TypeScript data shape.
 * USED BY / TALKS TO: Services and components.
 * KEY IDEA: Interfaces document API response shapes.
 */
export type UserRole = 'client' | 'restaurateur' | 'admin';

export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
