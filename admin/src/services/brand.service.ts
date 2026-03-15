import apiClient from '@/lib/api-client';
import type { ApiResponse, Brand, BrandFormData } from '@/types';

export const brandService = {
  getAll: async (): Promise<Brand[]> => {
    const { data } = await apiClient.get<ApiResponse<Brand[]>>('/admin/brands');
    return data.data;
  },
  getById: async (id: string): Promise<Brand> => {
    const { data } = await apiClient.get<ApiResponse<Brand>>(`/admin/brands/${id}`);
    return data.data;
  },
  create: async (payload: BrandFormData): Promise<Brand> => {
    const { data } = await apiClient.post<ApiResponse<Brand>>('/admin/brands', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<BrandFormData>): Promise<Brand> => {
    const { data } = await apiClient.put<ApiResponse<Brand>>(`/admin/brands/${id}`, payload);
    return data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/brands/${id}`);
  },
};
