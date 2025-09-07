import React, { useState, useCallback } from 'react';
import type { SlotInfo, View } from 'react-big-calendar';
import { Views } from 'react-big-calendar';
import {
  Box,
  Typography,
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
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Autocomplete,
  Radio,
  RadioGroup,
  Divider,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { PaymentDialog } from '../../components/PaymentDialog';
import { BookingCalendar } from '../../components/BookingCalendar';

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
  { customer_id: 4, user_id: 4, full_name: 'Phạm Thị D', phone: '0123456777' },
  { customer_id: 5, user_id: 5, full_name: 'Hoàng Văn E', phone: '0123456666' },
];

// Interfaces
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

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}

interface BookingFormData {
  customer_id: number;
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  is_new_customer?: boolean;
}

interface PaymentFormData {
  amount: number;
  payment_method: 'cash' | 'transfer';
  transaction_date: string;
}

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      booking_id: 1,
      booking_code: 'BK001',
      customer_id: 1,
      court_id: 1,
      booking_date: '2024-12-15',
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
        transaction_date: '2024-12-15',
        payment_method: 'cash',
        booking_id: 1,
        created_by: 1,
        created_at: '2024-12-15T08:00:00Z',
        updated_at: '2024-12-15T08:00:00Z',
      },
    },
    {
      booking_id: 2,
      booking_code: 'BK002',
      customer_id: 2,
      court_id: 2,
      booking_date: '2024-12-15',
      start_time: '14:00',
      end_time: '16:00',
      status: 'confirmed',
      total_amount: 300000,
      customer_name: 'Trần Thị B',
      court_name: 'Sân 2',
      payment_status: 'unpaid',
    },
    {
      booking_id: 3,
      booking_code: 'BK003',
      customer_id: 3,
      court_id: 1,
      booking_date: '2024-12-16',
      start_time: '09:00',
      end_time: '11:00',
      status: 'pending',
      total_amount: 300000,
      customer_name: 'Lê Văn C',
      court_name: 'Sân 1',
      payment_status: 'unpaid',
    },
  ]);

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  // Search and filter states
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCourt, setSelectedCourt] = useState<number | 'all'>('all');
  const [showConflicts, setShowConflicts] = useState(true);

  // Calendar states
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Forms
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    defaultValues: {
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
    },
  });

  // Watch form values
  const watchedCourtId = watch('court_id');
  const watchedStartTime = watch('start_time');
  const watchedEndTime = watch('end_time');
  const watchedBookingDate = watch('booking_date');

  // Helper functions
  const resetCustomerForm = useCallback(() => {
    reset((prev) => ({
      ...prev,
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      is_new_customer: false,
    }));
  }, [reset]);

  // Filter customers based on search query
  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.full_name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.phone.includes(customerSearchQuery) ||
      customer.customer_id.toString().includes(customerSearchQuery)
  );

  // Check for booking conflicts
  const checkConflicts = useCallback(
    (
      courtId: number,
      date: string,
      startTime: string,
      endTime: string,
      excludeBookingId?: number
    ) => {
      return bookings.some((booking) => {
        if (excludeBookingId && booking.booking_id === excludeBookingId) return false;
        if (booking.court_id !== courtId || booking.booking_date !== date) return false;
        if (booking.status === 'cancelled') return false;

        const bookingStart = new Date(`${date} ${booking.start_time}`);
        const bookingEnd = new Date(`${date} ${booking.end_time}`);
        const newStart = new Date(`${date} ${startTime}`);
        const newEnd = new Date(`${date} ${endTime}`);

        return (
          (newStart < bookingEnd && newEnd > bookingStart) ||
          (bookingStart < newEnd && bookingEnd > newStart)
        );
      });
    },
    [bookings]
  );

  // Check current form for conflicts
  const currentConflicts = React.useMemo(() => {
    if (!watchedCourtId || !watchedBookingDate || !watchedStartTime || !watchedEndTime) {
      return false;
    }
    return checkConflicts(
      watchedCourtId,
      watchedBookingDate,
      watchedStartTime,
      watchedEndTime,
      selectedEvent?.resource.booking_id
    );
  }, [
    watchedCourtId,
    watchedBookingDate,
    watchedStartTime,
    watchedEndTime,
    selectedEvent,
    checkConflicts,
  ]);

  // Handle calendar slot selection
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      setSelectedEvent(null);
      setIsAddMode(true);
      reset({
        customer_id: 0,
        court_id: 1,
        booking_date: format(slotInfo.start, 'yyyy-MM-dd'),
        start_time: format(slotInfo.start, 'HH:mm'),
        end_time: format(slotInfo.end, 'HH:mm'),
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
    [reset, resetCustomerForm]
  );

  // Handle calendar event selection
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      const booking = event.resource;
      setSelectedEvent(event);
      setIsAddMode(false);

      reset({
        customer_id: booking.customer_id,
        court_id: booking.court_id,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status,
        customer_name: booking.customer_name || '',
        customer_phone: '',
        customer_email: '',
        is_new_customer: false,
      });
      setCustomerMode('existing');
      setIsDialogOpen(true);
    },
    [reset]
  );

  // Handle payment dialog open
  const handleOpenPaymentDialog = useCallback((booking: Booking) => {
    setSelectedBookingForPayment(booking);
    setIsPaymentDialogOpen(true);
  }, []);

  // Handle form submission
  const onSubmit = useCallback(
    (data: BookingFormData) => {
      if (currentConflicts) return;

      const court = mockCourts.find((c) => c.court_id === data.court_id);
      const customer =
        customerMode === 'existing'
          ? mockCustomers.find((c) => c.customer_id === data.customer_id)
          : {
              customer_id: Date.now(),
              full_name: data.customer_name || '',
              phone: data.customer_phone || '',
            };

      if (!court || !customer) return;

      // Calculate total amount
      const start = new Date(`2024-01-01 ${data.start_time}`);
      const end = new Date(`2024-01-01 ${data.end_time}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const totalAmount = Math.round(hours * court.hourly_rate);

      const newBooking: Booking = {
        booking_id: Date.now(),
        booking_code: `BK${String(Date.now()).slice(-3)}`,
        customer_id: customer.customer_id,
        court_id: data.court_id,
        booking_date: data.booking_date,
        start_time: data.start_time,
        end_time: data.end_time,
        status: data.status,
        total_amount: totalAmount,
        customer_name: customer.full_name,
        court_name: court.court_name,
        payment_status: 'unpaid',
      };

      if (isAddMode) {
        // Add new booking
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
    [currentConflicts, isAddMode, selectedEvent, reset, customerMode, resetCustomerForm]
  );

  // Handle delete booking
  const handleDeleteBooking = useCallback(() => {
    if (selectedEvent) {
      setBookings((prev) => prev.filter((b) => b.booking_id !== selectedEvent.resource.booking_id));
      setIsDialogOpen(false);
      reset();
    }
  }, [selectedEvent, reset]);

  // Handle payment submission
  const onPaymentSubmit = (data: PaymentFormData) => {
    if (!selectedBookingForPayment) return;

    const transaction: Transaction = {
      transaction_id: Date.now(),
      amount: data.amount,
      transaction_date: data.transaction_date,
      payment_method: data.payment_method,
      booking_id: selectedBookingForPayment.booking_id,
      created_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setBookings((prev) =>
      prev.map((booking) =>
        booking.booking_id === selectedBookingForPayment.booking_id
          ? { ...booking, payment_status: 'paid', transaction }
          : booking
      )
    );

    setIsPaymentDialogOpen(false);
    setSelectedBookingForPayment(null);
  };

  // Handle mark unpaid
  const handleMarkUnpaid = (booking: Booking) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.booking_id === booking.booking_id
          ? { ...b, payment_status: 'unpaid', transaction: undefined }
          : b
      )
    );
  };

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
      <BookingCalendar
        bookings={bookings}
        courts={mockCourts}
        selectedCourt={selectedCourt}
        showConflicts={showConflicts}
        currentView={currentView}
        currentDate={currentDate}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onViewChange={setCurrentView}
        onNavigate={setCurrentDate}
        checkConflicts={checkConflicts}
      />

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
      <PaymentDialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        booking={selectedBookingForPayment}
        onPaymentSubmit={onPaymentSubmit}
        onMarkUnpaid={handleMarkUnpaid}
      />
    </Box>
  );
};
