import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar.css';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Autocomplete,
  Radio,
  RadioGroup,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Payment as PaymentIcon,
  Money as MoneyIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { format, parseISO } from 'date-fns';

// Set up the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

// Mock data for courts
const mockCourts = [
  { court_id: 1, court_name: 'Sân 1', court_type: 'Trong nhà', hourly_rate: 150000 },
  { court_id: 2, court_name: 'Sân 2', court_type: 'Trong nhà', hourly_rate: 150000 },
  { court_id: 3, court_name: 'Sân 3', court_type: 'Ngoài trời', hourly_rate: 120000 },
  { court_id: 4, court_name: 'Sân 4', court_type: 'Ngoài trời', hourly_rate: 120000 },
];

// Mock data for customers
const mockCustomers = [
  { customer_id: 1, user_id: 1, full_name: 'Nguyễn Văn A', phone: '0123456789' },
  { customer_id: 2, user_id: 2, full_name: 'Trần Thị B', phone: '0987654321' },
  { customer_id: 3, user_id: 3, full_name: 'Lê Văn C', phone: '0123456788' },
];

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

// Booking interface
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
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  is_new_customer: boolean;
}

// Payment form data interface
interface PaymentFormData {
  amount: number;
  payment_method: 'cash' | 'transfer';
  transaction_date: string;
}

// Mock booking data
const mockBookings: Booking[] = [
  {
    booking_id: 1,
    booking_code: 'BK001',
    customer_id: 1,
    court_id: 1,
    booking_date: '2025-09-07',
    start_time: '08:00',
    end_time: '10:00',
    status: 'confirmed',
    total_amount: 300000,
    customer_name: 'Nguyễn Văn A',
    court_name: 'Sân 1',
    payment_status: 'paid',
    transaction: {
      transaction_id: 1,
      amount: 300000,
      transaction_date: '2025-09-07',
      payment_method: 'cash',
      booking_id: 1,
      created_by: 1,
      created_at: '2025-09-07T08:00:00Z',
      updated_at: '2025-09-07T08:00:00Z',
    },
  },
  {
    booking_id: 2,
    booking_code: 'BK002',
    customer_id: 2,
    court_id: 2,
    booking_date: '2025-09-07',
    start_time: '14:00',
    end_time: '16:00',
    status: 'pending',
    total_amount: 300000,
    customer_name: 'Trần Thị B',
    court_name: 'Sân 2',
    payment_status: 'unpaid',
  },
  {
    booking_id: 3,
    booking_code: 'BK003',
    customer_id: 1,
    court_id: 1,
    booking_date: '2025-09-08',
    start_time: '09:00',
    end_time: '11:00',
    status: 'confirmed',
    total_amount: 300000,
    customer_name: 'Nguyễn Văn A',
    court_name: 'Sân 1',
    payment_status: 'unpaid',
  },
];

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showConflicts, setShowConflicts] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<number | 'all'>('all');

  // Customer search states
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState(mockCustomers);

  // Payment dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>();

  // Payment form
  const {
    control: paymentControl,
    handleSubmit: submitPayment,
    reset: resetPayment,
    formState: { errors: paymentErrors },
  } = useForm<PaymentFormData>();

  // Watch form values for conflict detection
  const watchedValues = watch();

  // Filter customers based on search query
  React.useEffect(() => {
    if (!customerSearchQuery.trim()) {
      setFilteredCustomers(mockCustomers);
      return;
    }

    const filtered = mockCustomers.filter(
      (customer) =>
        customer.full_name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        customer.phone.includes(customerSearchQuery) ||
        customer.user_id.toString().includes(customerSearchQuery)
    );
    setFilteredCustomers(filtered);
  }, [customerSearchQuery]);

  // Reset customer form when switching modes
  const resetCustomerForm = () => {
    setCustomerSearchQuery('');
    setFilteredCustomers(mockCustomers);
  };

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

      // Create new transaction
      const newTransaction: Transaction = {
        transaction_id: Math.max(...bookings.map((b) => b.transaction?.transaction_id || 0)) + 1,
        amount: data.amount,
        transaction_date: data.transaction_date,
        payment_method: data.payment_method,
        booking_id: selectedBookingForPayment.booking_id,
        created_by: 1, // Admin user ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update booking with payment info
      setBookings((prev) =>
        prev.map((booking) =>
          booking.booking_id === selectedBookingForPayment.booking_id
            ? {
                ...booking,
                payment_status: 'paid' as const,
                transaction: newTransaction,
              }
            : booking
        )
      );

      setIsPaymentDialogOpen(false);
      setSelectedBookingForPayment(null);
      resetPayment();
    },
    [selectedBookingForPayment, bookings, resetPayment]
  );

  const handleMarkUnpaid = (booking: Booking) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.booking_id === booking.booking_id
          ? {
              ...b,
              payment_status: 'unpaid' as const,
              transaction: undefined,
            }
          : b
      )
    );
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

  // Handle event selection
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      setSelectedEvent(event);
      setIsAddMode(false);

      // Populate form with selected event data
      const booking = event.resource;
      reset({
        customer_id: booking.customer_id,
        court_id: booking.court_id,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status,
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        is_new_customer: false,
      });

      resetCustomerForm();
      setCustomerMode('existing');
      setIsDialogOpen(true);
    },
    [reset]
  );

  // Handle slot selection for adding new booking
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setSelectedEvent(null);
      setIsAddMode(true);

      // Set default values for new booking
      reset({
        customer_id: 0,
        court_id: selectedCourt === 'all' ? 1 : (selectedCourt as number),
        booking_date: format(start, 'yyyy-MM-dd'),
        start_time: format(start, 'HH:mm'),
        end_time: format(end, 'HH:mm'),
        status: 'pending',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        is_new_customer: false,
      });

      resetCustomerForm();
      setCustomerMode('existing');
      setIsDialogOpen(true);
    },
    [reset, selectedCourt]
  );

  // Handle form submission
  const onSubmit = useCallback(
    (data: BookingFormData) => {
      if (currentConflicts) {
        alert('Có xung đột lịch đặt sân! Vui lòng chọn thời gian khác.');
        return;
      }

      let customer;
      const court = mockCourts.find((c) => c.court_id === data.court_id);

      if (!court) {
        alert('Không tìm thấy sân!');
        return;
      }

      // Handle customer - existing or new
      if (data.is_new_customer) {
        // Validate new customer data
        if (!data.customer_name.trim() || !data.customer_phone.trim()) {
          alert('Vui lòng nhập đầy đủ thông tin khách hàng mới!');
          return;
        }

        // Check if phone already exists
        const existingCustomer = mockCustomers.find((c) => c.phone === data.customer_phone);
        if (existingCustomer) {
          alert('Số điện thoại này đã được đăng ký! Vui lòng sử dụng tính năng tìm khách hàng.');
          return;
        }

        // Create new customer (in real app, this would be API call)
        const newCustomerId = Math.max(...mockCustomers.map((c) => c.customer_id)) + 1;
        const newUserId = Math.max(...mockCustomers.map((c) => c.user_id)) + 1;

        customer = {
          customer_id: newCustomerId,
          user_id: newUserId,
          full_name: data.customer_name,
          phone: data.customer_phone,
        };

        // Add to mock data (in real app, this would be handled by backend)
        mockCustomers.push(customer);

        // Update form data with new customer ID
        data.customer_id = newCustomerId;
      } else {
        customer = mockCustomers.find((c) => c.customer_id === data.customer_id);
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
        // Add new booking
        const newBooking: Booking = {
          booking_id: Math.max(...bookings.map((b) => b.booking_id)) + 1,
          booking_code: `BK${String(Math.max(...bookings.map((b) => b.booking_id)) + 1).padStart(3, '0')}`,
          customer_id: data.customer_id,
          court_id: data.court_id,
          booking_date: data.booking_date,
          start_time: data.start_time,
          end_time: data.end_time,
          status: data.status,
          total_amount: totalAmount,
          customer_name: customer.full_name,
          court_name: court.court_name,
        };

        setBookings((prev) => [...prev, newBooking]);
      } else if (selectedEvent) {
        // Update existing booking
        setBookings((prev) =>
          prev.map((booking) =>
            booking.booking_id === selectedEvent.resource.booking_id
              ? {
                  ...booking,
                  customer_id: data.customer_id,
                  court_id: data.court_id,
                  booking_date: data.booking_date,
                  start_time: data.start_time,
                  end_time: data.end_time,
                  status: data.status,
                  total_amount: totalAmount,
                  customer_name: customer.full_name,
                  court_name: court.court_name,
                }
              : booking
          )
        );
      }

      setIsDialogOpen(false);
      reset();
      resetCustomerForm();
    },
    [currentConflicts, isAddMode, selectedEvent, bookings, reset]
  );

  // Handle delete booking
  const handleDeleteBooking = useCallback(() => {
    if (selectedEvent) {
      setBookings((prev) => prev.filter((b) => b.booking_id !== selectedEvent.resource.booking_id));
      setIsDialogOpen(false);
      reset();
    }
  }, [selectedEvent, reset]);

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

      // Add payment status indicator
      if (booking.payment_status === 'unpaid' && booking.status === 'confirmed') {
        border = '3px dashed #f44336'; // Red dashed border for unpaid
        backgroundColor = '#ff5722'; // Orange-red for unpaid confirmed bookings
      } else if (booking.payment_status === 'paid') {
        border = '2px solid #4caf50'; // Green solid border for paid
      }

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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Quản lý đặt sân
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={showConflicts}
                onChange={(e) => setShowConflicts(e.target.checked)}
                color="warning"
              />
            }
            label="Hiển thị xung đột"
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Lọc sân</InputLabel>
            <Select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value as number | 'all')}
              label="Lọc sân"
            >
              <MenuItem value="all">Tất cả sân</MenuItem>
              {mockCourts.map((court) => (
                <MenuItem key={court.court_id} value={court.court_id}>
                  {court.court_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedEvent(null);
              setIsAddMode(true);
              reset({
                customer_id: 0,
                court_id: 1,
                booking_date: format(new Date(), 'yyyy-MM-dd'),
                start_time: '08:00',
                end_time: '10:00',
                status: 'pending',
                customer_name: '',
                customer_phone: '',
                customer_email: '',
                is_new_customer: false,
              });
              resetCustomerForm();
              setCustomerMode('existing');
              setIsDialogOpen(true);
            }}
          >
            Thêm đặt sân
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 3,
          mb: 3,
        }}
      >
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" />
              <Box>
                <Typography variant="h6" component="div">
                  {bookings.filter((b) => b.status === 'confirmed').length}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Đã xác nhận
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" />
              <Box>
                <Typography variant="h6" component="div">
                  {bookings.filter((b) => b.status === 'pending').length}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Chờ xác nhận
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CancelIcon color="error" />
              <Box>
                <Typography variant="h6" component="div">
                  {bookings.filter((b) => b.status === 'cancelled').length}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Đã hủy
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RefreshIcon color="info" />
              <Box>
                <Typography variant="h6" component="div">
                  {new Set(bookings.map((b) => `${b.booking_date}-${b.court_id}`)).size}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Slot đã đặt
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Calendar */}
      <Paper sx={{ p: 2, height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
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
      </Paper>

      {/* Booking Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {isAddMode ? 'Thêm đặt sân mới' : 'Chỉnh sửa đặt sân'}
            {selectedEvent && (
              <Chip
                label={selectedEvent.resource.booking_code}
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </DialogTitle>

          <DialogContent>
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              {/* Conflict Warning */}
              {currentConflicts && (
                <Alert severity="error" icon={<WarningIcon />}>
                  <Typography variant="body2">
                    <strong>Cảnh báo xung đột lịch!</strong> Thời gian này đã có đặt sân khác cho
                    sân được chọn.
                  </Typography>
                </Alert>
              )}

              {/* Customer Selection Mode */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Thông tin khách hàng
                </Typography>
                <RadioGroup
                  value={customerMode}
                  onChange={(e) => {
                    setCustomerMode(e.target.value as 'existing' | 'new');
                    resetCustomerForm();
                  }}
                  row
                >
                  <FormControlLabel
                    value="existing"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SearchIcon fontSize="small" />
                        Tìm khách hàng có sẵn
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="new"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonAddIcon fontSize="small" />
                        Thêm khách hàng mới
                      </Box>
                    }
                  />
                </RadioGroup>
                <Divider sx={{ my: 2 }} />
              </Box>

              {/* Existing Customer Search */}
              {customerMode === 'existing' && (
                <Box>
                  {/* Search Box */}
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm theo tên, số điện thoại hoặc ID..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  {/* Customer Selection */}
                  <Controller
                    name="customer_id"
                    control={control}
                    rules={{
                      required: customerMode === 'existing' ? 'Vui lòng chọn khách hàng' : false,
                    }}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        options={filteredCustomers}
                        getOptionLabel={(option) =>
                          typeof option === 'object' ? `${option.full_name} - ${option.phone}` : ''
                        }
                        value={filteredCustomers.find((c) => c.customer_id === field.value) || null}
                        onChange={(_, value) => field.onChange(value?.customer_id || 0)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Chọn khách hàng"
                            error={!!errors.customer_id}
                            helperText={errors.customer_id?.message}
                            fullWidth
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {option.full_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.phone} • ID: {option.customer_id}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        noOptionsText="Không tìm thấy khách hàng"
                      />
                    )}
                  />
                </Box>
              )}

              {/* New Customer Form */}
              {customerMode === 'new' && (
                <Box>
                  <Controller
                    name="is_new_customer"
                    control={control}
                    render={({ field }) => <input type="hidden" {...field} value="true" />}
                  />

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Controller
                      name="customer_name"
                      control={control}
                      rules={{
                        required: customerMode === 'new' ? 'Vui lòng nhập tên khách hàng' : false,
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Tên khách hàng *"
                          error={!!errors.customer_name}
                          helperText={errors.customer_name?.message}
                          fullWidth
                        />
                      )}
                    />

                    <Controller
                      name="customer_phone"
                      control={control}
                      rules={{
                        required: customerMode === 'new' ? 'Vui lòng nhập số điện thoại' : false,
                        pattern: {
                          value: /^[0-9]{10,11}$/,
                          message: 'Số điện thoại không hợp lệ',
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Số điện thoại *"
                          error={!!errors.customer_phone}
                          helperText={errors.customer_phone?.message}
                          fullWidth
                        />
                      )}
                    />
                  </Box>

                  <Controller
                    name="customer_email"
                    control={control}
                    rules={{
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email không hợp lệ',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email (không bắt buộc)"
                        type="email"
                        error={!!errors.customer_email}
                        helperText={errors.customer_email?.message}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Court Selection */}
              <Controller
                name="court_id"
                control={control}
                rules={{ required: 'Vui lòng chọn sân' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.court_id}>
                    <InputLabel>Sân</InputLabel>
                    <Select {...field} label="Sân">
                      {mockCourts.map((court) => (
                        <MenuItem key={court.court_id} value={court.court_id}>
                          {court.court_name} - {court.court_type} (
                          {court.hourly_rate.toLocaleString('vi-VN')}đ/giờ)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              {/* Date and Time */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                <Controller
                  name="booking_date"
                  control={control}
                  rules={{ required: 'Vui lòng chọn ngày' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ngày đặt"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.booking_date}
                      helperText={errors.booking_date?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="start_time"
                  control={control}
                  rules={{ required: 'Vui lòng chọn giờ bắt đầu' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Giờ bắt đầu"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.start_time}
                      helperText={errors.start_time?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="end_time"
                  control={control}
                  rules={{ required: 'Vui lòng chọn giờ kết thúc' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Giờ kết thúc"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.end_time}
                      helperText={errors.end_time?.message}
                      fullWidth
                    />
                  )}
                />
              </Box>

              {/* Status */}
              <Controller
                name="status"
                control={control}
                rules={{ required: 'Vui lòng chọn trạng thái' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select {...field} label="Trạng thái">
                      <MenuItem value="pending">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningIcon color="warning" fontSize="small" />
                          Chờ xác nhận
                        </Box>
                      </MenuItem>
                      <MenuItem value="confirmed">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon color="success" fontSize="small" />
                          Đã xác nhận
                        </Box>
                      </MenuItem>
                      <MenuItem value="cancelled">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CancelIcon color="error" fontSize="small" />
                          Đã hủy
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
          </DialogContent>

          <DialogActions>
            {!isAddMode && (
              <>
                <Button color="error" startIcon={<DeleteIcon />} onClick={handleDeleteBooking}>
                  Xóa
                </Button>
                {selectedEvent?.resource.status === 'confirmed' && (
                  <Button
                    color="primary"
                    startIcon={<PaymentIcon />}
                    onClick={() => {
                      if (selectedEvent?.resource) {
                        handleOpenPaymentDialog(selectedEvent.resource);
                        setIsDialogOpen(false);
                      }
                    }}
                    sx={{ mr: 'auto' }}
                  >
                    Thanh toán
                  </Button>
                )}
              </>
            )}
            <Button onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={currentConflicts}
              startIcon={isAddMode ? <AddIcon /> : <EditIcon />}
            >
              {isAddMode ? 'Thêm' : 'Cập nhật'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={submitPayment(onPaymentSubmit)}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PaymentIcon color="primary" />
              <Box>
                <Typography variant="h6">Xử lý thanh toán</Typography>
                {selectedBookingForPayment && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedBookingForPayment.booking_code} -{' '}
                    {selectedBookingForPayment.court_name}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Box sx={{ display: 'grid', gap: 3, mt: 1 }}>
              {/* Booking Info */}
              {selectedBookingForPayment && (
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
                    Thông tin đặt sân
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Typography variant="body2">
                      <strong>Khách hàng:</strong> {selectedBookingForPayment.customer_name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Sân:</strong> {selectedBookingForPayment.court_name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Ngày:</strong>{' '}
                      {format(parseISO(selectedBookingForPayment.booking_date), 'dd/MM/yyyy')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Thời gian:</strong> {selectedBookingForPayment.start_time} -{' '}
                      {selectedBookingForPayment.end_time}
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Payment Amount */}
              <Controller
                name="amount"
                control={paymentControl}
                rules={{
                  required: 'Vui lòng nhập số tiền',
                  min: { value: 1, message: 'Số tiền phải lớn hơn 0' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Số tiền thanh toán"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                    }}
                    error={!!paymentErrors.amount}
                    helperText={paymentErrors.amount?.message}
                    fullWidth
                  />
                )}
              />

              {/* Payment Method */}
              <Controller
                name="payment_method"
                control={paymentControl}
                rules={{ required: 'Vui lòng chọn phương thức thanh toán' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!paymentErrors.payment_method}>
                    <InputLabel>Phương thức thanh toán</InputLabel>
                    <Select {...field} label="Phương thức thanh toán">
                      <MenuItem value="cash">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MoneyIcon color="success" fontSize="small" />
                          Tiền mặt
                        </Box>
                      </MenuItem>
                      <MenuItem value="transfer">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BankIcon color="primary" fontSize="small" />
                          Chuyển khoản
                        </Box>
                      </MenuItem>
                    </Select>
                    {paymentErrors.payment_method && (
                      <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        {paymentErrors.payment_method.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              {/* Transaction Date */}
              <Controller
                name="transaction_date"
                control={paymentControl}
                rules={{ required: 'Vui lòng chọn ngày thanh toán' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ngày thanh toán"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!paymentErrors.transaction_date}
                    helperText={paymentErrors.transaction_date?.message}
                    fullWidth
                  />
                )}
              />

              {/* Current Payment Status */}
              {selectedBookingForPayment?.payment_status && (
                <Alert
                  severity={
                    selectedBookingForPayment.payment_status === 'paid' ? 'success' : 'warning'
                  }
                  icon={
                    selectedBookingForPayment.payment_status === 'paid' ? (
                      <CheckCircleIcon />
                    ) : (
                      <WarningIcon />
                    )
                  }
                >
                  <Typography variant="body2">
                    Trạng thái hiện tại:{' '}
                    <strong>
                      {selectedBookingForPayment.payment_status === 'paid'
                        ? 'Đã thanh toán'
                        : 'Chưa thanh toán'}
                    </strong>
                    {selectedBookingForPayment.transaction && (
                      <>
                        <br />
                        Phương thức:{' '}
                        {selectedBookingForPayment.transaction.payment_method === 'cash'
                          ? 'Tiền mặt'
                          : 'Chuyển khoản'}
                        <br />
                        Ngày thanh toán:{' '}
                        {format(
                          parseISO(selectedBookingForPayment.transaction.transaction_date),
                          'dd/MM/yyyy'
                        )}
                      </>
                    )}
                  </Typography>
                </Alert>
              )}
            </Box>
          </DialogContent>

          <DialogActions>
            {selectedBookingForPayment?.payment_status === 'paid' && (
              <Button
                color="warning"
                onClick={() => {
                  if (selectedBookingForPayment) {
                    handleMarkUnpaid(selectedBookingForPayment);
                    setIsPaymentDialogOpen(false);
                    setSelectedBookingForPayment(null);
                  }
                }}
              >
                Đánh dấu chưa thanh toán
              </Button>
            )}
            <Button onClick={() => setIsPaymentDialogOpen(false)}>Hủy</Button>
            <Button type="submit" variant="contained" color="success" startIcon={<PaymentIcon />}>
              {selectedBookingForPayment?.payment_status === 'paid'
                ? 'Cập nhật thanh toán'
                : 'Xác nhận thanh toán'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
