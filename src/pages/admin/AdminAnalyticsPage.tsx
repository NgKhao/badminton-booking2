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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  EventNote,
  SportsTennis,
  GetApp,
  Refresh,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
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

interface TimeSlotData {
  time_slot: string;
  bookings: number;
  percentage: number;
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

const timeSlotData: TimeSlotData[] = [
  { time_slot: '06:00-08:00', bookings: 42, percentage: 12 },
  { time_slot: '08:00-10:00', bookings: 68, percentage: 19 },
  { time_slot: '10:00-12:00', bookings: 55, percentage: 16 },
  { time_slot: '12:00-14:00', bookings: 34, percentage: 10 },
  { time_slot: '14:00-16:00', bookings: 48, percentage: 14 },
  { time_slot: '16:00-18:00', bookings: 72, percentage: 20 },
  { time_slot: '18:00-20:00', bookings: 61, percentage: 17 },
  { time_slot: '20:00-22:00', bookings: 38, percentage: 11 },
];

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF7C7C',
];

export const AdminAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartType, setChartType] = useState<'revenue' | 'bookings'>('revenue');

  // Generate data based on time range
  const revenueData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return generateRevenueData(days);
  }, [timeRange]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0);
    const avgBookingValue = totalRevenue / totalBookings;
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
      avgBookingValue,
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

  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'vip':
        return 'warning';
      case 'premium':
        return 'info';
      case 'basic':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log('Exporting report...');
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
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Khoảng thời gian</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                label="Khoảng thời gian"
              >
                <MenuItem value="7d">7 ngày</MenuItem>
                <MenuItem value="30d">30 ngày</MenuItem>
                <MenuItem value="90d">90 ngày</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Loại biểu đồ</InputLabel>
              <Select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'revenue' | 'bookings')}
                label="Loại biểu đồ"
              >
                <MenuItem value="revenue">Doanh thu</MenuItem>
                <MenuItem value="bookings">Lượt đặt</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setTimeRange('30d');
                setChartType('revenue');
              }}
            >
              Làm mới
            </Button>

            <Box sx={{ flexGrow: 1 }} />

            <Button variant="contained" startIcon={<GetApp />} onClick={handleExportReport}>
              Xuất báo cáo
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {summaryStats.revenueGrowth >= 0 ? (
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: summaryStats.revenueGrowth >= 0 ? 'success.main' : 'error.main',
                      fontWeight: 'medium',
                    }}
                  >
                    {Math.abs(summaryStats.revenueGrowth).toFixed(1)}%
                  </Typography>
                </Box>
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
                  Giá trị TB/đơn
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(summaryStats.avgBookingValue)}
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Tỷ lệ sử dụng sân
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
      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}
      >
        {/* Revenue/Bookings Trend */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {chartType === 'revenue' ? 'Xu hướng doanh thu' : 'Xu hướng lượt đặt sân'}
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [
                    chartType === 'revenue' ? formatCurrency(value) : value,
                    chartType === 'revenue' ? 'Doanh thu' : 'Lượt đặt',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={chartType}
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.light}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* Time Slot Usage */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Khung giờ phổ biến
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={timeSlotData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="percentage"
                >
                  {timeSlotData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, 'Tỷ lệ']} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Box>

      {/* Court Usage Chart */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Hiệu suất sử dụng sân
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courtUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="court_name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'revenue'
                    ? formatCurrency(value)
                    : name === 'bookings'
                      ? value
                      : 'Tỷ lệ sử dụng (%)',
                  name === 'revenue'
                    ? 'Doanh thu'
                    : name === 'bookings'
                      ? 'Lượt đặt'
                      : 'Tỷ lệ sử dụng (%)',
                ]}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="bookings"
                fill={theme.palette.primary.main}
                name="bookings"
              />
              <Bar
                yAxisId="right"
                dataKey="utilization"
                fill={theme.palette.warning.main}
                name="utilization"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>

      {/* Tables Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        {/* Top Customers */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Khách hàng VIP
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell align="right">Lượt đặt</TableCell>
                  <TableCell align="right">Tổng chi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topCustomersData.map((customer) => (
                  <TableRow key={customer.customer_id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {customer.full_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {customer.full_name}
                          </Typography>
                          <Chip
                            label={customer.membership_level.toUpperCase()}
                            size="small"
                            color={
                              getMembershipColor(customer.membership_level) as
                                | 'warning'
                                | 'info'
                                | 'default'
                            }
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {customer.total_bookings}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {formatCurrency(customer.total_spent)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Court Performance */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Hiệu suất sân
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tên sân</TableCell>
                  <TableCell align="right">Lượt đặt</TableCell>
                  <TableCell align="right">Tỷ lệ sử dụng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courtUsageData.map((court) => (
                  <TableRow key={court.court_name}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {court.court_name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{court.bookings}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {court.utilization}%
                        </Typography>
                        <Box
                          sx={{
                            width: 40,
                            height: 6,
                            bgcolor: 'grey.200',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${court.utilization}%`,
                              height: '100%',
                              bgcolor:
                                court.utilization >= 80
                                  ? 'success.main'
                                  : court.utilization >= 60
                                    ? 'warning.main'
                                    : 'error.main',
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Box>
  );
};
