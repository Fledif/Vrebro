import { create } from 'zustand';
import type { Product } from '../api';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  addItemWithQuantity: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalCount: () => number;
  
  weightModalProduct: Product | null;
  openWeightModal: (product: Product) => void;
  closeWeightModal: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  weightModalProduct: null,
  openWeightModal: (product) => set({ weightModalProduct: product }),
  closeWeightModal: () => set({ weightModalProduct: null }),

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

  addItemWithQuantity: (product, quantity) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.product.id === product.id);
      if (existingItem) {
        if (product.stock_quantity !== null && product.stock_quantity !== undefined && quantity > product.stock_quantity) {
            alert(`Вибачте, доступно лише ${product.stock_quantity} одиниць.`);
            return state;
        }
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: quantity }
              : item
          ),
        };
      }
      if (product.stock_quantity !== null && product.stock_quantity !== undefined && quantity > product.stock_quantity) {
          alert(`Вибачте, товар закінчився.`);
          return state;
      }
      return { items: [...state.items, { product, quantity: quantity }] };
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
      
      const step = itemToIncrease.product.is_weighted && itemToIncrease.product.weight_step ? itemToIncrease.product.weight_step / 1000 : 1;
      let newQuantity = itemToIncrease.quantity + step;
      // Round to 3 decimal places to avoid floating point math issues (e.g. 0.3 - 0.1 = 0.199999)
      newQuantity = Math.round(newQuantity * 1000) / 1000;
      
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
    set((state) => {
      const itemToDecrease = state.items.find((item) => item.product.id === productId);
      if (!itemToDecrease) return state;
      
      const step = itemToDecrease.product.is_weighted && itemToDecrease.product.weight_step ? itemToDecrease.product.weight_step / 1000 : 1;
      let newQuantity = itemToDecrease.quantity - step;
      newQuantity = Math.round(newQuantity * 1000) / 1000;
      
      if (newQuantity <= 0) {
        return {
          items: state.items.filter((item) => item.product.id !== productId),
        };
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
