import React, { useState } from 'react';
import {
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
  Button,
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Autocomplete,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { format, parseISO } from 'date-fns';

// Interfaces
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
}

interface Court {
  court_id: number;
  court_name: string;
  court_type: string;
  hourly_rate: number;
}

interface Customer {
  customer_id: number;
  user_id: number;
  full_name: string;
  phone: string;
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
  is_new_customer?: string;
}

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => void;
  onDeleteBooking: () => void;
  onConfirmBooking: () => void;
  onCancelBooking: () => void;
  onOpenPaymentDialog: (booking: Booking) => void;
  isAddMode: boolean;
  selectedEvent: CalendarEvent | null;
  courts: Court[];
  customers: Customer[];
  currentConflicts: boolean;
}

export const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  onClose,
  onSubmit,
  onDeleteBooking,
  onConfirmBooking,
  onCancelBooking,
  onOpenPaymentDialog,
  isAddMode,
  selectedEvent,
  courts,
  customers,
  currentConflicts,
}) => {
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    defaultValues: {
      customer_id: 0,
      court_id: 0,
      booking_date: '',
      start_time: '',
      end_time: '',
      status: 'confirmed',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      is_new_customer: 'false',
    },
  });

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.full_name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.phone.includes(customerSearchQuery) ||
      customer.customer_id.toString().includes(customerSearchQuery)
  );

  const resetCustomerForm = () => {
    reset({
      customer_id: 0,
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      is_new_customer: customerMode === 'new' ? 'true' : 'false',
    });
  };

  const handleFormSubmit = (data: BookingFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {isAddMode ? 'Thêm đặt sân mới' : 'Xem chi tiết đặt sân'}
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
          {/* Add Mode Form */}
          {isAddMode && (
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
                      {courts.map((court) => (
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
                      {isAddMode ? (
                        <MenuItem value="confirmed">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                            Đã xác nhận
                          </Box>
                        </MenuItem>
                      ) : (
                        [
                          <MenuItem key="pending" value="pending">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WarningIcon color="warning" fontSize="small" />
                              Chờ xác nhận
                            </Box>
                          </MenuItem>,
                          <MenuItem key="confirmed" value="confirmed">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircleIcon color="success" fontSize="small" />
                              Đã xác nhận
                            </Box>
                          </MenuItem>,
                          <MenuItem key="cancelled" value="cancelled">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CancelIcon color="error" fontSize="small" />
                              Đã hủy
                            </Box>
                          </MenuItem>,
                        ]
                      )}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
          )}

          {/* View Mode - Booking Details */}
          {!isAddMode && selectedEvent && (
            <Paper sx={{ p: 3, bgcolor: 'grey.50', mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Thông tin đặt sân
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography variant="body1">
                  <strong>Khách hàng:</strong> {selectedEvent.resource.customer_name}
                </Typography>
                <Typography variant="body1">
                  <strong>Sân:</strong> {selectedEvent.resource.court_name}
                </Typography>
                <Typography variant="body1">
                  <strong>Ngày:</strong>{' '}
                  {format(parseISO(selectedEvent.resource.booking_date), 'dd/MM/yyyy')}
                </Typography>
                <Typography variant="body1">
                  <strong>Thời gian:</strong> {selectedEvent.resource.start_time} -{' '}
                  {selectedEvent.resource.end_time}
                </Typography>
                <Typography variant="body1">
                  <strong>Trạng thái:</strong>{' '}
                  <Chip
                    label={
                      selectedEvent.resource.status === 'confirmed'
                        ? 'Đã xác nhận'
                        : selectedEvent.resource.status === 'pending'
                          ? 'Chờ xác nhận'
                          : 'Đã hủy'
                    }
                    color={
                      selectedEvent.resource.status === 'confirmed'
                        ? 'success'
                        : selectedEvent.resource.status === 'pending'
                          ? 'warning'
                          : 'error'
                    }
                    size="small"
                  />
                </Typography>
                <Typography variant="body1">
                  <strong>Thanh toán:</strong>{' '}
                  <Chip
                    label={
                      selectedEvent.resource.payment_status === 'paid'
                        ? 'Đã thanh toán'
                        : 'Chưa thanh toán'
                    }
                    color={selectedEvent.resource.payment_status === 'paid' ? 'success' : 'default'}
                    size="small"
                  />
                </Typography>
                {selectedEvent.resource.total_amount && (
                  <Typography variant="body1">
                    <strong>Số tiền:</strong>{' '}
                    {selectedEvent.resource.total_amount.toLocaleString('vi-VN')}đ
                  </Typography>
                )}
              </Box>
            </Paper>
          )}
        </DialogContent>

        <DialogActions>
          {!isAddMode && (
            <>
              <Button color="error" startIcon={<DeleteIcon />} onClick={onDeleteBooking}>
                Xóa
              </Button>

              {/* Pending status - show confirm/cancel buttons */}
              {selectedEvent?.resource.status === 'pending' && (
                <>
                  <Button
                    color="success"
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={onConfirmBooking}
                    sx={{ mr: 1 }}
                  >
                    Xác nhận đặt sân
                  </Button>
                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={onCancelBooking}
                    sx={{ mr: 1 }}
                  >
                    Hủy đặt sân
                  </Button>
                </>
              )}

              {/* Confirmed and unpaid - show payment button */}
              {selectedEvent?.resource.status === 'confirmed' &&
                selectedEvent?.resource.payment_status === 'unpaid' && (
                  <Button
                    color="primary"
                    startIcon={<PaymentIcon />}
                    onClick={() => {
                      if (selectedEvent?.resource) {
                        onOpenPaymentDialog(selectedEvent.resource);
                        onClose();
                      }
                    }}
                    sx={{ mr: 'auto' }}
                  >
                    Thanh toán
                  </Button>
                )}

              {/* Confirmed - can still cancel */}
              {selectedEvent?.resource.status === 'confirmed' && (
                <Button
                  color="warning"
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={onCancelBooking}
                  sx={{ mr: 1 }}
                >
                  Hủy đặt sân
                </Button>
              )}
            </>
          )}
          <Button onClick={onClose}>{isAddMode ? 'Hủy' : 'Đóng'}</Button>
          {isAddMode && (
            <Button
              type="submit"
              variant="contained"
              disabled={currentConflicts}
              startIcon={<AddIcon />}
            >
              Thêm
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};
