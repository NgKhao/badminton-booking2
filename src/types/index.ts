// Enums based on database
export type UserRole = 'customer' | 'admin';
export type CourtStatus = 'available' | 'maintenance' | 'unavailable';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type EmailStatus = 'sent' | 'failed' | 'pending';

// User types
export interface User {
  user_id: number;
  email: string;
  full_name?: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  customer_id: number;
  user_id: number;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Court types
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

// Booking types
export interface Booking {
  booking_id: number;
  booking_code?: string;
  customer_id: number;
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_amount?: number;
  created_at: string;
  updated_at: string;
  court?: Court;
  customer?: Customer;
}

// Service types
export interface Service {
  service_id: number;
  service_name: string;
  service_type?: string;
  description?: string;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

// Transaction types
export interface Transaction {
  transaction_id: number;
  amount: number;
  transaction_date: string;
  payment_method?: string;
  booking_id?: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

// AI Chat types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  ai_conversation_id: number;
  customer_id?: number;
  conversation_content?: string;
  messages?: ChatMessage[];
  ai_recommendations?: string;
  weather_data?: WeatherData;
  created_at: string;
}

// UI State types
export interface AuthState {
  user: User | null;
  customer: Customer | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface BookingFormData {
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  price: number;
}

// Court availability API types
export interface AvailabilitySlot {
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
}

export interface CourtAvailabilityParams {
  courtId: number;
  date: string; // Format: "YYYY-MM-DD"
}

// New Booking API types
export interface BookingCustomer {
  customerId: number;
  numberPhone: string;
  email: string;
  fullname: string;
}

export interface NewBookingRequest {
  court: {
    id: number;
  };
  bookingDate: string; // Format: "YYYY-MM-DD"
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
}

export interface NewBookingResponse {
  id: number;
  bookingCode: string;
  court: Court;
  customer: BookingCustomer;
  bookingDate: string;
  startTime: string; // Format: "HH:mm:ss"
  endTime: string; // Format: "HH:mm:ss"
  duration: number;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string | null;
}
