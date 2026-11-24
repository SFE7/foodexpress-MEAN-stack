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
