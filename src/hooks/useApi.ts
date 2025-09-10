import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import api from '../services/api';
import { AuthAPI } from '../services/authService';
import type { AxiosResponse, AxiosError } from 'axios';

// ================== AUTH API HOOKS ==================

// Types cho Auth API
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

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  messenger: string;
  status: number;
  detail: {
    userInfo: {
      id: number;
      email: string;
      fullName: string;
      phone: string;
      role: 'CUSTOMER' | 'ADMIN';
    };
    token?: {
      type: string;
      accessToken: string;
      refreshToken: string;
    };
  };
  instance: string;
}

// ================== AUTH HOOKS ==================

/**
 * Hook để thực hiện login
 * Trả về mutation object để component tự xử lý onSuccess/onError
 */
export const useLoginMutation = (
  options?: UseMutationOptions<LoginResponse, AxiosError, LoginRequest>
) => {
  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<LoginResponse> => {
      const response: AxiosResponse<LoginResponse> = await api.post('/auth/login', credentials);
      return response.data;
    },
    ...options,
  });
};

/**
 * Hook để thực hiện register
 * Trả về mutation object để component tự xử lý onSuccess/onError
 */
export const useRegisterMutation = (
  options?: UseMutationOptions<RegisterResponse, AxiosError, RegisterRequest>
) => {
  return useMutation({
    mutationFn: async (registerData: RegisterRequest): Promise<RegisterResponse> => {
      const response: AxiosResponse<RegisterResponse> = await api.post(
        '/auth/register',
        registerData
      );
      return response.data;
    },
    ...options,
  });
};

/**
 * Hook để thực hiện logout
 */
export const useLogoutMutation = (options?: UseMutationOptions<void, AxiosError, void>) => {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await AuthAPI.logout(refreshToken);
      }
    },
    ...options,
  });
};

// Types cho Refresh Token API
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  messenger: string;
  status: number;
  detail: {
    accessToken: string;
    type: string;
    refreshToken: string;
  };
  instance: string;
}

/**
 * Hook để thực hiện refresh token
 * Trả về mutation object để component tự xử lý onSuccess/onError
 */
export const useRefreshTokenMutation = (
  options?: UseMutationOptions<RefreshTokenResponse, AxiosError, RefreshTokenRequest>
) => {
  return useMutation({
    mutationFn: async (refreshData: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
      const response: AxiosResponse<RefreshTokenResponse> = await api.post(
        '/auth/refresh',
        refreshData
      );
      return response.data;
    },
    ...options,
  });
};

// ================== USER API HOOKS ==================

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook để lấy thông tin user hiện tại
 */
export const useCurrentUser = (options?: UseQueryOptions<UserProfile, AxiosError>) => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<UserProfile> => {
      const response: AxiosResponse<{ detail: UserProfile }> = await api.get('/auth/me');
      return response.data.detail;
    },
    ...options,
  });
};

/**
 * Hook để cập nhật profile user
 */
export const useUpdateProfileMutation = (
  options?: UseMutationOptions<UserProfile, AxiosError, Partial<UserProfile>>
) => {
  return useMutation({
    mutationFn: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
      const response: AxiosResponse<{ detail: UserProfile }> = await api.put(
        '/user/profile',
        profileData
      );
      return response.data.detail;
    },
    ...options,
  });
};

// ================== COURT API HOOKS ==================

export interface Court {
  court_id: number;
  court_name: string;
  court_type: 'Trong nhà' | 'Ngoài trời';
  status: 'available' | 'maintenance' | 'unavailable';
  hourly_rate: number;
  description?: string;
  images?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook để lấy danh sách courts
 */
export const useCourts = (options?: UseQueryOptions<Court[], AxiosError>) => {
  return useQuery({
    queryKey: ['courts'],
    queryFn: async (): Promise<Court[]> => {
      const response: AxiosResponse<{ detail: Court[] }> = await api.get('/courts');
      return response.data.detail;
    },
    ...options,
  });
};

/**
 * Hook để lấy chi tiết 1 court
 */
export const useCourt = (courtId: number, options?: UseQueryOptions<Court, AxiosError>) => {
  return useQuery({
    queryKey: ['court', courtId],
    queryFn: async (): Promise<Court> => {
      const response: AxiosResponse<{ detail: Court }> = await api.get(`/courts/${courtId}`);
      return response.data.detail;
    },
    enabled: !!courtId,
    ...options,
  });
};

// ================== BOOKING API HOOKS ==================

export interface Booking {
  booking_id: number;
  booking_code?: string;
  customer_id: number;
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  court?: Court;
}

export interface CreateBookingRequest {
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

/**
 * Hook để tạo booking mới
 */
export const useCreateBookingMutation = (
  options?: UseMutationOptions<Booking, AxiosError, CreateBookingRequest>
) => {
  return useMutation({
    mutationFn: async (bookingData: CreateBookingRequest): Promise<Booking> => {
      const response: AxiosResponse<{ detail: Booking }> = await api.post('/bookings', bookingData);
      return response.data.detail;
    },
    ...options,
  });
};

/**
 * Hook để lấy danh sách bookings của user
 */
export const useUserBookings = (options?: UseQueryOptions<Booking[], AxiosError>) => {
  return useQuery({
    queryKey: ['userBookings'],
    queryFn: async (): Promise<Booking[]> => {
      const response: AxiosResponse<{ detail: Booking[] }> = await api.get('/bookings/my-bookings');
      return response.data.detail;
    },
    ...options,
  });
};

/**
 * Hook để hủy booking
 */
export const useCancelBookingMutation = (
  options?: UseMutationOptions<Booking, AxiosError, number>
) => {
  return useMutation({
    mutationFn: async (bookingId: number): Promise<Booking> => {
      const response: AxiosResponse<{ detail: Booking }> = await api.patch(
        `/bookings/${bookingId}/cancel`
      );
      return response.data.detail;
    },
    ...options,
  });
};

// ================== ADMIN API HOOKS ==================

/**
 * Hook để lấy tất cả bookings (admin only)
 */
export const useAllBookings = (options?: UseQueryOptions<Booking[], AxiosError>) => {
  return useQuery({
    queryKey: ['allBookings'],
    queryFn: async (): Promise<Booking[]> => {
      const response: AxiosResponse<{ detail: Booking[] }> = await api.get('/admin/bookings');
      return response.data.detail;
    },
    ...options,
  });
};

/**
 * Hook để tạo court mới (admin only)
 */
export const useCreateCourtMutation = (
  options?: UseMutationOptions<
    Court,
    AxiosError,
    Omit<Court, 'court_id' | 'created_at' | 'updated_at'>
  >
) => {
  return useMutation({
    mutationFn: async (
      courtData: Omit<Court, 'court_id' | 'created_at' | 'updated_at'>
    ): Promise<Court> => {
      const response: AxiosResponse<{ detail: Court }> = await api.post('/admin/courts', courtData);
      return response.data.detail;
    },
    ...options,
  });
};

/**
 * Hook để cập nhật court (admin only)
 */
export const useUpdateCourtMutation = (
  options?: UseMutationOptions<Court, AxiosError, { courtId: number; data: Partial<Court> }>
) => {
  return useMutation({
    mutationFn: async ({
      courtId,
      data,
    }: {
      courtId: number;
      data: Partial<Court>;
    }): Promise<Court> => {
      const response: AxiosResponse<{ detail: Court }> = await api.put(
        `/admin/courts/${courtId}`,
        data
      );
      return response.data.detail;
    },
    ...options,
  });
};

// ================== GENERIC HOOKS ==================

/**
 * Hook tổng quát để tạo mutation với axios
 */
export const useApiMutation = <TData = unknown, TError = AxiosError, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<AxiosResponse<TData>>,
  options?: UseMutationOptions<TData, TError, TVariables>
) => {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await mutationFn(variables);
      return response.data;
    },
    ...options,
  });
};

/**
 * Hook tổng quát để tạo query với axios
 */
export const useApiQuery = <TData = unknown, TError = AxiosError>(
  queryKey: (string | number)[],
  queryFn: () => Promise<AxiosResponse<TData>>,
  options?: UseQueryOptions<TData, TError>
) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await queryFn();
      return response.data;
    },
    ...options,
  });
};
