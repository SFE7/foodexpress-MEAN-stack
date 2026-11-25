import { Dish, Restaurant } from './restaurant.model';
import { User } from './user.model';

export type OrderStatus =
  | 'en_attente'
  | 'acceptee'
  | 'en_preparation'
  | 'en_livraison'
  | 'livree'
  | 'annulee';

export type PaymentMethod = 'livraison' | 'en_ligne';

export interface OrderArticle {
  plat: string | Dish;
  nom: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Order {
  _id: string;
  client: string | User;
  restaurant: string | Restaurant;
  articles: OrderArticle[];
  adresseLivraison: string;
  sousTotal: number;
  fraisLivraison: number;
  total: number;
  modePaiement: PaymentMethod;
  statut: OrderStatus;
  remarque?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderArticlePayload {
  plat: string;
  quantite: number;
}

export interface CreateOrderPayload {
  restaurant: string;
  articles: CreateOrderArticlePayload[];
  adresseLivraison: string;
  modePaiement?: PaymentMethod;
  remarque?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: 'En attente',
  acceptee: 'Acceptee',
  en_preparation: 'En preparation',
  en_livraison: 'En livraison',
  livree: 'Livree',
  annulee: 'Annulee',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  en_attente: '#f59e0b',
  acceptee: '#3b82f6',
  en_preparation: '#06b6d4',
  en_livraison: '#8b5cf6',
  livree: '#10b981',
  annulee: '#ef4444',
};

export const ORDER_STATUS_BADGES: Record<OrderStatus, string> = {
  en_attente: 'bg-warning text-dark',
  acceptee: 'bg-primary text-white',
  en_preparation: 'bg-info text-dark',
  en_livraison: 'bg-purple text-white',
  livree: 'bg-success text-white',
  annulee: 'bg-danger text-white',
};

export const ORDER_STEPS: OrderStatus[] = [
  'en_attente',
  'acceptee',
  'en_preparation',
  'en_livraison',
  'livree',
];
