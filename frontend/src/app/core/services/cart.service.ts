/**
 * FILE: frontend/src/app/core/services/cart.service.ts
 * ROLE: Angular API service.
 * USED BY / TALKS TO: Components and other Angular services.
 * KEY IDEA: HTTP calls return RxJS Observables.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export interface CartDish {
  _id?: string;
  id?: string;
  nom: string;
  prix: number;
  image?: string;
  disponible?: boolean;
}

export interface CartRestaurant {
  _id?: string;
  id?: string;
  nom: string;
  fraisLivraison?: number;
}

export interface CartItem {
  dishId: string;
  nom: string;
  prix: number;
  image: string;
  quantite: number;
}

export interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  fraisLivraison: number;
  items: CartItem[];
}

const CART_KEY = 'foodexpress_cart';
const EMPTY_CART: CartState = {
  restaurantId: null,
  restaurantName: null,
  fraisLivraison: 0,
  items: [],
};

@Injectable({ providedIn: 'root' })
// KEY: An injectable service shares API logic across components.
export class CartService {
  private readonly stateSubject = new BehaviorSubject<CartState>(this.readCart());
  // Cart state is shared as Observables so every cart page reacts to changes.
  readonly cart$ = this.stateSubject.asObservable();
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>(this.stateSubject.value.items);
  readonly items$ = this.itemsSubject.asObservable();
  readonly count$ = this.cart$.pipe(
    map((state) => state.items.reduce((count, item) => count + item.quantite, 0)),
  );

  constructor() {
    this.stateSubject.subscribe((state) => this.itemsSubject.next(state.items));
  }

  addItem(dish: CartDish, restaurant: CartRestaurant): boolean {
    // BUSINESS RULE: unavailable dishes and cross-restaurant items cannot be mixed.
    if (dish.disponible === false) {
      return false;
    }
    const restaurantId = restaurant._id ?? restaurant.id;
    const dishId = dish._id ?? dish.id;
    if (!restaurantId || !dishId) {
      throw new Error('Restaurant and dish IDs are required to add an item');
    }

    let cart = this.stateSubject.value;
    if (cart.restaurantId && cart.restaurantId !== restaurantId) {
      if (!window.confirm('Your cart contains items from another restaurant. Clear it and continue?')) {
        return false;
      }
      cart = { ...EMPTY_CART };
    }

    const existing = cart.items.find((item) => item.dishId === dishId);
    const items = existing
      ? cart.items.map((item) => item.dishId === dishId ? { ...item, quantite: item.quantite + 1 } : item)
      : [...cart.items, {
        dishId,
        nom: dish.nom,
        prix: dish.prix,
        image: dish.image ?? '',
        quantite: 1,
      }];

    this.update({
      restaurantId,
      restaurantName: restaurant.nom,
      fraisLivraison: Math.max(0, restaurant.fraisLivraison ?? 0),
      items,
    });
    return true;
  }

  increase(dishId: string): void {
    // Increasing quantity keeps the same persisted restaurant and delivery fee.
    this.update({
      ...this.stateSubject.value,
      items: this.stateSubject.value.items.map((item) =>
        item.dishId === dishId ? { ...item, quantite: item.quantite + 1 } : item,
      ),
    });
  }

  decrease(dishId: string): void {
    const items = this.stateSubject.value.items
      .map((item) => item.dishId === dishId ? { ...item, quantite: item.quantite - 1 } : item)
      .filter((item) => item.quantite > 0);
    this.update(items.length ? { ...this.stateSubject.value, items } : { ...EMPTY_CART });
  }

  remove(dishId: string): void {
    const items = this.stateSubject.value.items.filter((item) => item.dishId !== dishId);
    this.update(items.length ? { ...this.stateSubject.value, items } : { ...EMPTY_CART });
  }

  clear(): void {
    this.update({ ...EMPTY_CART });
  }

  getSubTotal(): number {
    // Subtotal is the sum of each dish price multiplied by its quantity.
    return this.stateSubject.value.items.reduce((total, item) => total + item.prix * item.quantite, 0);
  }

  getDeliveryFee(): number {
    return this.stateSubject.value.items.length ? this.stateSubject.value.fraisLivraison : 0;
  }

  getTotal(): number {
    return this.getSubTotal() + this.getDeliveryFee();
  }

  getCount(): number {
    return this.stateSubject.value.items.reduce((count, item) => count + item.quantite, 0);
  }

  private update(cart: CartState): void {
    // LocalStorage keeps the cart after refresh; an empty cart is removed.
    this.stateSubject.next(cart);
    if (cart.items.length) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(CART_KEY);
    }
  }

  private readCart(): CartState {
    const storedCart = localStorage.getItem(CART_KEY);
    if (!storedCart) {
      return { ...EMPTY_CART };
    }
    try {
      const cart = JSON.parse(storedCart) as CartState;
      if (!Array.isArray(cart.items) || !cart.restaurantId) {
        throw new Error('Stored cart has an invalid shape');
      }
      return cart;
    } catch (error) {
      console.error('Unable to read the stored cart', error);
      localStorage.removeItem(CART_KEY);
      return { ...EMPTY_CART };
    }
  }
}
