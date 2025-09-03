import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  SportsTennis,
  Schedule,
  TrendingUp,
  Cloud as WeatherIcon,
  LocationOn,
  AccessTime,
  CalendarMonth,
  EmojiEvents,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';

export const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { weatherData, bookings } = useBookingStore();

  // Mock data
  const upcomingBookings = [
    {
      booking_id: 1,
      court_name: 'Sân VIP 1',
      booking_date: '2025-08-29',
      start_time: '18:00',
      end_time: '20:00',
      status: 'confirmed' as const,
      court_type: 'Trong nhà',
    },
    {
      booking_id: 2,
      court_name: 'Sân Ngoài trời A',
      booking_date: '2025-08-30',
      start_time: '07:00',
      end_time: '09:00',
      status: 'pending' as const,
      court_type: 'Ngoài trời',
    },
  ];

  const quickStats = [
    {
      label: 'Lần đặt sân',
      value: bookings?.length || 5,
      icon: <SportsTennis className="text-emerald-500 text-4xl" />,
    },
    {
      label: 'Sân yêu thích',
      value: 'Trong nhà',
      icon: <TrendingUp className="text-blue-500 text-4xl" />,
    },
    {
      label: 'Tháng này',
      value: 3,
      icon: <CalendarMonth className="text-purple-500 text-4xl" />,
    },
    {
      label: 'Điểm thưởng',
      value: 120,
      icon: <EmojiEvents className="text-yellow-500 text-4xl" />,
    },
  ];

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <div className="mb-8">
        <Typography variant="h4" className="font-bold text-gray-900 mb-2">
          Xin chào, {user?.full_name}! 👋
        </Typography>
        <Typography variant="h6" className="text-gray-600">
          Chào mừng bạn quay trở lại hệ thống đặt sân BadmintonHub
        </Typography>
      </div>

      {/* Weather Widget */}
      <Card className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h5" className="font-bold mb-2">
                Thời tiết hôm nay
              </Typography>
              <Typography variant="h3" className="font-bold">
                {weatherData?.temperature || 28}°C
              </Typography>
              <Typography variant="body1" className="opacity-90">
                {weatherData?.description || 'Trời nắng, phù hợp chơi thể thao'}
              </Typography>
            </div>
            <WeatherIcon className="text-6xl opacity-80" />
          </div>

          <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-lg">
            <Typography variant="body1" className="font-medium">
              💡 Gợi ý từ AI: Trời nắng gắt, nên chọn sân trong nhà để thoải mái hơn!
            </Typography>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="mb-4">{stat.icon}</div>
              <Typography variant="h4" className="font-bold text-gray-900 mb-2">
                {stat.value}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Quick Booking */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <SportsTennis className="text-emerald-500 mr-3 text-3xl" />
              <Typography variant="h6" className="font-bold">
                Đặt Sân Nhanh
              </Typography>
            </div>
            <Typography variant="body2" className="text-gray-600 mb-6">
              AI sẽ gợi ý sân phù hợp nhất cho bạn dựa trên thời tiết và sở thích
            </Typography>
            <div className="space-y-3">
              <Button
                fullWidth
                variant="contained"
                component={Link}
                to="/booking"
                className="bg-emerald-500 hover:bg-emerald-600 py-3"
              >
                Đặt Sân Ngay
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/courts"
                className="border-emerald-500 text-emerald-500 hover:bg-emerald-50 py-3"
              >
                Xem Tất Cả Sân
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Recommendations */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="text-blue-500 mr-3 text-3xl" />
              <Typography variant="h6" className="font-bold">
                Gợi Ý Hôm Nay
              </Typography>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="body2" className="font-medium text-blue-800">
                    Sân Trong Nhà VIP
                  </Typography>
                  <Chip label="Khuyến nghị" color="primary" size="small" />
                </div>
                <Typography variant="body2" className="text-blue-600">
                  Thời tiết nắng nóng, sân trong nhà sẽ thoải mái hơn
                </Typography>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="body2" className="font-medium text-orange-800">
                    Khung giờ 7:00 - 9:00
                  </Typography>
                  <Chip label="Giá tốt" color="warning" size="small" />
                </div>
                <Typography variant="body2" className="text-orange-600">
                  Khung giờ sáng sớm với giá ưu đãi
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Schedule className="text-emerald-500 mr-3 text-3xl" />
              <Typography variant="h6" className="font-bold">
                Lịch Đặt Sân Sắp Tới
              </Typography>
            </div>
            <Button
              variant="outlined"
              component={Link}
              to="/bookings"
              className="border-emerald-500 text-emerald-500 hover:bg-emerald-50"
            >
              Xem Tất Cả
            </Button>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="bg-emerald-100">
                        <SportsTennis className="text-emerald-500" />
                      </Avatar>
                      <div>
                        <Typography variant="body1" className="font-medium">
                          {booking.court_name}
                        </Typography>
                        <div className="flex items-center space-x-4 text-gray-600">
                          <div className="flex items-center">
                            <CalendarMonth className="w-4 h-4 mr-1" />
                            <Typography variant="body2">
                              {new Date(booking.booking_date).toLocaleDateString('vi-VN')}
                            </Typography>
                          </div>
                          <div className="flex items-center">
                            <AccessTime className="w-4 h-4 mr-1" />
                            <Typography variant="body2">
                              {booking.start_time} - {booking.end_time}
                            </Typography>
                          </div>
                          <div className="flex items-center">
                            <LocationOn className="w-4 h-4 mr-1" />
                            <Typography variant="body2">{booking.court_type}</Typography>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Chip
                      label={getStatusText(booking.status)}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <SportsTennis className="text-gray-400 text-6xl mb-4" />
              <Typography variant="h6" className="text-gray-500 mb-2">
                Chưa có lịch đặt sân nào
              </Typography>
              <Typography variant="body2" className="text-gray-400 mb-4">
                Hãy đặt sân để bắt đầu trải nghiệm
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/booking"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                Đặt Sân Ngay
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress & Goals */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <EmojiEvents className="text-yellow-500 mr-3 text-3xl" />
            <Typography variant="h6" className="font-bold">
              Thành Tích & Mục Tiêu
            </Typography>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Typography variant="body2" className="font-medium">
                  Tiến độ đặt sân tháng này
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  3/10 lần
                </Typography>
              </div>
              <LinearProgress
                variant="determinate"
                value={30}
                className="h-2 rounded-full bg-gray-200"
                classes={{
                  bar: 'bg-emerald-500 rounded-full',
                }}
              />
              <Typography variant="body2" className="text-gray-500 mt-1">
                Còn 7 lần nữa để đạt mục tiêu tháng
              </Typography>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Typography variant="body2" className="font-medium">
                  Điểm thưởng tích lũy
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  120/500 điểm
                </Typography>
              </div>
              <LinearProgress
                variant="determinate"
                value={24}
                className="h-2 rounded-full bg-gray-200"
                classes={{
                  bar: 'bg-yellow-500 rounded-full',
                }}
              />
              <Typography variant="body2" className="text-gray-500 mt-1">
                Còn 380 điểm để lên hạng VIP
              </Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <Typography variant="h5" className="font-bold text-emerald-600">
                  15
                </Typography>
                <Typography variant="body2" className="text-emerald-800">
                  Tổng số lần đặt
                </Typography>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Typography variant="h5" className="font-bold text-blue-600">
                  45h
                </Typography>
                <Typography variant="body2" className="text-blue-800">
                  Tổng thời gian chơi
                </Typography>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Typography variant="h5" className="font-bold text-yellow-600">
                  Silver
                </Typography>
                <Typography variant="body2" className="text-yellow-800">
                  Hạng thành viên
                </Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};
