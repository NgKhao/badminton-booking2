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

// Peak hours configuration
const peakHours = [
  { start: 17, end: 21, label: 'Giờ cao điểm', multiplier: 1.2 },
  { start: 6, end: 8, label: 'Giờ sáng sớm', multiplier: 0.9 },
];

export const BookingPage: React.FC = () => {
  const location = useLocation();
  const { selectedCourt: initialSelectedCourt } =
    (location.state as { selectedCourt?: Court }) || {};

  const [activeStep, setActiveStep] = useState(0); // Luôn bắt đầu từ step chọn thời gian
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

  // Calculate total amount with peak hour pricing
  const calculateTotalAmount = (): number => {
    if (!selectedCourt || !selectedStartTime || !selectedEndTime) return 0;

    const durationInMinutes = differenceInMinutes(selectedEndTime, selectedStartTime);
    const durationInHours = durationInMinutes / 60;
    const baseAmount = selectedCourt.hourlyRate * durationInHours;
    const hour = selectedStartTime.getHours();

    const peakHour = peakHours.find((peak) => hour >= peak.start && hour < peak.end);
    const multiplier = peakHour ? peakHour.multiplier : 1;

    return Math.round(baseAmount * multiplier);
  };

  // Get pricing info for time slot
  const getPricingInfo = (timeSlot: { start: Date; end: Date }) => {
    if (!selectedCourt) return null;

    const hour = timeSlot.start.getHours();
    const durationInMinutes = differenceInMinutes(timeSlot.end, timeSlot.start);
    const durationInHours = durationInMinutes / 60;
    const peakHour = peakHours.find((peak) => hour >= peak.start && hour < peak.end);

    return {
      basePrice: selectedCourt.hourlyRate,
      multiplier: peakHour ? peakHour.multiplier : 1,
      label: peakHour ? peakHour.label : 'Giờ thường',
      totalPrice: Math.round(
        selectedCourt.hourlyRate * durationInHours * (peakHour ? peakHour.multiplier : 1)
      ),
    };
  };

  const handleCourtSelect = (court: Court) => {
    setSelectedCourt(court);
    setSelectedStartTime(null);
    setActiveStep(1);
  };

  const handleTimeConfirm = () => {
    if (selectedStartTime && selectedEndTime) {
      setActiveStep(1); // Chuyển tới confirmation step
    }
  };

  const handleBookingConfirm = async () => {
    if (!selectedCourt || !selectedStartTime || !user) return;

    setLoading(true);
    try {
      // Simulate booking API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setActiveStep(2); // Chuyển tới success step
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTimeSelection = () => (
    <Container maxWidth="lg" className="py-6">
      <div className="mb-8">
        <Typography variant="h4" className="text-center mb-6 font-bold text-gray-800">
          Chọn thời gian
        </Typography>

        {/* Selected Court Info */}
        {selectedCourt && (
          <Paper elevation={1} className="p-4 mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="bg-emerald-600">
                <SportsTennis />
              </Avatar>
              <div>
                <Typography variant="h6" className="font-semibold">
                  {selectedCourt.courtName}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {selectedCourt.courtType === 'INDOOR' ? 'Trong nhà' : 'Ngoài trời'} -{' '}
                  {selectedCourt.hourlyRate.toLocaleString('vi-VN')}
                  đ/giờ
                </Typography>
              </div>
            </div>
          </Paper>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div className="space-y-6">
              <Paper elevation={2} className="p-6">
                <Typography variant="h6" className="mb-4 flex items-center">
                  <CalendarToday className="mr-2 text-emerald-600" />
                  Chọn ngày
                </Typography>

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
                  maxDate={addHours(new Date(), 24 * 30)} // 30 days ahead
                  className="w-full"
                />
              </Paper>

              {/* Time Grid Selection */}
              <Paper elevation={2} className="p-6">
                <Typography variant="h6" className="mb-4 flex items-center">
                  <Schedule className="mr-2 text-blue-600" />
                  Chọn khung giờ (30 phút/khung)
                </Typography>

                <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
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
                      selectedEndTime &&
                      slot.getTime() === selectedEndTime.getTime() - 30 * 60 * 1000; // 30 minutes before end

                    const hour = slot.getHours();
                    const isPeakHour = peakHours.some(
                      (peak) => hour >= peak.start && hour < peak.end
                    );

                    return (
                      <Tooltip
                        key={index}
                        title={
                          !isAvailable
                            ? 'Đã có người đặt'
                            : isPeakHour
                              ? 'Giờ cao điểm'
                              : 'Khung giờ trống'
                        }
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
                                      : isPeakHour
                                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                          onClick={() => {
                            if (!isAvailable || !selectedCourt) return;

                            if (!selectedStartTime) {
                              // Select start time
                              setSelectedStartTime(slot);
                              setSelectedEndTime(null);
                            } else if (!selectedEndTime) {
                              // Select end time
                              if (slot > selectedStartTime) {
                                setSelectedEndTime(addMinutes(slot, 30));
                              } else {
                                // Reset if selecting earlier time
                                setSelectedStartTime(slot);
                                setSelectedEndTime(null);
                              }
                            } else {
                              // Reset selection
                              setSelectedStartTime(slot);
                              setSelectedEndTime(null);
                            }
                          }}
                        >
                          <div>{format(slot, 'HH:mm')}</div>
                          {!isAvailable && <div className="text-[10px] mt-1">Đã đặt</div>}
                          {isPeakHour && isAvailable && (
                            <div className="text-[10px] mt-1">x1.2</div>
                          )}
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>

                {/* Selection Summary */}
                {selectedStartTime && selectedEndTime && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex justify-between items-center">
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
                    <strong>Hướng dẫn:</strong> Nhấn vào khung giờ đầu tiên để chọn giờ bắt đầu, sau
                    đó nhấn vào khung giờ thứ hai để chọn giờ kết thúc.
                  </Typography>
                </Alert>
              </Paper>
            </div>
          </div>
        </LocalizationProvider>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
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
                <div className="flex items-center gap-2">
                  <Typography variant="h6" className="font-bold text-emerald-600">
                    {calculateTotalAmount().toLocaleString('vi-VN')}đ
                  </Typography>
                  {selectedStartTime &&
                    selectedEndTime &&
                    getPricingInfo({ start: selectedStartTime, end: selectedEndTime })
                      ?.multiplier !== 1 && (
                      <Chip
                        label={
                          getPricingInfo({ start: selectedStartTime, end: selectedEndTime })?.label
                        }
                        size="small"
                        color="warning"
                      />
                    )}
                </div>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Paper className="p-4 text-center">
            <TrendingUp className="text-green-500 mb-2" />
            <Typography variant="caption" className="text-gray-600">
              Tiết kiệm thời gian
            </Typography>
            <Typography variant="h6" className="font-bold text-green-600">
              5 phút
            </Typography>
          </Paper>
          <Paper className="p-4 text-center">
            <AccessTime className="text-blue-500 mb-2" />
            <Typography variant="caption" className="text-gray-600">
              Đặt trước
            </Typography>
            <Typography variant="h6" className="font-bold text-blue-600">
              {Math.round(differenceInMinutes(selectedDate, new Date()) / 60)} giờ
            </Typography>
          </Paper>
          <Paper className="p-4 text-center">
            <CheckCircle className="text-emerald-500 mb-2" />
            <Typography variant="caption" className="text-gray-600">
              Không chồng lịch
            </Typography>
            <Typography variant="h6" className="font-bold text-emerald-600">
              ✓ An toàn
            </Typography>
          </Paper>
        </div>

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
          Booking của bạn đã được xác nhận và lưu vào hệ thống.
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
          <Button
            variant="contained"
            href="/bookings"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Xem lịch đặt
          </Button>
        </div>
      </div>
    </Container>
  );

  return (
    <Box className="min-h-screen bg-gray-50">
      {/* Progress Stepper */}
      <Paper elevation={1} className="p-4 mb-6 bg-white">
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      {activeStep === 0 && renderTimeSelection()}
      {activeStep === 1 && renderConfirmation()}
      {activeStep === 2 && renderSuccess()}
    </Box>
  );
};
