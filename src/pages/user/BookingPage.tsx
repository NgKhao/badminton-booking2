import { useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Divider,
  Container,
  Tooltip,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
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
} from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import type { Court } from '../../types';

const steps = ['Chọn thời gian', 'Xác nhận', 'Hoàn thành'];

// Mock existing bookings for conflict detection
const mockExistingBookings = [
  {
    court_id: 1,
    date: new Date(),
    start_time: new Date().setHours(8, 0, 0, 0),
    end_time: new Date().setHours(10, 0, 0, 0),
  },
  {
    court_id: 1,
    date: new Date(),
    start_time: new Date().setHours(14, 0, 0, 0),
    end_time: new Date().setHours(16, 0, 0, 0),
  },
  {
    court_id: 2,
    date: new Date(),
    start_time: new Date().setHours(9, 0, 0, 0),
    end_time: new Date().setHours(11, 0, 0, 0),
  },
];

export const BookingPage: React.FC = () => {
  const location = useLocation();
  const { selectedCourt: initialSelectedCourt } =
    (location.state as { selectedCourt?: Court }) || {};

  const [activeStep, setActiveStep] = useState(0);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(initialSelectedCourt || null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore();

  // Check if a time slot conflicts with existing bookings
  const hasConflict = (courtId: number, date: Date, startTime: Date, endTime: Date): boolean => {
    return mockExistingBookings.some((booking) => {
      if (booking.court_id !== courtId || !isSameDay(new Date(booking.date), date)) {
        return false;
      }

      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);

      return (
        (isAfter(startTime, bookingStart) && isBefore(startTime, bookingEnd)) ||
        (isAfter(endTime, bookingStart) && isBefore(endTime, bookingEnd)) ||
        (isBefore(startTime, bookingStart) && isAfter(endTime, bookingEnd))
      );
    });
  };

  // Check if a specific 30-minute slot is available
  const isSlotAvailable = useCallback((courtId: number, date: Date, slotTime: Date): boolean => {
    const slotEnd = addMinutes(slotTime, 30);
    return !hasConflict(courtId, date, slotTime, slotEnd);
  }, []);

  // Generate all possible 30-minute time slots for the day
  const getAllTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

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
  }, [selectedDate]);

  // Calculate total amount (removed peak hour pricing)
  const calculateTotalAmount = (): number => {
    if (!selectedCourt || !selectedStartTime || !selectedEndTime) return 0;

    const durationInMinutes = differenceInMinutes(selectedEndTime, selectedStartTime);
    const durationInHours = durationInMinutes / 60;
    return Math.round(selectedCourt.hourlyRate * durationInHours);
  };

  const handleCourtSelect = (court: Court) => {
    setSelectedCourt(court);
    setSelectedStartTime(null);
    setActiveStep(1);
  };

  const handleTimeConfirm = () => {
    if (selectedStartTime && selectedEndTime) {
      setActiveStep(1);
    }
  };

  const handleBookingConfirm = async () => {
    if (!selectedCourt || !selectedStartTime || !user) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setActiveStep(2);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
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
                const isAvailable = selectedCourt
                  ? isSlotAvailable(selectedCourt.id, selectedDate, slot)
                  : false;
                const isSelected =
                  selectedStartTime &&
                  selectedEndTime &&
                  slot >= selectedStartTime &&
                  slot < selectedEndTime;
                const isStartTime =
                  selectedStartTime && slot.getTime() === selectedStartTime.getTime();
                const isEndTimeSlot =
                  selectedEndTime && slot.getTime() === selectedEndTime.getTime() - 30 * 60 * 1000;

                return (
                  <Tooltip
                    key={index}
                    title={!isAvailable ? 'Đã có người đặt' : 'Khung giờ trống'}
                    arrow
                  >
                    <div
                      className={`
                        p-2 text-center rounded-lg cursor-pointer text-xs font-medium transition-all
                        ${
                          !isAvailable
                            ? 'bg-red-100 text-red-700 cursor-not-allowed'
                            : isSelected
                              ? 'bg-emerald-500 text-white'
                              : isStartTime
                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                                : isEndTimeSlot
                                  ? 'bg-emerald-400 text-white ring-2 ring-emerald-300'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                      onClick={() => {
                        if (!isAvailable || !selectedCourt) return;

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
                      {!isAvailable && <div className="text-[10px] mt-1">Đã đặt</div>}
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
            (!!selectedCourt &&
              !!selectedStartTime &&
              !!selectedEndTime &&
              hasConflict(selectedCourt.id, selectedDate, selectedStartTime, selectedEndTime))
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
              <span className="text-gray-600">Sân:</span>
              <span className="font-semibold">{selectedCourt?.courtName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày:</span>
              <span className="font-semibold">
                {format(selectedDate, 'dd/MM/yyyy', { locale: vi })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giờ:</span>
              <span className="font-semibold">
                {selectedStartTime &&
                  selectedEndTime &&
                  `${format(selectedStartTime, 'HH:mm')} - ${format(selectedEndTime, 'HH:mm')} (${Math.round((differenceInMinutes(selectedEndTime, selectedStartTime) / 60) * 10) / 10} giờ)`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="font-bold text-emerald-600">
                {calculateTotalAmount().toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </Paper>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outlined" href="/dashboard" className="border-gray-300 text-gray-700">
            Về trang chủ
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
    </Box>
  );
};
