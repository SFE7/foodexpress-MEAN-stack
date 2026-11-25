import { User } from './user.model';

export type RestaurantStatus = 'pending' | 'validated' | 'suspended';

export interface Restaurant {
  _id: string;
  nom: string;
  description: string;
  adresse: string;
  typeCuisine: string;
  image: string;
  fraisLivraison: number;
  horaires: string;
  isOpen: boolean;
  status: RestaurantStatus;
  owner: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface RestaurantQueryFilters {
  search?: string;
  typeCuisine?: string;
  isOpen?: boolean | string;
  sort?: string;
}

export interface RestaurantsResponse {
  data: Restaurant[];
  page: number;
  totalPages: number;
  total: number;
}

export interface Category {
  _id: string;
  nom: string;
  description?: string;
  restaurant?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Dish {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  image: string;
  disponible: boolean;
  categorie: string | Category | null;
  restaurant: string | Restaurant;
  createdAt?: string;
  updatedAt?: string;
}
