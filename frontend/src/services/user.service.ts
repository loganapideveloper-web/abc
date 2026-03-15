import apiClient from '@/lib/api-client';
import type { Address, ApiResponse } from '@/types';

export const userService = {
  getAddresses: async (): Promise<Address[]> => {
    const { data } = await apiClient.get<ApiResponse<Address[]>>('/users/addresses');
    return data.data;
  },

  addAddress: async (address: Omit<Address, '_id'>): Promise<Address> => {
    const { data } = await apiClient.post<ApiResponse<Address>>('/users/addresses', address);
    return data.data;
  },

  updateAddress: async (addressId: string, address: Partial<Address>): Promise<Address> => {
    const { data } = await apiClient.put<ApiResponse<Address>>(`/users/addresses/${addressId}`, address);
    return data.data;
  },

  deleteAddress: async (addressId: string): Promise<void> => {
    await apiClient.delete(`/users/addresses/${addressId}`);
  },
};
