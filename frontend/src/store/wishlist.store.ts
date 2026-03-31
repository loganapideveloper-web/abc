import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WishlistItem } from '@/types';
import { wishlistService } from '@/services/wishlist.service';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
          const items = await wishlistService.getAll();
          set({ items, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      addToWishlist: async (productId) => {
        set({ error: null });
        try {
          const item = await wishlistService.add(productId);
          if (item) {
            set((state) => ({
              items: [...state.items.filter(i => i.product?._id !== productId), item],
            }));
          } else {
            // Refetch full list if single item response is empty
            const items = await wishlistService.getAll();
            set({ items });
          }
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Please login to add to wishlist.';
          set({ error: message });
          throw new Error(message);
        }
      },

      removeFromWishlist: async (productId) => {
        set({ isLoading: true, error: null });
        try {
          await wishlistService.remove(productId);
          set((state) => ({
            items: state.items.filter((item) => item.product._id !== productId),
            isLoading: false,
          }));
        } catch {
          set({ isLoading: false });
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.product._id === productId);
      },
    }),
    {
      name: 'amoha-wishlist',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
