import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  useTheme,
} from '@mui/material';
import { AttachMoney, EventNote, SportsTennis, Refresh, PeopleAlt } from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays } from 'date-fns';

// Types
interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

interface CourtUsageData {
  court_name: string;
  bookings: number;
  revenue: number;
  utilization: number;
}

interface CustomerData {
  customer_id: number;
  full_name: string;
  total_bookings: number;
  total_spent: number;
  last_booking: string;
  membership_level: 'basic' | 'premium' | 'vip';
}

// Mock data
const generateRevenueData = (days: number): RevenueData[] => {
  const data: RevenueData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'MM/dd'),
      revenue: Math.floor(Math.random() * 2000000) + 500000,
      bookings: Math.floor(Math.random() * 20) + 5,
    });
  }
  return data;
};

const courtUsageData: CourtUsageData[] = [
  { court_name: 'Sân VIP 1', bookings: 145, revenue: 21750000, utilization: 85 },
  { court_name: 'Sân VIP 2', bookings: 132, revenue: 19800000, utilization: 78 },
  { court_name: 'Sân Standard 1', bookings: 168, revenue: 20160000, utilization: 92 },
  { court_name: 'Sân Standard 2', bookings: 155, revenue: 18600000, utilization: 88 },
  { court_name: 'Sân Ngoài trời A', bookings: 98, revenue: 9800000, utilization: 65 },
  { court_name: 'Sân Ngoài trời B', bookings: 87, revenue: 8700000, utilization: 58 },
];

const topCustomersData: CustomerData[] = [
  {
    customer_id: 1,
    full_name: 'Nguyễn Văn An',
    total_bookings: 45,
    total_spent: 6750000,
    last_booking: '2025-09-06',
    membership_level: 'vip',
  },
  {
    customer_id: 2,
    full_name: 'Trần Thị Bình',
    total_bookings: 38,
    total_spent: 5320000,
    last_booking: '2025-09-05',
    membership_level: 'premium',
  },
  {
    customer_id: 3,
    full_name: 'Lê Minh Cường',
    total_bookings: 32,
    total_spent: 4160000,
    last_booking: '2025-09-04',
    membership_level: 'premium',
  },
  {
    customer_id: 4,
    full_name: 'Phạm Thu Duyên',
    total_bookings: 28,
    total_spent: 3640000,
    last_booking: '2025-09-03',
    membership_level: 'basic',
  },
  {
    customer_id: 5,
    full_name: 'Hoàng Văn Em',
    total_bookings: 25,
    total_spent: 3250000,
    last_booking: '2025-09-02',
    membership_level: 'basic',
  },
];

export const AdminAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<'today' | 'thisMonth'>('thisMonth');

  // Generate data based on time range
  const revenueData = useMemo(() => {
    const days = timeRange === 'today' ? 1 : 30; // Hôm nay = 1 ngày, Tháng này = 30 ngày
    return generateRevenueData(days);
  }, [timeRange]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0);
    const newCustomers = Math.floor(Math.random() * 50) + 10; // Mock data cho khách hàng mới
    const totalCourts = courtUsageData.length;
    const avgUtilization =
      courtUsageData.reduce((sum, court) => sum + court.utilization, 0) / totalCourts;

    // Calculate trends (comparing with previous period)
    const currentPeriodRevenue = totalRevenue;
    const previousPeriodRevenue = currentPeriodRevenue * (0.85 + Math.random() * 0.3); // Mock previous data
    const revenueGrowth =
      ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;

    return {
      totalRevenue,
      totalBookings,
      newCustomers,
      totalCustomers: topCustomersData.length * 8, // Mock multiplier
      avgUtilization,
      revenueGrowth,
    };
  }, [revenueData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
          Báo cáo & Thống kê
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Phân tích doanh thu và hiệu quả hoạt động
        </Typography>
      </Box>

      {/* Controls */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Khoảng thời gian</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'today' | 'thisMonth')}
                label="Khoảng thời gian"
              >
                <MenuItem value="today">Hôm nay</MenuItem>
                <MenuItem value="thisMonth">Tháng này</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setTimeRange('thisMonth');
              }}
            >
              Làm mới
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Summary Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 3,
          mb: 4,
        }}
      >
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Tổng doanh thu
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {formatCurrency(summaryStats.totalRevenue)}
                </Typography>
              </Box>
              <AttachMoney sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Tổng lượt đặt
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {summaryStats.totalBookings}
                </Typography>
              </Box>
              <EventNote sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Khách hàng mới
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {summaryStats.newCustomers}
                </Typography>
              </Box>
              <PeopleAlt sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Lượt đặt đã xác nhận
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {summaryStats.avgUtilization.toFixed(1)}%
                </Typography>
              </Box>
              <SportsTennis sx={{ fontSize: 40, color: 'warning.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr' }, gap: 3, mb: 4 }}>
        {/* Revenue/Bookings Trend */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Xu hướng doanh thu
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Doanh thu']} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.light}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};
