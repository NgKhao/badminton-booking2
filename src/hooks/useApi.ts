import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import api from '../services/api';
import {
  AuthAPI,
  type RegisterRequest as AuthRegisterRequest,
  type RegisterResponse as AuthRegisterResponse,
} from '../services/authService';
import type { AxiosResponse, AxiosError } from 'axios';
import type {
  AvailabilitySlot,
  NewBookingRequest,
  NewBookingResponse,
  ChatRequest,
  ChatResponse,
  DashboardData,
  DashboardDailyParams,
  DashboardMonthlyParams,
} from '../types';

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
      role: 'CUSTOMER' | 'ADMIN' | 'STAFF';
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
  options?: UseMutationOptions<AuthRegisterResponse, AxiosError, AuthRegisterRequest>
) => {
  return useMutation({
    mutationFn: async (registerData: AuthRegisterRequest): Promise<AuthRegisterResponse> => {
      return await AuthAPI.register(registerData);
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

// Response type from API /users/me
export interface UserProfileResponse {
  messenger: string;
  status: number;
  detail: {
    userId: number;
    customerId: number;
    email: string;
    fullName: string;
    numberPhone: string;
    active: boolean;
    roleName: 'CUSTOMER' | 'ADMIN';
  };
  instance: string;
}

// Normalized UserProfile type for frontend use
export interface UserProfile {
  userId: number;
  customerId: number;
  email: string;
  fullName: string;
  numberPhone: string;
  active: boolean;
  roleName: 'CUSTOMER' | 'ADMIN' | 'STAFF';
}

/**
 * Hook để lấy thông tin user hiện tại từ /users/me
 */
export const useCurrentUser = (options?: UseQueryOptions<UserProfile, AxiosError>) => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<UserProfile> => {
      const response: AxiosResponse<UserProfileResponse> = await api.get('/users/me');
      return response.data.detail;
    },
    ...options,
  });
};

/**
 * Hook để cập nhật profile user
 * PUT /users/{userId}
 */
export const useUpdateProfileMutation = (
  options?: UseMutationOptions<
    UserProfile,
    AxiosError,
    { userId: number; data: { fullName: string; numberPhone: string } }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: number;
      data: { fullName: string; numberPhone: string };
    }): Promise<UserProfile> => {
      const response: AxiosResponse<UserProfileResponse> = await api.put(`/users/${userId}`, data);
      return response.data.detail;
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    ...options,
  });
};

/**
 * Interface cho change password request
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Interface cho change password response
 */
export interface ChangePasswordResponse {
  messenger: string;
  status: number;
  detail: null;
  instance: string;
}

/**
 * Hook để đổi mật khẩu
 * PATCH /change-password
 */
export const useChangePasswordMutation = (
  options?: UseMutationOptions<ChangePasswordResponse, AxiosError, ChangePasswordRequest>
) => {
  return useMutation({
    mutationFn: async (passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
      const response = await api.patch('/change-password', passwordData);
      return response.data;
    },
    ...options,
  });
};

// ================== COURT API HOOKS ==================

export interface Court {
  id: number;
  courtName: string;
  courtType: 'INDOOR' | 'OUTDOOR';
  hourlyRate: number;
  description?: string;
  images?: string[];
  isActive: boolean;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
}

// API Response types for courts
export interface CourtsResponse {
  messenger: string;
  status: number;
  detail: {
    content: Court[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
  instance: string;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  size?: number;
}

// Pagination response
export interface PaginationInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CourtDetailResponse {
  messenger: string;
  status: number;
  detail: Court;
  instance: string;
}

/**
 * Hook để lấy danh sách courts (user - chỉ active courts) với pagination
 */
export const useCourts = (
  params?: PaginationParams,
  options?: UseQueryOptions<{ courts: Court[]; pagination: PaginationInfo }, AxiosError>
) => {
  return useQuery({
    queryKey: ['courts', params],
    queryFn: async (): Promise<{ courts: Court[]; pagination: PaginationInfo }> => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.append('page', params.page.toString());
      if (params?.size !== undefined) searchParams.append('size', params.size.toString());

      const response: AxiosResponse<CourtsResponse> = await api.get(
        `/courts${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      );

      return {
        courts: response.data.detail.content,
        pagination: {
          pageNumber: response.data.detail.pageNumber,
          pageSize: response.data.detail.pageSize,
          totalElements: response.data.detail.totalElements,
          totalPages: response.data.detail.totalPages,
          first: response.data.detail.first,
          last: response.data.detail.last,
        },
      };
    },
    ...options,
  });
};

/**
 * Hook để lấy danh sách tất cả courts (admin - bao gồm cả inactive courts)
 */
export const useAdminCourts = (
  params?: PaginationParams,
  options?: UseQueryOptions<{ courts: Court[]; pagination: PaginationInfo }, AxiosError>
) => {
  return useQuery({
    queryKey: ['admin-courts', params],
    queryFn: async (): Promise<{ courts: Court[]; pagination: PaginationInfo }> => {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      const url = `/admin/courts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<CourtsResponse> = await api.get(url);

      return {
        courts: response.data.detail.content.sort((a, b) => b.id - a.id), // Sort by ID descending (newest first)
        pagination: {
          pageNumber: response.data.detail.pageNumber,
          pageSize: response.data.detail.pageSize,
          totalElements: response.data.detail.totalElements,
          totalPages: response.data.detail.totalPages,
          first: response.data.detail.first,
          last: response.data.detail.last,
        },
      };
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
      const response: AxiosResponse<CourtDetailResponse> = await api.get(`/courts/${courtId}`);
      return response.data.detail;
    },
    enabled: !!courtId,
    ...options,
  });
};

// Court availability API hook
export const useCourtAvailability = (
  courtId: number,
  date: string,
  options?: UseQueryOptions<AvailabilitySlot[], AxiosError>
) => {
  return useQuery({
    queryKey: ['court-availability', courtId, date],
    queryFn: async (): Promise<AvailabilitySlot[]> => {
      const response: AxiosResponse<AvailabilitySlot[]> = await api.get(
        `/courts/${courtId}/availabilitySlots?date=${date}`
      );
      return response.data;
    },
    enabled: !!courtId && !!date,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Court management API types
export interface CreateCourtRequest {
  courtName: string;
  courtType: 'INDOOR' | 'OUTDOOR';
  hourlyRate: number;
  description?: string;
}

export interface CreateCourtFormRequest {
  courtDTO: CreateCourtRequest;
  imageFile?: File;
}

export interface CreateCourtResponse {
  messenger: string;
  status: number;
  detail: Court;
  instance: string;
}

export interface UpdateCourtRequest {
  courtName?: string;
  courtType?: 'INDOOR' | 'OUTDOOR';
  hourlyRate?: number;
  description?: string;
  isActive?: boolean;
  status?: 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
}

export interface UpdateCourtFormRequest {
  courtDTO: UpdateCourtRequest;
  imageFile?: File;
}

export interface UpdateCourtResponse {
  messenger: string;
  status: number;
  detail: Court;
  instance: string;
}

export interface DeleteCourtResponse {
  messenger: string;
  status: number;
  detail: null;
  instance: string;
}

/**
 * Hook để tạo court mới (admin only)
 */
export const useCreateCourtMutation = (
  options?: UseMutationOptions<Court, AxiosError, CreateCourtFormRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<Court, AxiosError, CreateCourtFormRequest>({
    mutationFn: async ({ courtDTO, imageFile }) => {
      const formData = new FormData();

      // Thêm courtDTO as JSON string
      formData.append('courtDTO', JSON.stringify(courtDTO));

      // Thêm image file nếu có
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }

      const response = await api.post<CreateCourtResponse>('/admin/courts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.detail;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courts'] });
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    },
    ...options,
  });
};

/**
 * Hook để cập nhật court (admin only)
 */
export const useUpdateCourtMutation = (
  options?: UseMutationOptions<Court, AxiosError, { courtId: number; data: UpdateCourtFormRequest }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Court, AxiosError, { courtId: number; data: UpdateCourtFormRequest }>({
    mutationFn: async ({ courtId, data: { courtDTO, imageFile } }) => {
      const formData = new FormData();

      // Thêm courtDTO as JSON string
      formData.append('courtDTO', JSON.stringify(courtDTO));

      // Thêm image file nếu có
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }

      const response = await api.patch<UpdateCourtResponse>(`/admin/courts/${courtId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.detail;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courts'] });
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    },
    ...options,
  });
};

/**
 * Hook để xóa court (admin only)
 */
export const useDeleteCourtMutation = (options?: UseMutationOptions<void, AxiosError, number>) => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, number>({
    mutationFn: async (courtId) => {
      await api.delete<DeleteCourtResponse>(`/admin/courts/${courtId}`);
    },
    onSuccess: () => {
      // Invalidate both admin and user courts queries
      queryClient.invalidateQueries({ queryKey: ['admin-courts'] });
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    },
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

/**
 * Hook để tạo booking mới với API format mới
 */
export const useNewCreateBookingMutation = (
  options?: UseMutationOptions<NewBookingResponse, AxiosError, NewBookingRequest>
) => {
  return useMutation({
    mutationFn: async (bookingData: NewBookingRequest): Promise<NewBookingResponse> => {
      const response: AxiosResponse<{
        messenger: string;
        status: number;
        detail: NewBookingResponse;
        instance: string;
      }> = await api.post('/bookings', bookingData);
      return response.data.detail;
    },
    ...options,
  });
};

// ================== CUSTOMER API HOOKS ==================

export interface Customer {
  userId: number;
  customerId: number;
  email: string;
  fullName: string;
  numberPhone: string;
  active: boolean;
  roleName: 'CUSTOMER' | 'ADMIN' | 'STAFF';
}

export interface CustomerListResponse {
  messenger: string;
  status: number;
  detail: {
    content: Customer[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
      offset: number;
      unpaged: boolean;
      paged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
  instance: string;
}

export interface CustomerDetailResponse {
  messenger: string;
  status: number;
  detail: Customer;
  instance: string;
}

/**
 * Hook để lấy danh sách khách hàng (admin only)
 */
export const useCustomers = (
  params?: PaginationParams,
  options?: UseQueryOptions<{ customers: Customer[]; pagination: PaginationInfo }, AxiosError>
) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async (): Promise<{ customers: Customer[]; pagination: PaginationInfo }> => {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      const url = `/admin/all/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<CustomerListResponse> = await api.get(url);

      return {
        customers: response.data.detail.content.sort((a, b) => b.userId - a.userId), // Sort by userId descending (newest first)
        pagination: {
          pageNumber: response.data.detail.number,
          pageSize: response.data.detail.size,
          totalElements: response.data.detail.totalElements,
          totalPages: response.data.detail.totalPages,
          first: response.data.detail.first,
          last: response.data.detail.last,
        },
      };
    },
    ...options,
  });
};

/**
 * Hook để lấy chi tiết khách hàng (admin only)
 */
export const useCustomer = (
  customerId: number,
  options?: UseQueryOptions<Customer, AxiosError>
) => {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async (): Promise<Customer> => {
      const response: AxiosResponse<CustomerDetailResponse> = await api.get(`/users/${customerId}`);
      return response.data.detail;
    },
    enabled: !!customerId,
    ...options,
  });
};

// Types for customer update
export interface UpdateCustomerRequest {
  fullName?: string;
  email?: string;
  numberPhone?: string;
  active?: boolean;
}

export interface UpdateCustomerResponse {
  messenger: string;
  status: number;
  detail: Customer;
  instance: string;
}

export interface DeleteCustomerResponse {
  messenger: string;
  status: number;
  detail: string;
  instance: string;
}

// Types for creating customer
export interface CreateCustomerRequest {
  fullName: string;
  email: string;
  numberPhone: string;
  // Không cần password và active - API tự động tạo
}

export interface CreateCustomerResponse {
  messenger: string;
  status: number;
  detail: {
    userId: number;
    customerId: number;
    email: string;
    fullName: string;
    numberPhone: string;
    active: boolean;
    roleName: 'CUSTOMER' | 'ADMIN' | 'STAFF';
  };
  instance: string;
}

/**
 * Hook để tạo khách hàng mới (POST /api/admin/users)
 */
export const useCreateCustomerMutation = (
  options?: UseMutationOptions<Customer, AxiosError, CreateCustomerRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerRequest): Promise<Customer> => {
      const response: AxiosResponse<CreateCustomerResponse> = await api.post('/admin/users', data);
      // Map response detail to Customer format
      const detail = response.data.detail;
      return {
        userId: detail.userId,
        customerId: detail.customerId,
        email: detail.email,
        fullName: detail.fullName,
        numberPhone: detail.numberPhone,
        active: detail.active,
        roleName: detail.roleName,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    ...options,
  });
};

/**
 * Hook để cập nhật thông tin khách hàng (PUT /api/users/{id})
 */
export const useUpdateCustomerMutation = (
  options?: UseMutationOptions<
    Customer,
    AxiosError,
    { customerId: number; data: UpdateCustomerRequest }
  >
) => {
  return useMutation({
    mutationFn: async ({
      customerId,
      data,
    }: {
      customerId: number;
      data: UpdateCustomerRequest;
    }): Promise<Customer> => {
      const response: AxiosResponse<UpdateCustomerResponse> = await api.put(
        `/users/${customerId}`,
        data
      );
      return response.data.detail;
    },
    ...options,
  });
};

/**
 * Hook để xóa khách hàng (DELETE /api/admin/users/{id})
 */
export const useDeleteCustomerMutation = (
  options?: UseMutationOptions<string, AxiosError, number>
) => {
  return useMutation({
    mutationFn: async (customerId: number): Promise<string> => {
      const response: AxiosResponse<DeleteCustomerResponse> = await api.delete(
        `/admin/users/${customerId}`
      );
      return response.data.detail;
    },
    ...options,
  });
};

// ================== ADMIN API HOOKS ==================

// Admin Booking interfaces matching API response
export interface AdminBookingResponse {
  messenger: string;
  status: number;
  detail: {
    content: AdminBooking[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
  instance: string;
}

export interface AdminBooking {
  id: number;
  bookingCode: string;
  court: {
    id: number;
    courtName: string;
    courtType: 'INDOOR' | 'OUTDOOR';
    hourlyRate: number;
    description?: string;
    images?: string[];
    isActive: boolean;
    status: 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
  };
  customer: {
    customerId: number;
    numberPhone: string;
    email: string;
    fullname: string;
  };
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalAmount: number;
  paymentStatus: 'PAID' | 'UNPAID';
  paymentMethod?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

// Admin booking query parameters
export interface AdminBookingParams {
  month?: number;
  year?: number;
  week?: number;
  day?: string; // format: YYYY-MM-DD
}

/**
 * Hook để lấy admin bookings với các filter parameters
 */
export const useAdminBookings = (
  params?: AdminBookingParams,
  options?: UseQueryOptions<AdminBooking[], AxiosError>
) => {
  return useQuery({
    queryKey: ['adminBookings', params],
    queryFn: async (): Promise<AdminBooking[]> => {
      const searchParams = new URLSearchParams();

      if (params?.month) searchParams.append('month', params.month.toString());
      if (params?.year) searchParams.append('year', params.year.toString());
      if (params?.week) searchParams.append('week', params.week.toString());
      if (params?.day) searchParams.append('day', params.day);

      const url = `/admin/bookings${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response: AxiosResponse<AdminBookingResponse> = await api.get(url);

      // Extract content array from paginated response
      return response.data.detail.content;
    },
    ...options,
  });
};

// Payment API hooks
export interface ProcessPaymentRequest {
  bookingId: number;
  method: 'COD' | 'TRANSFER';
}

export interface ProcessPaymentResponse {
  messenger: string;
  status: number;
  detail: AdminBooking;
  instance: string;
}

/**
 * Hook để xử lý thanh toán booking (admin only)
 */
export const useProcessPaymentMutation = (
  options?: UseMutationOptions<AdminBooking, AxiosError, ProcessPaymentRequest>
) => {
  return useMutation({
    mutationFn: async ({ bookingId, method }: ProcessPaymentRequest): Promise<AdminBooking> => {
      const response: AxiosResponse<ProcessPaymentResponse> = await api.post(
        `/admin/bookings/${bookingId}/pay?method=${method}`
      );
      return response.data.detail;
    },
    ...options,
  });
};

// Create Admin Booking API hooks
export interface CreateAdminBookingRequest {
  courtId: number;
  email: string;
  numberPhone: string;
  fullName: string;
  bookingDate: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface CreateAdminBookingResponse {
  messenger: string;
  status: number;
  detail: AdminBooking;
  instance: string;
}

/**
 * Hook để tạo booking mới (admin only) - POST /admin/bookings
 */
export const useCreateAdminBookingMutation = (
  options?: UseMutationOptions<AdminBooking, AxiosError, CreateAdminBookingRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: CreateAdminBookingRequest): Promise<AdminBooking> => {
      const response: AxiosResponse<CreateAdminBookingResponse> = await api.post(
        '/admin/bookings',
        bookingData
      );
      return response.data.detail;
    },
    onSuccess: () => {
      // Invalidate admin bookings queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
    },
    ...options,
  });
};

// Update booking status API hooks
export interface UpdateBookingStatusRequest {
  bookingId: number;
  newStatus: 'CANCELLED' | 'CONFIRMED';
}

export interface UpdateBookingStatusResponse {
  messenger: string;
  status: number;
  detail: AdminBooking;
  instance: string;
}

/**
 * Hook để update trạng thái booking (admin only)
 */
export const useUpdateBookingStatusMutation = (
  options?: UseMutationOptions<AdminBooking, AxiosError, UpdateBookingStatusRequest>
) => {
  return useMutation({
    mutationFn: async ({
      bookingId,
      newStatus,
    }: UpdateBookingStatusRequest): Promise<AdminBooking> => {
      const response: AxiosResponse<UpdateBookingStatusResponse> = await api.put(
        `/admin/bookings/${bookingId}/status?newStatus=${newStatus}`
      );
      return response.data.detail;
    },
    ...options,
  });
};

/**
 * Hook để lấy tất cả bookings (admin only) - legacy
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

// ================== CHAT API HOOKS ==================

/**
 * Hook để gửi tin nhắn chat tới AI
 */
export const useChatMutation = (
  options?: UseMutationOptions<ChatResponse, AxiosError, ChatRequest>
) => {
  return useMutation({
    mutationFn: async (chatData: ChatRequest): Promise<ChatResponse> => {
      const response: AxiosResponse<ChatResponse> = await api.post('/chat', chatData);
      return response.data;
    },
    ...options,
  });
};

// ================== DASHBOARD API HOOKS ==================

/**
 * Hook để lấy dashboard data theo ngày
 */
export const useDashboardDaily = (
  params: DashboardDailyParams,
  options?: UseQueryOptions<DashboardData, AxiosError>
) => {
  return useQuery({
    queryKey: ['dashboard', 'daily', params.date],
    queryFn: async (): Promise<DashboardData> => {
      const response: AxiosResponse<DashboardData> = await api.get('/dashboard/date', {
        params: { date: params.date },
      });
      return response.data;
    },
    enabled: !!params.date,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

/**
 * Hook để lấy dashboard data theo tháng
 */
export const useDashboardMonthly = (
  params: DashboardMonthlyParams,
  options?: UseQueryOptions<DashboardData, AxiosError>
) => {
  return useQuery({
    queryKey: ['dashboard', 'monthly', params.month, params.year],
    queryFn: async (): Promise<DashboardData> => {
      const response: AxiosResponse<DashboardData> = await api.get('/dashboard/month', {
        params: { month: params.month, year: params.year },
      });
      return response.data;
    },
    enabled: !!(params.month && params.year),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

// ================== BRANCH API HOOKS ==================

export interface Branch {
  id: number;
  branchName: string;
  address: string;
  phone: string;
  isActive: boolean;
  managerId: number;
}

export interface BranchListResponse {
  messenger: string;
  status: number;
  detail: {
    content: Branch[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
  instance: string;
}

export interface BranchManager {
  userId: number;
  customerId: number | null;
  email: string;
  fullName: string;
  numberPhone: string | null;
  active: boolean;
  roleName: 'STAFF' | 'CUSTOMER' | 'ADMIN';
}

export interface BranchManagerResponse {
  messenger: string;
  status: number;
  detail: BranchManager;
  instance: string;
}

/**
 * Hook để lấy danh sách chi nhánh (admin only) với pagination
 */
export const useBranches = (
  params?: PaginationParams,
  options?: UseQueryOptions<{ branches: Branch[]; pagination: PaginationInfo }, AxiosError>
) => {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: async (): Promise<{ branches: Branch[]; pagination: PaginationInfo }> => {
      const response: AxiosResponse<BranchListResponse> = await api.get('/admin/branches', {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
        },
      });

      const { content, pageNumber, pageSize, totalElements, totalPages, first, last } =
        response.data.detail;

      return {
        branches: content,
        pagination: {
          pageNumber,
          pageSize,
          totalElements,
          totalPages,
          first,
          last,
        },
      };
    },
    ...options,
  });
};

/**
 * Hook để lấy thông tin quản lý chi nhánh
 */
export const useBranchManager = (
  managerId: number,
  options?: UseQueryOptions<BranchManager, AxiosError>
) => {
  return useQuery({
    queryKey: ['branch-manager', managerId],
    queryFn: async (): Promise<BranchManager> => {
      const response: AxiosResponse<BranchManagerResponse> = await api.get(
        `/admin/users/${managerId}`
      );
      return response.data.detail;
    },
    enabled: !!managerId,
    ...options,
  });
};

// Branch create/update types
export interface CreateBranchRequest {
  branchName: string;
  address: string;
  phone: string;
}

export interface CreateBranchResponse {
  messenger: string;
  status: number;
  detail: Branch;
  instance: string;
}

/**
 * Hook để tạo chi nhánh mới (admin only)
 * POST /admin/branches/create-with-manager
 * Tự động tạo tài khoản manager cho chi nhánh
 */
export const useCreateBranchMutation = (
  options?: UseMutationOptions<Branch, AxiosError, CreateBranchRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branchData: CreateBranchRequest): Promise<Branch> => {
      const response: AxiosResponse<CreateBranchResponse> = await api.post(
        '/admin/branches/create-with-manager',
        branchData
      );
      return response.data.detail;
    },
    onSuccess: () => {
      // Invalidate branches list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    ...options,
  });
};

export interface UpdateBranchRequest {
  branchName?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateBranchResponse {
  messenger: string;
  status: number;
  detail: Branch;
  instance: string;
}

/**
 * Hook để cập nhật thông tin chi nhánh (admin only)
 * PUT /admin/branches/{branchId}
 */
export const useUpdateBranchMutation = (
  options?: UseMutationOptions<Branch, AxiosError, { branchId: number; data: UpdateBranchRequest }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      branchId,
      data,
    }: {
      branchId: number;
      data: UpdateBranchRequest;
    }): Promise<Branch> => {
      const response: AxiosResponse<UpdateBranchResponse> = await api.put(
        `/admin/branches/${branchId}`,
        data
      );
      return response.data.detail;
    },
    onSuccess: () => {
      // Invalidate branches list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    ...options,
  });
};

export interface DeleteBranchResponse {
  messenger: string;
  status: number;
  detail: null;
  instance: string;
}

/**
 * Hook để xóa chi nhánh (admin only)
 * DELETE /admin/branches/{branchId}
 */
export const useDeleteBranchMutation = (options?: UseMutationOptions<void, AxiosError, number>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branchId: number): Promise<void> => {
      await api.delete(`/admin/branches/${branchId}`);
    },
    onSuccess: () => {
      // Invalidate branches list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    ...options,
  });
};
