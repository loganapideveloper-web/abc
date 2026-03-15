import apiClient from '@/lib/api-client';
import type { ApiResponse, Banner, BannerFormData } from '@/types';

export const bannerService = {
  getAll: async (): Promise<Banner[]> => {
    const { data } = await apiClient.get<ApiResponse<Banner[]>>('/admin/banners');
    return data.data;
  },
  create: async (payload: BannerFormData): Promise<Banner> => {
    const { data } = await apiClient.post<ApiResponse<Banner>>('/admin/banners', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<BannerFormData>): Promise<Banner> => {
    const { data } = await apiClient.put<ApiResponse<Banner>>(`/admin/banners/${id}`, payload);
    return data.data;
  },
  toggleActive: async (id: string, isActive: boolean): Promise<Banner> => {
    const { data } = await apiClient.patch<ApiResponse<Banner>>(`/admin/banners/${id}/toggle`, { isActive });
    return data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/banners/${id}`);
  },
};
