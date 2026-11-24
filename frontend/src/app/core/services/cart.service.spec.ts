import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartService } from './cart.service';

describe('CartService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists a single-restaurant cart and calculates totals', () => {
    const cart = new CartService();
    const dish = { _id: 'dish-1', nom: 'Soup', prix: 12.5 };
    const restaurant = { _id: 'restaurant-1', nom: 'Cafe', fraisLivraison: 4 };

    expect(cart.addItem(dish, restaurant)).toBe(true);
    expect(cart.addItem(dish, restaurant)).toBe(true);
    expect(cart.getCount()).toBe(2);
    expect(cart.getSubTotal()).toBe(25);
    expect(cart.getDeliveryFee()).toBe(4);
    expect(cart.getTotal()).toBe(29);

    const restoredCart = new CartService();
    expect(restoredCart.getCount()).toBe(2);
    expect(restoredCart.getTotal()).toBe(29);
  });

  it('refuses unavailable dishes and preserves items when restaurant switching is cancelled', () => {
    const cart = new CartService();
    const firstRestaurant = { _id: 'restaurant-1', nom: 'Cafe' };
    cart.addItem({ _id: 'dish-1', nom: 'Soup', prix: 12 }, firstRestaurant);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    expect(cart.addItem({ _id: 'dish-2', nom: 'Pasta', prix: 15 }, {
      _id: 'restaurant-2',
      nom: 'Bistro',
    })).toBe(false);
    expect(cart.addItem({ _id: 'dish-3', nom: 'Unavailable', prix: 10, disponible: false }, firstRestaurant)).toBe(false);
    expect(cart.getCount()).toBe(1);

    cart.decrease('dish-1');
    expect(cart.getCount()).toBe(0);
    expect(localStorage.getItem('foodexpress_cart')).toBeNull();
  });
});
