import { create } from 'zustand';

import type { CartItem } from '@/types/cart';

type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
};

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return { totalItems, totalPrice };
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((cartItem) => cartItem.id === item.id);
      const nextItems = existing
        ? state.items.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem,
          )
        : [...state.items, item];

      return {
        items: nextItems,
        ...calculateTotals(nextItems),
      };
    });
  },
  removeItem: (itemId) => {
    set((state) => {
      const nextItems = state.items.filter((item) => item.id !== itemId);
      return {
        items: nextItems,
        ...calculateTotals(nextItems),
      };
    });
  },
  updateQuantity: (itemId, quantity) => {
    set((state) => {
      const sanitizedQuantity = Math.max(1, quantity);
      const nextItems = state.items.map((item) =>
        item.id === itemId ? { ...item, quantity: sanitizedQuantity } : item,
      );

      return {
        items: nextItems,
        ...calculateTotals(nextItems),
      };
    });
  },
  clearCart: () => {
    set({ items: [], totalItems: 0, totalPrice: 0 });
  },
}));
