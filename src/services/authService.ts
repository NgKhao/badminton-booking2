import axios from 'axios';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance cho auth service
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  messenger: string;
  status: number;
  detail: {
    userInfo: {
      fullName: string;
      email: string;
      role: 'CUSTOMER' | 'ADMIN';
    };
    token: {
      type: string;
      accessToken: string;
      refreshToken: string;
    };
  };
  instance: string;
}

// Authentication API service
export class AuthAPI {
  /**
   * Đăng nhập người dùng (customer hoặc admin)
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await authApi.post('/auth/login', credentials);
    return response.data;
  }

  /**
   * Đăng xuất người dùng
   */
  static async logout(refreshToken: string): Promise<void> {
    await authApi.post('/auth/logout', { refreshToken });
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('Không có refresh token');
    }

    const response = await authApi.post('/auth/refresh', { refreshToken });
    const data = response.data;

    // Kiểm tra response format theo API documentation
    if (data.status === 200 && data.detail) {
      return {
        accessToken: data.detail.accessToken,
        refreshToken: data.detail.refreshToken,
      };
    } else {
      throw new Error('Invalid refresh token response');
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  static async getCurrentUser(): Promise<LoginResponse['detail']['userInfo']> {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('Không có access token');
    }

    const response = await authApi.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
}
