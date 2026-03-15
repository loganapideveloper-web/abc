import apiClient from '@/lib/api-client';
import type { Category, Banner, ApiResponse } from '@/types';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return data.data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const { data } = await apiClient.get<ApiResponse<Category>>(
      `/categories/${slug}`,
    );
    return data.data;
  },
};

export const bannerService = {
  getAll: async (): Promise<Banner[]> => {
    const { data } = await apiClient.get<ApiResponse<Banner[]>>('/banners');
    return data.data;
  },
};
