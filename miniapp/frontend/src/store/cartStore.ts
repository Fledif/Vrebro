import { create } from 'zustand';
import type { Product } from '../api';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.product.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (product.stock_quantity !== null && product.stock_quantity !== undefined && newQuantity > product.stock_quantity) {
            alert(`Вибачте, доступно лише ${product.stock_quantity} одиниць.`);
            return state;
        }
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: newQuantity }
              : item
          ),
        };
      }
      if (product.stock_quantity !== null && product.stock_quantity !== undefined && 1 > product.stock_quantity) {
          alert(`Вибачте, товар закінчився.`);
          return state;
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    });
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },
  increaseQuantity: (productId) => {
    set((state) => {
      const itemToIncrease = state.items.find((item) => item.product.id === productId);
      if (!itemToIncrease) return state;
      
      const newQuantity = itemToIncrease.quantity + 1;
      if (itemToIncrease.product.stock_quantity !== null && itemToIncrease.product.stock_quantity !== undefined && newQuantity > itemToIncrease.product.stock_quantity) {
          alert(`Вибачте, доступно лише ${itemToIncrease.product.stock_quantity} одиниць.`);
          return state;
      }

      return {
        items: state.items.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ),
      };
    });
  },
  decreaseQuantity: (productId) => {
    set((state) => ({
      items: state.items
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));
  },
  clearCart: () => set({ items: [] }),
  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },
  getTotalCount: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },
}));
