import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar.css';
import { Box, Typography, Card } from '@mui/material';
import { useForm } from 'react-hook-form';
import { format, parseISO } from 'date-fns';

// API hooks
import {
  useAdminBookings,
  useProcessPaymentMutation,
  useUpdateBookingStatusMutation,
  useCreateAdminBookingMutation,
  useCourts,
  useCustomers,
} from '../../hooks/useApi';
import type {
  AdminBooking,
  AdminBookingParams,
  CreateAdminBookingRequest,
} from '../../hooks/useApi';

// Extracted components
import { BookingStatsCards } from '../../components/admin/bookings/BookingStatsCards';
import { BookingDialog } from '../../components/admin/bookings/BookingDialog';
import { PaymentDialog } from '../../components/admin/bookings/PaymentDialog';
import { CalendarControls } from '../../components/admin/bookings/CalendarControls';

// Set up the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

// Mapping function: Convert AdminBooking to legacy Booking format for components
const mapAdminBookingToBooking = (adminBooking: AdminBooking): Booking => {
  return {
    booking_id: adminBooking.id,
    booking_code: adminBooking.bookingCode,
    customer_id: adminBooking.customer.customerId,
    court_id: adminBooking.court.id,
    booking_date: adminBooking.bookingDate,
    start_time: adminBooking.startTime,
    end_time: adminBooking.endTime,
    status: adminBooking.status.toLowerCase() as 'pending' | 'confirmed' | 'cancelled',
    total_amount: adminBooking.totalAmount,
    customer_name: adminBooking.customer.fullname,
    court_name: adminBooking.court.courtName,
    payment_status: adminBooking.paymentStatus.toLowerCase() as 'unpaid' | 'paid',
    transaction: undefined, // TODO: Add transaction mapping if needed
  };
};

// Payment status interface
interface Transaction {
  transaction_id: number;
  amount: number;
  transaction_date: string;
  payment_method: 'cash' | 'transfer';
  booking_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

// Legacy Booking interface (for compatibility with existing components)
interface Booking {
  booking_id: number;
  booking_code: string;
  customer_id: number;
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_amount: number;
  customer_name?: string;
  court_name?: string;
  payment_status?: 'unpaid' | 'paid';
  transaction?: Transaction;
}

// Calendar event interface
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}

// Form data interface
interface BookingFormData {
  customer_id: number;
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  // For new customer creation
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  is_new_customer?: string;
}

// Payment form data interface
interface PaymentFormData {
  amount: number;
  payment_method: 'cash' | 'transfer';
  transaction_date: string;
}

export const AdminBookingsPage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showConflicts, setShowConflicts] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<number | 'all'>('all');

  // Payment dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);

  // Calculate API params based on current calendar view
  const apiParams = useMemo((): AdminBookingParams => {
    const currentMoment = moment(currentDate);

    switch (currentView) {
      case Views.MONTH:
        return {
          month: currentMoment.month() + 1, // moment month is 0-indexed
          year: currentMoment.year(),
        };
      case Views.WEEK:
        return {
          year: currentMoment.year(),
          week: currentMoment.week(),
        };
      case Views.DAY:
        return {
          day: currentMoment.format('YYYY-MM-DD'),
        };
      default:
        // Default to current month
        return {
          month: currentMoment.month() + 1,
          year: currentMoment.year(),
        };
    }
  }, [currentView, currentDate]);

  // Fetch bookings using API
  const { data: adminBookings = [], isLoading, error, refetch } = useAdminBookings(apiParams);

  // Fetch courts and customers using API
  const { data: courtsData } = useCourts();
  const { data: customersData } = useCustomers();

  // Convert API Court format to component expected format
  const mappedCourts = useMemo(() => {
    const courtsArray = courtsData?.courts || [];
    return courtsArray.map((court) => ({
      court_id: court.id,
      court_name: court.courtName,
      court_type: court.courtType === 'INDOOR' ? 'Trong nhà' : 'Ngoài trời',
      hourly_rate: court.hourlyRate,
    }));
  }, [courtsData]);

  // Convert API Customer format to component expected format
  const mappedCustomers = useMemo(() => {
    const customersArray = customersData?.customers || [];
    return customersArray.map((customer) => ({
      customer_id: customer.customerId,
      user_id: customer.userId,
      full_name: customer.fullName,
      phone: customer.numberPhone,
      email: customer.email, // Add email field for API
    }));
  }, [customersData?.customers]);

  // Customer search query is handled within BookingDialog component
  // No need for filtering logic here

  // Payment mutation
  const processPaymentMutation = useProcessPaymentMutation({
    onSuccess: (updatedBooking) => {
      console.log('Payment successful:', updatedBooking);
      refetch(); // Refresh booking data after successful payment
      setIsPaymentDialogOpen(false);
      setSelectedBookingForPayment(null);
      resetPayment();
      // TODO: Add success toast/notification
    },
    onError: (error) => {
      console.error('Payment failed:', error);
      // TODO: Add error toast/notification showing error.message
    },
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useUpdateBookingStatusMutation({
    onSuccess: (updatedBooking) => {
      console.log('Booking status updated successfully:', updatedBooking);
      refetch(); // Refresh booking data after successful status update
      setIsDialogOpen(false);
      setSelectedEvent(null);
      // TODO: Add success toast/notification
    },
    onError: (error) => {
      console.error('Booking status update failed:', error);
      // TODO: Add error toast/notification showing error.message
    },
  });

  // Create booking mutation
  const createBookingMutation = useCreateAdminBookingMutation({
    onSuccess: (newBooking) => {
      console.log('Booking created successfully:', newBooking);
      refetch(); // Refresh booking data after successful creation
      setIsDialogOpen(false);
      reset();
      resetCustomerForm();
      // TODO: Add success toast/notification
    },
    onError: (error) => {
      console.error('Booking creation failed:', error);
      // TODO: Add error toast/notification showing error.message
    },
  });

  // Convert API data to legacy format for existing components
  const bookings = useMemo(() => {
    return adminBookings.map(mapAdminBookingToBooking);
  }, [adminBookings]);

  const { reset, watch } = useForm<BookingFormData>();

  // Payment form
  const { reset: resetPayment } = useForm<PaymentFormData>();

  // Watch form values for conflict detection
  const watchedValues = watch();

  // Reset customer form when switching modes
  const resetCustomerForm = useCallback(() => {
    // Customer search is now handled within BookingDialog component
  }, []);

  // Handle payment processing
  const handleOpenPaymentDialog = (booking: Booking) => {
    setSelectedBookingForPayment(booking);
    resetPayment({
      amount: booking.total_amount,
      payment_method: 'cash',
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
    });
    setIsPaymentDialogOpen(true);
  };

  const onPaymentSubmit = useCallback(
    (data: PaymentFormData) => {
      if (!selectedBookingForPayment) return;

      // Map payment method: 'cash' -> 'COD', 'transfer' -> 'TRANSFER'
      const apiMethod = data.payment_method === 'cash' ? 'COD' : 'TRANSFER';

      processPaymentMutation.mutate({
        bookingId: selectedBookingForPayment.booking_id,
        method: apiMethod,
      });
    },
    [selectedBookingForPayment, processPaymentMutation]
  );

  const handleMarkUnpaid = (booking: Booking) => {
    // TODO: Call mark unpaid API with booking.booking_id
    console.log('Mark unpaid booking:', booking.booking_id);
    refetch();
  };

  // Convert bookings to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return bookings
      .filter((booking) => selectedCourt === 'all' || booking.court_id === selectedCourt)
      .map((booking) => {
        const bookingDate = parseISO(booking.booking_date);
        const [startHour, startMinute] = booking.start_time.split(':').map(Number);
        const [endHour, endMinute] = booking.end_time.split(':').map(Number);

        const start = new Date(bookingDate);
        start.setHours(startHour, startMinute, 0, 0);

        const end = new Date(bookingDate);
        end.setHours(endHour, endMinute, 0, 0);

        return {
          id: booking.booking_id,
          title: `${booking.court_name} - ${booking.customer_name}${
            booking.payment_status === 'paid'
              ? ' ✓'
              : booking.payment_status === 'unpaid'
                ? ' ⚠'
                : ''
          }`,
          start,
          end,
          resource: booking,
        };
      });
  }, [bookings, selectedCourt]);

  // Check for booking conflicts
  const checkConflicts = useCallback(
    (
      courtId: number,
      date: string,
      startTime: string,
      endTime: string,
      excludeBookingId?: number
    ): boolean => {
      const newStart = moment(`${date} ${startTime}`);
      const newEnd = moment(`${date} ${endTime}`);

      return bookings.some((booking) => {
        if (booking.court_id !== courtId || booking.booking_id === excludeBookingId) {
          return false;
        }

        if (booking.booking_date !== date) {
          return false;
        }

        const existingStart = moment(`${booking.booking_date} ${booking.start_time}`);
        const existingEnd = moment(`${booking.booking_date} ${booking.end_time}`);

        // Check if time ranges overlap
        return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
      });
    },
    [bookings]
  );

  // Get conflicts for current form values
  const currentConflicts = useMemo(() => {
    if (
      !watchedValues.court_id ||
      !watchedValues.booking_date ||
      !watchedValues.start_time ||
      !watchedValues.end_time
    ) {
      return false;
    }

    return checkConflicts(
      watchedValues.court_id,
      watchedValues.booking_date,
      watchedValues.start_time,
      watchedValues.end_time,
      selectedEvent?.resource.booking_id
    );
  }, [watchedValues, checkConflicts, selectedEvent]);

  // Handle event selection - only view details, no editing
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      setSelectedEvent(event);
      setIsAddMode(false);
      // Just show booking details, no editing
      resetCustomerForm();
      setIsDialogOpen(true);
    },
    [resetCustomerForm]
  );

  // Handle slot selection for adding new booking
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setSelectedEvent(null);
      setIsAddMode(true);

      // Set default values for new booking
      reset({
        customer_id: 0,
        court_id:
          selectedCourt === 'all' ? mappedCourts[0]?.court_id || 1 : (selectedCourt as number),
        booking_date: format(start, 'yyyy-MM-dd'),
        start_time: format(start, 'HH:mm'),
        end_time: format(end, 'HH:mm'),
        status: 'confirmed',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        is_new_customer: 'false',
      });

      resetCustomerForm();
      setIsDialogOpen(true);
    },
    [reset, selectedCourt, resetCustomerForm, mappedCourts]
  );

  // Handle form submission
  const onSubmit = useCallback(
    (data: BookingFormData) => {
      if (currentConflicts) {
        alert('Có xung đột lịch đặt sân! Vui lòng chọn thời gian khác.');
        return;
      }

      let customer;
      const court = mappedCourts.find((c) => c.court_id === data.court_id);

      if (!court) {
        alert('Không tìm thấy sân!');
        return;
      }

      // Handle customer - existing or new
      if (data.is_new_customer === 'true') {
        // Validate new customer data
        if (!data.customer_name?.trim() || !data.customer_phone?.trim()) {
          alert('Vui lòng nhập đầy đủ thông tin khách hàng mới!');
          return;
        }

        // Check if phone already exists
        const existingCustomer = mappedCustomers.find((c) => c.phone === data.customer_phone);
        if (existingCustomer) {
          alert('Số điện thoại này đã được đăng ký! Vui lòng sử dụng tính năng tìm khách hàng.');
          return;
        }

        // Create new customer (in real app, this would be API call)
        const newCustomerId = Math.max(...mappedCustomers.map((c) => c.customer_id), 0) + 1;
        const newUserId = Math.max(...mappedCustomers.map((c) => c.user_id), 0) + 1;

        customer = {
          customer_id: newCustomerId,
          user_id: newUserId,
          full_name: data.customer_name || '',
          phone: data.customer_phone || '',
        };

        // TODO: In real app, call API to create new customer
        // For now, just use the temporary customer object

        // Update form data with new customer ID
        data.customer_id = newCustomerId;
      } else {
        customer = mappedCustomers.find((c) => c.customer_id === data.customer_id);
        if (!customer) {
          alert('Vui lòng chọn khách hàng!');
          return;
        }
      }

      // Calculate total amount (simple calculation)
      const startTime = moment(`${data.booking_date} ${data.start_time}`);
      const endTime = moment(`${data.booking_date} ${data.end_time}`);
      const hours = endTime.diff(startTime, 'hours', true);
      const totalAmount = hours * court.hourly_rate;

      if (isAddMode) {
        // Prepare data for API call
        let apiData: CreateAdminBookingRequest;

        if (data.is_new_customer === 'true') {
          // New customer - use form data directly
          if (
            !data.customer_name?.trim() ||
            !data.customer_phone?.trim() ||
            !data.customer_email?.trim()
          ) {
            alert('Vui lòng nhập đầy đủ thông tin khách hàng mới (bao gồm email)!');
            return;
          }

          apiData = {
            courtId: data.court_id,
            email: data.customer_email,
            numberPhone: data.customer_phone,
            fullName: data.customer_name,
            bookingDate: data.booking_date,
            startTime: data.start_time,
            endTime: data.end_time,
          };
        } else {
          // Existing customer - use customer details
          // Email validation is handled in BookingDialog component

          apiData = {
            courtId: data.court_id,
            email: customer.email || '', // Use empty string as fallback
            numberPhone: customer.phone,
            fullName: customer.full_name,
            bookingDate: data.booking_date,
            startTime: data.start_time,
            endTime: data.end_time,
          };
        }

        // Call API to create booking
        createBookingMutation.mutate(apiData);
        return; // Exit early, success/error will be handled by mutation callbacks
      } else if (selectedEvent) {
        // TODO: Call update booking API here
        refetch();
      }

      setIsDialogOpen(false);
      reset();
      resetCustomerForm();
    },
    [
      currentConflicts,
      isAddMode,
      selectedEvent,
      reset,
      refetch,
      mappedCourts,
      mappedCustomers,
      resetCustomerForm,
      createBookingMutation,
    ]
  );

  // Handle delete booking
  const handleDeleteBooking = useCallback(() => {
    if (selectedEvent) {
      // TODO: Call delete booking API here
      refetch();
      setIsDialogOpen(false);
      reset();
    }
  }, [selectedEvent, reset, refetch]);

  // Handle confirm booking (pending -> confirmed)
  const handleConfirmBooking = useCallback(() => {
    if (selectedEvent && selectedEvent.resource.status === 'pending') {
      updateBookingStatusMutation.mutate({
        bookingId: selectedEvent.resource.booking_id,
        newStatus: 'CONFIRMED',
      });
    }
  }, [selectedEvent, updateBookingStatusMutation]);

  // Handle cancel booking (pending/confirmed -> cancelled)
  const handleCancelBooking = useCallback(() => {
    if (selectedEvent) {
      updateBookingStatusMutation.mutate({
        bookingId: selectedEvent.resource.booking_id,
        newStatus: 'CANCELLED',
      });
    }
  }, [selectedEvent, updateBookingStatusMutation]);

  // Event style getter for conflicts, status and payment
  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      const booking = event.resource;
      let backgroundColor = '#3174ad';
      let border = '0px';

      // Color by status
      switch (booking.status) {
        case 'confirmed':
          backgroundColor = '#4caf50';
          break;
        case 'pending':
          backgroundColor = '#ff9800';
          break;
        case 'cancelled':
          backgroundColor = '#f44336';
          break;
      }

      // // Add payment status indicator
      // if (booking.payment_status === 'unpaid' && booking.status === 'confirmed') {
      //   border = '3px dashed #f44336'; // Red dashed border for unpaid
      //   backgroundColor = '#ff5722'; // Orange-red for unpaid confirmed bookings
      // } else if (booking.payment_status === 'paid') {
      //   border = '2px solid #4caf50'; // Green solid border for paid
      // }

      // Check for conflicts if enabled
      if (showConflicts) {
        const hasConflict = checkConflicts(
          booking.court_id,
          booking.booking_date,
          booking.start_time,
          booking.end_time,
          booking.booking_id
        );

        if (hasConflict) {
          backgroundColor = '#d32f2f';
          border = '3px solid #b71c1c';
        }
      }

      return {
        style: {
          backgroundColor,
          borderRadius: '4px',
          opacity: 0.8,
          color: 'white',
          border,
          display: 'block',
        },
      };
    },
    [checkConflicts, showConflicts]
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
          Quản lý đặt sân
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi các đơn đặt sân cầu lông
        </Typography>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="body1">Đang tải dữ liệu...</Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error">Lỗi khi tải dữ liệu: {error.message}</Typography>
        </Box>
      )}

      {/* Stats Cards */}
      <BookingStatsCards bookings={bookings} />

      {/* Controls */}
      <CalendarControls
        showConflicts={showConflicts}
        onShowConflictsChange={setShowConflicts}
        selectedCourt={selectedCourt}
        onSelectedCourtChange={setSelectedCourt}
        courts={mappedCourts}
        onRefresh={() => {
          refetch();
        }}
        onAddBooking={() => {
          setSelectedEvent(null);
          setIsAddMode(true);
          reset({
            customer_id: 0,
            court_id: mappedCourts[0]?.court_id || 1,
            booking_date: format(new Date(), 'yyyy-MM-dd'),
            start_time: '08:00',
            end_time: '10:00',
            status: 'confirmed',
            customer_name: '',
            customer_phone: '',
            customer_email: '',
            is_new_customer: 'false',
          });
          resetCustomerForm();
          setIsDialogOpen(true);
        }}
      />

      {/* Calendar */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 3 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            eventPropGetter={eventStyleGetter}
            step={30}
            timeslots={2}
            min={new Date(0, 0, 0, 6, 0, 0)} // 6 AM
            max={new Date(0, 0, 0, 23, 0, 0)} // 11 PM
            messages={{
              next: 'Tiếp',
              previous: 'Trước',
              today: 'Hôm nay',
              month: 'Tháng',
              week: 'Tuần',
              day: 'Ngày',
              agenda: 'Lịch trình',
              date: 'Ngày',
              time: 'Thời gian',
              event: 'Sự kiện',
              noEventsInRange: 'Không có đặt sân nào trong khoảng thời gian này.',
              showMore: (total) => `+ Xem thêm ${total}`,
            }}
          />
        </Box>
      </Card>

      {/* Booking Dialog */}
      <BookingDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={onSubmit}
        onDeleteBooking={handleDeleteBooking}
        onConfirmBooking={handleConfirmBooking}
        onCancelBooking={handleCancelBooking}
        onOpenPaymentDialog={handleOpenPaymentDialog}
        isAddMode={isAddMode}
        selectedEvent={selectedEvent}
        courts={mappedCourts}
        customers={mappedCustomers}
        currentConflicts={currentConflicts}
        isStatusLoading={updateBookingStatusMutation.isPending}
        isSubmitLoading={createBookingMutation.isPending}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={isPaymentDialogOpen}
        onClose={() => {
          setIsPaymentDialogOpen(false);
          setSelectedBookingForPayment(null);
        }}
        onSubmit={onPaymentSubmit}
        onMarkUnpaid={handleMarkUnpaid}
        selectedBooking={selectedBookingForPayment}
        isLoading={processPaymentMutation.isPending}
      />
    </Box>
  );
};
