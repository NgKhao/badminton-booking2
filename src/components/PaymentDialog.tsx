import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Money as MoneyIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { format, parseISO } from 'date-fns';

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

interface PaymentFormData {
  amount: number;
  payment_method: 'cash' | 'transfer';
  transaction_date: string;
}

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaymentSubmit: (data: PaymentFormData) => void;
  onMarkUnpaid: (booking: Booking) => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onClose,
  booking,
  onPaymentSubmit,
  onMarkUnpaid,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>();

  // Initialize form when booking changes
  React.useEffect(() => {
    if (booking) {
      reset({
        amount: booking.total_amount,
        payment_method: 'cash',
        transaction_date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [booking, reset]);

  const handleFormSubmit = (data: PaymentFormData) => {
    onPaymentSubmit(data);
    onClose();
  };

  const handleMarkUnpaidClick = () => {
    if (booking) {
      onMarkUnpaid(booking);
      onClose();
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PaymentIcon color="primary" />
            <Box>
              <Typography variant="h6">Xử lý thanh toán</Typography>
              <Typography variant="body2" color="text.secondary">
                {booking.booking_code} - {booking.court_name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'grid', gap: 3, mt: 1 }}>
            {/* Booking Info */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
                Thông tin đặt sân
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography variant="body2">
                  <strong>Khách hàng:</strong> {booking.customer_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Sân:</strong> {booking.court_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Ngày:</strong> {format(parseISO(booking.booking_date), 'dd/MM/yyyy')}
                </Typography>
                <Typography variant="body2">
                  <strong>Thời gian:</strong> {booking.start_time} - {booking.end_time}
                </Typography>
              </Box>
            </Paper>

            {/* Payment Amount */}
            <Controller
              name="amount"
              control={control}
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
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  fullWidth
                />
              )}
            />

            {/* Payment Method */}
            <Controller
              name="payment_method"
              control={control}
              rules={{ required: 'Vui lòng chọn phương thức thanh toán' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.payment_method}>
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
                  {errors.payment_method && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {errors.payment_method.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            {/* Transaction Date */}
            <Controller
              name="transaction_date"
              control={control}
              rules={{ required: 'Vui lòng chọn ngày thanh toán' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ngày thanh toán"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.transaction_date}
                  helperText={errors.transaction_date?.message}
                  fullWidth
                />
              )}
            />

            {/* Current Payment Status */}
            {booking.payment_status && (
              <Alert
                severity={booking.payment_status === 'paid' ? 'success' : 'warning'}
                icon={booking.payment_status === 'paid' ? <CheckCircleIcon /> : <WarningIcon />}
              >
                <Typography variant="body2">
                  Trạng thái hiện tại:{' '}
                  <strong>
                    {booking.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </strong>
                  {booking.transaction && (
                    <>
                      <br />
                      Phương thức:{' '}
                      {booking.transaction.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                      <br />
                      Ngày thanh toán:{' '}
                      {format(parseISO(booking.transaction.transaction_date), 'dd/MM/yyyy')}
                    </>
                  )}
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          {booking.payment_status === 'paid' && (
            <Button color="warning" onClick={handleMarkUnpaidClick}>
              Đánh dấu chưa thanh toán
            </Button>
          )}
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" color="success" startIcon={<PaymentIcon />}>
            {booking.payment_status === 'paid' ? 'Cập nhật thanh toán' : 'Xác nhận thanh toán'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
