import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Cart, AppliedCoupon } from '@/types';
import { cartService } from '@/services/cart.service';

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  coupon: AppliedCoupon | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, color?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  setCartFromResponse: (cart: Cart) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      discount: 0,
      deliveryCharge: 0,
      totalAmount: 0,
      coupon: null,
      isLoading: false,
      error: null,

      setCartFromResponse: (cart: Cart) => {
        set({
          items: cart.items,
          totalItems: cart.totalItems,
          subtotal: cart.subtotal,
          discount: cart.discount,
          deliveryCharge: cart.deliveryCharge,
          totalAmount: cart.totalAmount,
          coupon: cart.coupon || null,
        });
      },

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartService.get();
          set({
            items: cart.items,
            totalItems: cart.totalItems,
            subtotal: cart.subtotal,
            discount: cart.discount,
            deliveryCharge: cart.deliveryCharge,
            totalAmount: cart.totalAmount,
            coupon: cart.coupon || null,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      addToCart: async (productId, quantity = 1, color) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartService.addItem(productId, quantity, color);
          set({
            items: cart.items,
            totalItems: cart.totalItems,
            subtotal: cart.subtotal,
            discount: cart.discount,
            deliveryCharge: cart.deliveryCharge,
            totalAmount: cart.totalAmount,
            coupon: cart.coupon || null,
            isLoading: false,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Failed to add to cart.';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      updateQuantity: async (itemId, quantity) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartService.updateQuantity(itemId, quantity);
          set({
            items: cart.items,
            totalItems: cart.totalItems,
            subtotal: cart.subtotal,
            discount: cart.discount,
            deliveryCharge: cart.deliveryCharge,
            totalAmount: cart.totalAmount,
            coupon: cart.coupon || null,
            isLoading: false,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Failed to update quantity.';
          set({ error: message, isLoading: false });
        }
      },

      removeFromCart: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartService.removeItem(itemId);
          set({
            items: cart.items,
            totalItems: cart.totalItems,
            subtotal: cart.subtotal,
            discount: cart.discount,
            deliveryCharge: cart.deliveryCharge,
            totalAmount: cart.totalAmount,
            coupon: cart.coupon || null,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          await cartService.clear();
          set({
            items: [],
            totalItems: 0,
            subtotal: 0,
            discount: 0,
            deliveryCharge: 0,
            totalAmount: 0,
            coupon: null,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      applyCoupon: async (code) => {
        set({ isLoading: true, error: null });
        try {
          await cartService.applyCoupon(code);
          const cart = await cartService.get();
          set({
            items: cart.items,
            totalItems: cart.totalItems,
            subtotal: cart.subtotal,
            discount: cart.discount,
            deliveryCharge: cart.deliveryCharge,
            totalAmount: cart.totalAmount,
            coupon: cart.coupon || null,
            isLoading: false,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Invalid coupon code.';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      removeCoupon: async () => {
        set({ isLoading: true });
        try {
          const cart = await cartService.removeCoupon();
          set({
            items: cart.items,
            totalItems: cart.totalItems,
            subtotal: cart.subtotal,
            discount: cart.discount,
            deliveryCharge: cart.deliveryCharge,
            totalAmount: cart.totalAmount,
            coupon: null,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'amoha-cart',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
        totalAmount: state.totalAmount,
      }),
    },
  ),
);
