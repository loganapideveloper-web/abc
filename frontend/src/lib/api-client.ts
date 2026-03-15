import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor – handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only remove token and redirect if user had a token (was logged in)
      // Don't redirect guests browsing public pages
      const hadToken = !!Cookies.get('token');
      Cookies.remove('token');
      if (hadToken && typeof window !== 'undefined') {
        // Only redirect to login from protected pages, not public ones
        const publicPaths = ['/', '/products', '/product', '/categories', '/category', '/shop', '/search', '/compare'];
        const currentPath = window.location.pathname;
        const isPublicPage = publicPaths.some(
          (p) => currentPath === p || (p !== '/' && currentPath.startsWith(p + '/'))
        );
        if (!isPublicPage) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
