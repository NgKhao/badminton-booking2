import { useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Divider,
  Container,
  Tooltip,
  CircularProgress,
  Snackbar,
} from '@mui/material';

import {
  SportsTennis,
  AccessTime,
  CalendarToday,
  Payment,
  CheckCircle,
  WbSunny,
  Schedule,
  AutoAwesome,
  TrendingUp,
  Group,
  Store,
  LocationOn,
  Phone,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { vi } from 'date-fns/locale';
import {
  format,
  addHours,
  isSameDay,
  isAfter,
  isBefore,
  addMinutes,
  differenceInMinutes,
  parse,
  isWithinInterval,
} from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { useCourtAvailability, useNewCreateBookingMutation } from '../../hooks/useApi';
import type { Court, NewBookingRequest, NewBookingResponse } from '../../types';

const steps = ['Chọn thời gian', 'Xác nhận', 'Hoàn thành'];

export const BookingPage: React.FC = () => {
  const location = useLocation();
  const { selectedCourt: initialSelectedCourt } =
    (location.state as { selectedCourt?: Court }) || {};

  const [activeStep, setActiveStep] = useState(0);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(initialSelectedCourt || null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);
  const [bookingResponse, setBookingResponse] = useState<NewBookingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const { user } = useAuthStore();

  // Format date for API call (YYYY-MM-DD)
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  // Fetch court availability from API
  const {
    data: availabilitySlots = [],
    isLoading: isLoadingAvailability,
    error: availabilityError,
  } = useCourtAvailability(selectedCourt?.id || 0, formattedDate);

  // Check if a time slot is within available periods from API
  const isSlotAvailable = useCallback(
    (slotTime: Date): boolean => {
      if (!availabilitySlots.length) return false;

      const now = new Date();
      if (isBefore(slotTime, now)) return false;

      const slotTimeString = format(slotTime, 'HH:mm');
      const slotEndTime = format(addMinutes(slotTime, 30), 'HH:mm');

      return availabilitySlots.some((slot) => {
        const slotStart = parse(slot.startTime, 'HH:mm', selectedDate);
        const slotEnd = parse(slot.endTime, 'HH:mm', selectedDate);
        const currentSlotStart = parse(slotTimeString, 'HH:mm', selectedDate);
        const currentSlotEnd = parse(slotEndTime, 'HH:mm', selectedDate);

        return (
          isWithinInterval(currentSlotStart, { start: slotStart, end: slotEnd }) &&
          isWithinInterval(currentSlotEnd, { start: slotStart, end: slotEnd })
        );
      });
    },
    [availabilitySlots, selectedDate]
  );

  // Generate all possible 30-minute time slots for the day based on availability
  const getAllTimeSlots = useMemo(() => {
    if (!selectedDate || !availabilitySlots) return [];

    const slots = [];
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(6, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(22, 0, 0, 0);

    for (
      let current = new Date(startOfDay);
      current < endOfDay;
      current = addMinutes(current, 30)
    ) {
      slots.push(new Date(current));
    }

    return slots;
  }, [selectedDate, availabilitySlots]);

  // Calculate total amount (removed peak hour pricing)
  const calculateTotalAmount = (): number => {
    if (!selectedCourt || !selectedStartTime || !selectedEndTime) return 0;

    const durationInMinutes = differenceInMinutes(selectedEndTime, selectedStartTime);
    const durationInHours = durationInMinutes / 60;
    return Math.round(selectedCourt.hourlyRate * durationInHours);
  };

  const handleTimeConfirm = () => {
    if (selectedStartTime && selectedEndTime) {
      setActiveStep(1);
    }
  };

  const navigate = useNavigate();

  // API mutation hook
  const createBookingMutation = useNewCreateBookingMutation({
    onSuccess: (data) => {
      setBookingResponse(data); // Save booking response
      setSnackbar({
        open: true,
        message: `Đặt sân thành công! Mã đặt: ${data.bookingCode}`,
        severity: 'success',
      });
      setActiveStep(2);
    },
    onError: (error) => {
      console.error('Booking error:', error);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi đặt sân. Vui lòng thử lại!',
        severity: 'error',
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleBookingConfirm = async () => {
    if (!selectedCourt || !selectedStartTime || !selectedEndTime || !user) return;

    if (isBefore(selectedStartTime, new Date())) {
      setSnackbar({
        open: true,
        message: 'Khung giờ đã qua, vui lòng chọn khung giờ khác.',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    const bookingData: NewBookingRequest = {
      court: {
        id: selectedCourt.id,
      },
      bookingDate: format(selectedDate, 'yyyy-MM-dd'),
      startTime: format(selectedStartTime, 'HH:mm'),
      endTime: format(selectedEndTime, 'HH:mm'),
    };

    createBookingMutation.mutate(bookingData);
  };

  const renderTimeSelection = () => (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" className="text-center mb-8 font-bold text-gray-800">
        Chọn thời gian
      </Typography>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Court Info and Date Selection */}
        <div className="lg:col-span-1 space-y-6">
          {/* Selected Court Info */}
          {selectedCourt && (
            <Paper elevation={2} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="bg-emerald-600">
                  <SportsTennis />
                </Avatar>
                <div>
                  <Typography variant="h6" className="font-semibold">
                    {selectedCourt.courtName}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {selectedCourt.courtType === 'INDOOR' ? 'Trong nhà' : 'Ngoài trời'} -{' '}
                    {selectedCourt.hourlyRate.toLocaleString('vi-VN')}đ/giờ
                  </Typography>
                </div>
              </div>
            </Paper>
          )}

          {/* Date Selection */}
          <Paper elevation={2} className="p-6">
            <Typography variant="h6" className="mb-4 flex items-center">
              <CalendarToday className="mr-2 text-emerald-600" />
              Chọn ngày
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <DatePicker
                label="Ngày đặt sân"
                value={selectedDate}
                onChange={(newValue) => {
                  if (newValue) {
                    setSelectedDate(newValue);
                    setSelectedStartTime(null);
                    setSelectedEndTime(null);
                  }
                }}
                disablePast
                minDate={new Date()}
                maxDate={addHours(new Date(), 24 * 30)}
                className="w-full"
              />
            </LocalizationProvider>
          </Paper>
        </div>

        {/* Time Selection and Summary */}
        <div className="lg:col-span-2">
          <Paper elevation={2} className="p-6">
            <Typography variant="h6" className="mb-4 flex items-center">
              <Schedule className="mr-2 text-blue-600" />
              Chọn khung giờ (30 phút/khung)
            </Typography>

            <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-2">
              {getAllTimeSlots.map((slot, index) => {
                const isPastSlot = isBefore(slot, new Date());
                const isAvailable = isSlotAvailable(slot);
                const isSelected =
                  selectedStartTime &&
                  selectedEndTime &&
                  slot >= selectedStartTime &&
                  slot < selectedEndTime &&
                  !isPastSlot;
                const isStartTime =
                  selectedStartTime &&
                  slot.getTime() === selectedStartTime.getTime() &&
                  !isPastSlot;
                const isEndTimeSlot =
                  selectedEndTime &&
                  slot.getTime() === selectedEndTime.getTime() - 30 * 60 * 1000 &&
                  !isPastSlot;

                return (
                  <Tooltip
                    key={index}
                    title={
                      isPastSlot
                        ? 'Khung giờ đã qua'
                        : !isAvailable
                          ? 'Đã có người đặt'
                          : 'Khung giờ trống'
                    }
                    arrow
                  >
                    <div
                      className={`
                        p-2 text-center rounded-lg text-xs font-medium transition-all
                        ${
                          isPastSlot
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : !isAvailable
                              ? 'bg-red-100 text-red-700 cursor-not-allowed'
                              : isSelected
                                ? 'bg-emerald-500 text-white cursor-pointer'
                                : isStartTime
                                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 cursor-pointer'
                                  : isEndTimeSlot
                                    ? 'bg-emerald-400 text-white ring-2 ring-emerald-300 cursor-pointer'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                        }
                      `}
                      onClick={() => {
                        if (!isAvailable || isPastSlot || !selectedCourt) return;

                        if (!selectedStartTime) {
                          setSelectedStartTime(slot);
                          setSelectedEndTime(null);
                        } else if (!selectedEndTime) {
                          if (slot > selectedStartTime) {
                            setSelectedEndTime(addMinutes(slot, 30));
                          } else {
                            setSelectedStartTime(slot);
                            setSelectedEndTime(null);
                          }
                        } else {
                          setSelectedStartTime(slot);
                          setSelectedEndTime(null);
                        }
                      }}
                    >
                      <div>{format(slot, 'HH:mm')}</div>
                      {isPastSlot && <div className="text-[10px] mt-1">Đã qua</div>}
                      {!isPastSlot && !isAvailable && (
                        <div className="text-[10px] mt-1">Đã đặt</div>
                      )}
                    </div>
                  </Tooltip>
                );
              })}
            </div>

            {/* Selection Summary */}
            {selectedStartTime && selectedEndTime && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body2" className="text-gray-600">
                      Thời gian đã chọn
                    </Typography>
                    <Typography variant="h6" className="font-semibold text-emerald-600">
                      {format(selectedStartTime, 'HH:mm')} - {format(selectedEndTime, 'HH:mm')}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      (
                      {Math.round(
                        (differenceInMinutes(selectedEndTime, selectedStartTime) / 60) * 10
                      ) / 10}{' '}
                      giờ)
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography variant="body2" className="text-gray-600">
                      Tổng tiền
                    </Typography>
                    <Typography variant="h6" className="font-bold text-emerald-600">
                      {calculateTotalAmount().toLocaleString('vi-VN')}đ
                    </Typography>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <Alert severity="info" className="mt-4">
              <Typography variant="body2">
                <strong>Hướng dẫn:</strong> Nhấn vào khung giờ đầu tiên để chọn giờ bắt đầu, sau đó
                nhấn vào khung giờ thứ hai để chọn giờ kết thúc.
              </Typography>
            </Alert>
          </Paper>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outlined"
          onClick={() => window.history.back()}
          className="border-gray-300 text-gray-700"
        >
          Quay lại chọn sân
        </Button>
        <Button
          variant="contained"
          onClick={handleTimeConfirm}
          disabled={
            !selectedStartTime ||
            !selectedEndTime ||
            !selectedCourt ||
            !isSlotAvailable(selectedStartTime)
          }
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Tiếp tục
        </Button>
      </div>
    </Container>
  );

  const renderConfirmation = () => (
    <Container maxWidth="md" className="py-6">
      <div className="mb-8">
        <Typography variant="h4" className="text-center mb-6 font-bold text-gray-800">
          Xác nhận đặt sân
        </Typography>

        <Paper elevation={2} className="p-6 mb-6">
          <Typography variant="h6" className="mb-4 font-semibold">
            Thông tin đặt sân
          </Typography>
          <Divider className="mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Typography variant="subtitle2" className="text-gray-600 font-medium">
                  Sân
                </Typography>
                <Typography variant="body1" className="font-semibold">
                  {selectedCourt?.courtName}
                </Typography>
              </div>
              <div>
                <Typography variant="subtitle2" className="text-gray-600 font-medium">
                  Loại sân
                </Typography>
                <Typography variant="body1">
                  {selectedCourt?.courtType === 'INDOOR' ? 'Trong nhà' : 'Ngoài trời'}
                </Typography>
              </div>
              <div>
                <Typography variant="subtitle2" className="text-gray-600 font-medium">
                  Ngày
                </Typography>
                <Typography variant="body1">
                  {format(selectedDate, 'dd/MM/yyyy - EEEE', { locale: vi })}
                </Typography>
              </div>
              {/* Branch Info */}
              {selectedCourt?.branchName && (
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    Chi nhánh
                  </Typography>
                  <Typography variant="body1" className="font-semibold">
                    {selectedCourt.branchName}
                  </Typography>
                  {selectedCourt.branchAddress && (
                    <Typography variant="body2" color="text.secondary" className="mt-1">
                      {selectedCourt.branchAddress}
                    </Typography>
                  )}
                  {selectedCourt.branchPhone && (
                    <Typography variant="body2" color="text.secondary">
                      SĐT: {selectedCourt.branchPhone}
                    </Typography>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Typography variant="subtitle2" className="text-gray-600 font-medium">
                  Thời gian
                </Typography>
                <Typography variant="body1" className="font-semibold">
                  {selectedStartTime &&
                    selectedEndTime &&
                    `${format(selectedStartTime, 'HH:mm')} - ${format(selectedEndTime, 'HH:mm')}`}
                </Typography>
              </div>
              <div>
                <Typography variant="subtitle2" className="text-gray-600 font-medium">
                  Thời lượng
                </Typography>
                <Typography variant="body1">
                  {selectedStartTime &&
                    selectedEndTime &&
                    `${Math.round((differenceInMinutes(selectedEndTime, selectedStartTime) / 60) * 10) / 10} giờ`}
                </Typography>
              </div>
              <div>
                <Typography variant="subtitle2" className="text-gray-600 font-medium">
                  Tổng tiền
                </Typography>
                <Typography variant="h6" className="font-bold text-emerald-600">
                  {calculateTotalAmount().toLocaleString('vi-VN')}đ
                </Typography>
              </div>
            </div>
          </div>
        </Paper>

        <Alert severity="info" className="mb-6">
          <div className="flex items-center">
            <Group className="mr-2" />
            Sau khi đặt sân thành công, bạn sẽ nhận được mã đặt sân và có thể thanh toán tại quầy
            khi đến chơi.
          </div>
        </Alert>

        <div className="flex justify-between">
          <Button
            variant="outlined"
            onClick={() => setActiveStep(0)}
            className="border-gray-300 text-gray-700"
          >
            Quay lại chọn thời gian
          </Button>
          <Button
            variant="contained"
            onClick={handleBookingConfirm}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
            startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
          >
            {loading ? 'Đang đặt sân...' : 'Xác nhận đặt sân'}
          </Button>
        </div>
      </div>
    </Container>
  );

  const renderSuccess = () => (
    <Container maxWidth="sm" className="py-8">
      <div className="text-center">
        <CheckCircle className="text-green-500 mb-4" style={{ fontSize: 80 }} />
        <Typography variant="h4" className="mb-4 font-bold text-gray-800">
          Đặt sân thành công!
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-6">
          Chúc mừng bạn đã đặt sân thành công, vui lòng kiểm tra thông tin trong email và đợi quản
          trị viên xác nhận.
        </Typography>

        <Paper elevation={2} className="p-6 mb-6 max-w-md mx-auto">
          <Typography variant="h6" className="mb-4 font-semibold">
            Chi tiết đặt sân
          </Typography>
          <Divider className="mb-4" />
          <div className="text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Mã đặt sân:</span>
              <span className="font-semibold text-emerald-600">{bookingResponse?.bookingCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sân:</span>
              <span className="font-semibold">
                {bookingResponse?.court.courtName || selectedCourt?.courtName}
              </span>
            </div>
            {bookingResponse?.court.branchName && (
              <>
                <Divider className="my-2" />
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium mb-1">
                    Chi nhánh
                  </Typography>
                  <div className="flex items-start gap-2 mb-1">
                    <Store fontSize="small" className="text-gray-500 mt-0.5" />
                    <Typography variant="body2" className="font-semibold">
                      {bookingResponse.court.branchName}
                    </Typography>
                  </div>
                  {bookingResponse.court.branchAddress && (
                    <div className="flex items-start gap-2 mb-1">
                      <LocationOn fontSize="small" className="text-gray-500 mt-0.5" />
                      <Typography variant="body2" color="text.secondary">
                        {bookingResponse.court.branchAddress}
                      </Typography>
                    </div>
                  )}
                  {bookingResponse.court.branchPhone && (
                    <div className="flex items-center gap-2">
                      <Phone fontSize="small" className="text-gray-500" />
                      <Typography variant="body2" color="text.secondary">
                        {bookingResponse.court.branchPhone}
                      </Typography>
                    </div>
                  )}
                </div>
                <Divider className="my-2" />
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày:</span>
              <span className="font-semibold">
                {bookingResponse?.bookingDate
                  ? format(new Date(bookingResponse.bookingDate), 'dd/MM/yyyy', { locale: vi })
                  : format(selectedDate, 'dd/MM/yyyy', { locale: vi })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giờ:</span>
              <span className="font-semibold">
                {bookingResponse
                  ? `${bookingResponse.startTime.slice(0, 5)} - ${bookingResponse.endTime.slice(0, 5)} (${bookingResponse.duration} giờ)`
                  : selectedStartTime &&
                    selectedEndTime &&
                    `${format(selectedStartTime, 'HH:mm')} - ${format(selectedEndTime, 'HH:mm')} (${Math.round((differenceInMinutes(selectedEndTime, selectedStartTime) / 60) * 10) / 10} giờ)`}
              </span>
            </div>
            {/* <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <Chip
                label={bookingResponse?.status === 'PENDING' ? 'Chờ xác nhận' : bookingResponse?.status}
                size="small"
                color="warning"
              />
            </div> */}
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="font-bold text-emerald-600">
                {bookingResponse
                  ? bookingResponse.totalAmount.toLocaleString('vi-VN')
                  : calculateTotalAmount().toLocaleString('vi-VN')}
                đ
              </span>
            </div>
            {/* <div className="flex justify-between">
              <span className="text-gray-600">Thanh toán:</span>
              <Chip
                label={
                  bookingResponse?.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' : 'Đã thanh toán'
                }
                size="small"
                color={bookingResponse?.paymentStatus === 'UNPAID' ? 'error' : 'success'}
              />
            </div> */}
          </div>
        </Paper>

        <Alert severity="success" className="mb-4 text-left">
          <Typography variant="body2">
            Vui lòng đến chi nhánh <strong>{bookingResponse?.court.branchName}</strong> vào đúng
            thời gian đã đặt để thanh toán và sử dụng sân.
          </Typography>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outlined" href="/" className="border-gray-300 text-gray-700">
            Về trang chủ
          </Button>
          <Button variant="contained" href="/courts" className="bg-emerald-600">
            Đặt thêm sân
          </Button>
        </div>
      </div>
    </Container>
  );

  return (
    <Box className="min-h-screen bg-gray-50">
      <Paper elevation={1} className="p-4 mb-6 bg-white">
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {activeStep === 0 && renderTimeSelection()}
      {activeStep === 1 && renderConfirmation()}
      {activeStep === 2 && renderSuccess()}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          className="w-full"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
