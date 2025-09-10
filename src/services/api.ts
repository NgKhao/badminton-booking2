import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý token refresh cho các request đã có token và không phải auth requests
    const isAuthRequest =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/logout');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          // Gọi API refresh token với format backend
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          // Xử lý response từ backend (format như bạn cung cấp)
          const backendData = response.data;

          if (backendData.status === 200 && backendData.detail) {
            const newAccessToken = backendData.detail.accessToken;
            const newRefreshToken = backendData.detail.refreshToken;

            // Cập nhật cả access token và refresh token
            const authStore = useAuthStore.getState();
            authStore.updateTokens(newAccessToken, newRefreshToken);

            // Retry original request với token mới
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } else {
            throw new Error('Invalid refresh response');
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          console.error('Token refresh failed:', refreshError);
          const authStore = useAuthStore.getState();
          const currentUser = authStore.user;

          authStore.logout();

          // Chuyển hướng đến đúng trang login dựa vào role
          if (currentUser?.role === 'admin') {
            window.location.href = '/admin/login';
          } else {
            window.location.href = '/auth';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, logout user (chỉ khi không phải auth request)
        const authStore = useAuthStore.getState();
        const currentUser = authStore.user;

        authStore.logout();

        // Chuyển hướng đến đúng trang login dựa vào role
        if (currentUser?.role === 'admin') {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/auth';
        }
      }
    }

    // Đối với auth requests (login/register), chỉ trả về lỗi mà không redirect
    return Promise.reject(error);
  }
);

export default api;
