import { create } from 'zustand';
import type { Booking, Court, WeatherData } from '../types';

interface BookingStore {
  selectedCourt: Court | null;
  selectedDate: string;
  selectedTimeSlot: { start_time: string; end_time: string } | null;
  bookings: Booking[];
  loading: boolean;
  weatherData: WeatherData | null;

  // Actions
  setSelectedCourt: (court: Court | null) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTimeSlot: (timeSlot: { start_time: string; end_time: string } | null) => void;
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: number, updates: Partial<Booking>) => void;
  setLoading: (loading: boolean) => void;
  setWeatherData: (weather: WeatherData | null) => void;
  clearSelection: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedCourt: null,
  selectedDate: '',
  selectedTimeSlot: null,
  bookings: [],
  loading: false,
  weatherData: null,

  setSelectedCourt: (court) => set({ selectedCourt: court }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (timeSlot) => set({ selectedTimeSlot: timeSlot }),
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBooking: (bookingId, updates) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.booking_id === bookingId ? { ...booking, ...updates } : booking
      ),
    })),
  setLoading: (loading) => set({ loading }),
  setWeatherData: (weather) => set({ weatherData: weather }),
  clearSelection: () =>
    set({
      selectedCourt: null,
      selectedDate: '',
      selectedTimeSlot: null,
    }),
}));
