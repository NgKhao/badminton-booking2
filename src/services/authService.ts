// API base configuration
const API_BASE_URL = 'http://localhost:8080/api';

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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.messenger || 'Đăng nhập thất bại');
    }

    return response.json();
  }

  /**
   * Đăng xuất người dùng
   */
  static async logout(): Promise<void> {
    const token = localStorage.getItem('accessToken');

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }

    // Xóa tokens khỏi localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('Không có refresh token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Không thể refresh token');
    }

    const data = await response.json();
    return {
      accessToken: data.detail.token.accessToken,
      refreshToken: data.detail.token.refreshToken,
    };
  }

  /**
   * Lấy thông tin user hiện tại
   */
  static async getCurrentUser(): Promise<any> {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('Không có access token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin user');
    }

    return response.json();
  }
}

// Helper function để get authorization header
export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function để check if user is admin
export const isAdmin = (role?: string): boolean => {
  return role === 'ADMIN' || role === 'admin';
};

// Helper function để check if user is customer
export const isCustomer = (role?: string): boolean => {
  return role === 'CUSTOMER' || role === 'customer';
};
