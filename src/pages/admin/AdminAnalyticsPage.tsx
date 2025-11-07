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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { useDashboardRange, useBranches, useMaintenanceReports } from '../../hooks/useApi';
import { useAuthStore } from '../../store/authStore';

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
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // State for date range
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 7)); // Last 7 days
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);

  // Fetch branches for admin filter (only for admin users)
  const { data: branchesData } = useBranches({ page: 0, size: 100 }, { enabled: isAdmin });
  const branches = React.useMemo(() => branchesData?.branches || [], [branchesData?.branches]);

  // Prepare API params
  const apiParams = useMemo(() => {
    if (!startDate || !endDate) {
      return {
        startDate: '',
        endDate: '',
        branchId: undefined,
      };
    }

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      branchId: isAdmin ? selectedBranchId : undefined,
    };
  }, [startDate, endDate, selectedBranchId, isAdmin]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useDashboardRange(apiParams);

  // Fetch maintenance reports (only for admin)
  const {
    data: maintenanceReports,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useMaintenanceReports({ enabled: isAdmin });

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
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <DatePicker
                label="Từ ngày"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 150 },
                  },
                }}
              />

              <DatePicker
                label="Đến ngày"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                format="dd/MM/yyyy"
                minDate={startDate || undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 150 },
                  },
                }}
              />

              {isAdmin && branches.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Chi nhánh</InputLabel>
                  <Select
                    value={selectedBranchId || 'all'}
                    label="Chi nhánh"
                    onChange={(e) =>
                      setSelectedBranchId(
                        e.target.value === 'all' ? undefined : Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value="all">Tất cả chi nhánh</MenuItem>
                    {branches.map((branch) => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.branchName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

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
          </LocalizationProvider>
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
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      try {
                        const date = new Date(value);
                        return format(date, 'dd/MM');
                      } catch {
                        return value;
                      }
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                    labelFormatter={(label) => {
                      try {
                        const date = new Date(label);
                        return format(date, 'dd/MM/yyyy');
                      } catch {
                        return label;
                      }
                    }}
                  />
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

      {/* Maintenance Reports Section - Only for ADMIN */}
      {isAdmin && (
        <Box sx={{ mb: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Box
              sx={{
                p: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Báo cáo bảo trì sân
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Danh sách báo cáo sự cố từ nhân viên các chi nhánh
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => refetchReports()}
                disabled={reportsLoading}
                size="small"
              >
                Làm mới
              </Button>
            </Box>

            <Box sx={{ p: 3 }}>
              {reportsError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Lỗi khi tải danh sách báo cáo bảo trì
                </Alert>
              ) : reportsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : !maintenanceReports || maintenanceReports.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">Không có báo cáo bảo trì nào</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Tên sân</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Chi nhánh</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Người báo cáo</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Mô tả sự cố</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {maintenanceReports.map((report) => (
                        <TableRow key={report.id} hover>
                          <TableCell>
                            <Chip label={`#${report.id}`} size="small" color="primary" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {report.courtName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {report.branchName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={report.reporterName}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 400,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {report.description}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  );
};
