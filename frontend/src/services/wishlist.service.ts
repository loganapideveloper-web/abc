import apiClient from '@/lib/api-client';
import type { WishlistItem, ApiResponse } from '@/types';

export const wishlistService = {
  getAll: async (): Promise<WishlistItem[]> => {
    const { data } = await apiClient.get<ApiResponse<WishlistItem[]>>('/wishlist');
    return data.data;
  },

  add: async (productId: string): Promise<WishlistItem> => {
    const { data } = await apiClient.post<ApiResponse<WishlistItem>>('/wishlist', {
      productId,
    });
    return data.data;
  },

  remove: async (productId: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${productId}`);
  },

  check: async (productId: string): Promise<boolean> => {
    const { data } = await apiClient.get<ApiResponse<{ isInWishlist: boolean }>>(
      `/wishlist/check/${productId}`,
    );
    return data.data.isInWishlist;
  },
};
