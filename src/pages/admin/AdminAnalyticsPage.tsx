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
import { format } from 'date-fns';
import { useDashboardDaily, useDashboardMonthly } from '../../hooks/useApi';

// Types
interface RevenueData {
  date: string;
  revenue: number;
}

// Utility function to transform chart data
const transformChartData = (revenueChart: Record<string, number>): RevenueData[] => {
  return Object.entries(revenueChart).map(([date, revenue]) => ({
    date,
    revenue,
  }));
};

export const AdminAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<'today' | 'thisMonth'>('thisMonth');

  // Prepare API params based on time range
  const apiParams = useMemo(() => {
    const today = new Date();
    if (timeRange === 'today') {
      return {
        type: 'daily' as const,
        params: { date: format(today, 'yyyy-MM-dd') },
      };
    } else {
      return {
        type: 'monthly' as const,
        params: { month: today.getMonth() + 1, year: today.getFullYear() },
      };
    }
  }, [timeRange]);

  // Fetch dashboard data - always call both hooks to avoid conditional hooks
  const dailyQuery = useDashboardDaily(
    apiParams.type === 'daily' ? apiParams.params : { date: '' }
  );

  const monthlyQuery = useDashboardMonthly(
    apiParams.type === 'monthly' ? apiParams.params : { month: 0, year: 0 }
  );

  // Use data from the appropriate query
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = apiParams.type === 'daily' ? dailyQuery : monthlyQuery;

  // Transform chart data
  const revenueData = useMemo(() => {
    if (!dashboardData?.revenueChart) return [];
    return transformChartData(dashboardData.revenueChart);
  }, [dashboardData]);

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
                refetch();
              }}
              disabled={isLoading}
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
                  {isLoading ? '...' : formatCurrency(dashboardData?.totalRevenue || 0)}
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
                  {isLoading ? '...' : dashboardData?.totalBookings || 0}
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
                  {isLoading ? '...' : dashboardData?.newCustomers || 0}
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
                  {isLoading ? '...' : dashboardData?.completedBookings || 0}
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
            {error ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="error">Lỗi khi tải dữ liệu</Typography>
              </Box>
            ) : isLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">Đang tải dữ liệu...</Typography>
              </Box>
            ) : revenueData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">Không có dữ liệu</Typography>
              </Box>
            ) : (
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
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
};
