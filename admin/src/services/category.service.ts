import apiClient from '@/lib/api-client';
import type { ApiResponse, Category, CategoryFormData } from '@/types';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<ApiResponse<Category[]>>('/admin/categories');
    return data.data;
  },
  getById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<ApiResponse<Category>>(`/admin/categories/${id}`);
    return data.data;
  },
  create: async (payload: CategoryFormData): Promise<Category> => {
    const { data } = await apiClient.post<ApiResponse<Category>>('/admin/categories', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<CategoryFormData>): Promise<Category> => {
    const { data } = await apiClient.put<ApiResponse<Category>>(`/admin/categories/${id}`, payload);
    return data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },
};
