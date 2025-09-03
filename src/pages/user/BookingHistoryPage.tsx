import { useState } from 'react';
import {
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  Avatar,
  Button,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { SportsTennis, Schedule, EventNote, AccessTime, Payment, Phone } from '@mui/icons-material';
import type { Booking, Court } from '../../types';

// Mock data
const mockBookings: (Booking & { court: Court })[] = [
  {
    booking_id: 1,
    booking_code: 'BK001',
    customer_id: 1,
    court_id: 1,
    booking_date: '2025-08-30',
    start_time: '08:00',
    end_time: '10:00',
    status: 'confirmed',
    total_amount: 300000,
    created_at: '2025-08-29T10:00:00Z',
    updated_at: '2025-08-29T10:00:00Z',
    court: {
      court_id: 1,
      court_name: 'Sân A1',
      court_type: 'Trong nhà',
      status: 'available',
      hourly_rate: 150000,
      description: 'Sân cầu lông tiêu chuẩn trong nhà với hệ thống điều hòa hiện đại',
      images: ['/api/placeholder/400/300'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    booking_id: 2,
    booking_code: 'BK002',
    customer_id: 1,
    court_id: 2,
    booking_date: '2025-08-28',
    start_time: '19:00',
    end_time: '21:00',
    status: 'cancelled',
    total_amount: 200000,
    created_at: '2025-08-27T15:30:00Z',
    updated_at: '2025-08-28T09:00:00Z',
    court: {
      court_id: 2,
      court_name: 'Sân B2',
      court_type: 'Ngoài trời',
      status: 'available',
      hourly_rate: 100000,
      description: 'Sân cầu lông ngoài trời với view tốt và không khí trong lành',
      images: ['/api/placeholder/400/300'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    booking_id: 3,
    booking_code: 'BK003',
    customer_id: 1,
    court_id: 1,
    booking_date: '2025-08-31',
    start_time: '16:00',
    end_time: '18:00',
    status: 'pending',
    total_amount: 300000,
    created_at: '2025-08-30T08:00:00Z',
    updated_at: '2025-08-30T08:00:00Z',
    court: {
      court_id: 1,
      court_name: 'Sân A1',
      court_type: 'Trong nhà',
      status: 'available',
      hourly_rate: 150000,
      description: 'Sân cầu lông tiêu chuẩn trong nhà với hệ thống điều hòa hiện đại',
      images: ['/api/placeholder/400/300'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export const BookingHistoryPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter bookings based on status
  const filteredBookings = mockBookings.filter((booking) => {
    if (statusFilter === 'all') return true;
    return booking.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
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

  const handleContactSupport = () => {
    alert('Liên hệ hỗ trợ: 0123-456-789');
  };

  return (
    <Container maxWidth="lg">
      <div className="py-8">
        <Typography variant="h4" gutterBottom className="text-gray-900 font-bold">
          Lịch sử đặt sân
        </Typography>

        {/* Filter */}
        <div className="mb-6">
          <FormControl size="small" className="min-w-48">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label="Trạng thái"
              onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="pending">Chờ xác nhận</MenuItem>
              <MenuItem value="confirmed">Đã xác nhận</MenuItem>
              <MenuItem value="cancelled">Đã hủy</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* No bookings message */}
        {filteredBookings.length === 0 && (
          <Alert severity="info" className="mb-6">
            Không có lịch đặt sân nào phù hợp với bộ lọc hiện tại.
          </Alert>
        )}

        {/* Bookings List */}
        <div className="grid gap-6">
          {filteredBookings.map((booking) => (
            <Card
              key={booking.booking_id}
              elevation={2}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="bg-emerald-500">
                      <SportsTennis />
                    </Avatar>
                    <div>
                      <Typography variant="h6" className="text-gray-900 font-semibold">
                        {booking.court.court_name} - {booking.court.court_type}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Mã đặt sân: {booking.booking_code}
                      </Typography>
                    </div>
                  </div>
                  <Chip
                    label={getStatusText(booking.status)}
                    color={
                      getStatusColor(booking.status) as 'success' | 'warning' | 'error' | 'default'
                    }
                    variant="filled"
                    className="font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <EventNote className="text-emerald-500" />
                    <div>
                      <Typography variant="caption" className="text-gray-500 block">
                        Ngày đặt
                      </Typography>
                      <Typography variant="body2" className="text-gray-900 font-medium">
                        {new Date(booking.booking_date).toLocaleDateString('vi-VN')}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <AccessTime className="text-emerald-500" />
                    <div>
                      <Typography variant="caption" className="text-gray-500 block">
                        Thời gian
                      </Typography>
                      <Typography variant="body2" className="text-gray-900 font-medium">
                        {booking.start_time} - {booking.end_time}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Payment className="text-emerald-500" />
                    <div>
                      <Typography variant="caption" className="text-gray-500 block">
                        Tổng tiền
                      </Typography>
                      <Typography variant="body2" className="text-emerald-600 font-bold">
                        {booking.total_amount?.toLocaleString('vi-VN') || '0'}đ
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Schedule className="text-emerald-500" />
                    <div>
                      <Typography variant="caption" className="text-gray-500 block">
                        Ngày tạo
                      </Typography>
                      <Typography variant="body2" className="text-gray-900 font-medium">
                        {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 justify-end">
                  {booking.status === 'pending' && (
                    <>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => alert('Chức năng hủy đặt sân')}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Hủy đặt sân
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Phone />}
                        onClick={handleContactSupport}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        Liên hệ hỗ trợ
                      </Button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => alert('Hiển thị thông tin chi tiết và hướng dẫn đến sân')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Xem chi tiết
                    </Button>
                  )}

                  {booking.status === 'cancelled' && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Phone />}
                      onClick={handleContactSupport}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Liên hệ hỗ trợ
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state for new users */}
        {mockBookings.length === 0 && (
          <Paper className="p-8 text-center mt-6">
            <SportsTennis className="text-6xl text-gray-400 mb-4" />
            <Typography variant="h6" gutterBottom className="text-gray-900 font-semibold">
              Chưa có lịch đặt sân nào
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-6">
              Hãy đặt sân đầu tiên của bạn để bắt đầu trải nghiệm dịch vụ!
            </Typography>
            <Button
              variant="contained"
              href="/booking"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2"
            >
              Đặt sân ngay
            </Button>
          </Paper>
        )}
      </div>
    </Container>
  );
};
