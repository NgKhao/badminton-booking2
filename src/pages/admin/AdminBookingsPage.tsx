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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
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

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>();

  // Watch form values for conflict detection
  const watchedValues = watch();

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
          title: `${booking.court_name} - ${booking.customer_name}`,
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
      });

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
      });

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

      const customer = mockCustomers.find((c) => c.customer_id === data.customer_id);
      const court = mockCourts.find((c) => c.court_id === data.court_id);

      if (!customer || !court) {
        alert('Không tìm thấy khách hàng hoặc sân!');
        return;
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
          ...data,
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
                  ...data,
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

  // Event style getter for conflicts and status
  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      const booking = event.resource;
      let backgroundColor = '#3174ad';

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
        }
      }

      return {
        style: {
          backgroundColor,
          borderRadius: '4px',
          opacity: 0.8,
          color: 'white',
          border: '0px',
          display: 'block',
        },
      };
    },
    [checkConflicts, showConflicts]
  );

  return (
    <Box sx={{ p: 3 }}>
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
              });
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

              {/* Customer Selection */}
              <Controller
                name="customer_id"
                control={control}
                rules={{ required: 'Vui lòng chọn khách hàng' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.customer_id}>
                    <InputLabel>Khách hàng</InputLabel>
                    <Select {...field} label="Khách hàng">
                      <MenuItem value={0} disabled>
                        Chọn khách hàng
                      </MenuItem>
                      {mockCustomers.map((customer) => (
                        <MenuItem key={customer.customer_id} value={customer.customer_id}>
                          {customer.full_name} - {customer.phone}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

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
              <Button color="error" startIcon={<DeleteIcon />} onClick={handleDeleteBooking}>
                Xóa
              </Button>
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
    </Box>
  );
};
