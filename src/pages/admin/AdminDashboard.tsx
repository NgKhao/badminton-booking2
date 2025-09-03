import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  SportsTennis,
  People,
  EventNote,
  AttachMoney,
  MoreVert,
  CheckCircle,
  PendingActions,
  Cancel,
} from '@mui/icons-material';

// Mock data for dashboard
const stats = [
  {
    title: 'Tổng doanh thu',
    value: '12.5M',
    unit: 'VNĐ',
    change: '+12.5%',
    isPositive: true,
    icon: <AttachMoney />,
    color: 'success.main',
  },
  {
    title: 'Lượt đặt sân',
    value: '245',
    unit: 'lượt',
    change: '+8.2%',
    isPositive: true,
    icon: <EventNote />,
    color: 'primary.main',
  },
  {
    title: 'Khách hàng',
    value: '189',
    unit: 'người',
    change: '+15.3%',
    isPositive: true,
    icon: <People />,
    color: 'info.main',
  },
  {
    title: 'Tỷ lệ sử dụng sân',
    value: '78%',
    unit: '',
    change: '-2.1%',
    isPositive: false,
    icon: <SportsTennis />,
    color: 'warning.main',
  },
];

const recentBookings = [
  {
    id: 'BK001',
    customerName: 'Nguyễn Văn A',
    court: 'Sân VIP 1',
    time: '14:00 - 16:00',
    date: '2025-09-03',
    status: 'confirmed',
    amount: '300,000',
  },
  {
    id: 'BK002',
    customerName: 'Trần Thị B',
    court: 'Sân Ngoài trời A',
    time: '16:00 - 18:00',
    date: '2025-09-03',
    status: 'pending',
    amount: '200,000',
  },
  {
    id: 'BK003',
    customerName: 'Lê Văn C',
    court: 'Sân Standard 1',
    time: '18:00 - 20:00',
    date: '2025-09-03',
    status: 'confirmed',
    amount: '240,000',
  },
  {
    id: 'BK004',
    customerName: 'Phạm Thị D',
    court: 'Sân VIP 2',
    time: '20:00 - 22:00',
    date: '2025-09-03',
    status: 'cancelled',
    amount: '300,000',
  },
];

const courtStatus = [
  { name: 'Sân VIP 1', status: 'occupied', nextAvailable: '16:00' },
  { name: 'Sân VIP 2', status: 'available', nextAvailable: null },
  { name: 'Sân Standard 1', status: 'occupied', nextAvailable: '20:00' },
  { name: 'Sân Standard 2', status: 'maintenance', nextAvailable: 'Sáng mai' },
  { name: 'Sân Ngoài trời A', status: 'occupied', nextAvailable: '18:00' },
  { name: 'Sân Ngoài trời B', status: 'available', nextAvailable: null },
];

export const AdminDashboard: React.FC = () => {
  const theme = useTheme();

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

  const getCourtStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return theme.palette.success.main;
      case 'occupied':
        return theme.palette.warning.main;
      case 'maintenance':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getCourtStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'occupied':
        return 'Đang sử dụng';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tổng quan hoạt động hệ thống BadmintonHub
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat) => (
          <Card
            key={stat.title}
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stat.value}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      {stat.unit}
                    </Typography>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {stat.isPositive ? (
                      <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        color: stat.isPositive ? 'success.main' : 'error.main',
                        fontWeight: 'medium',
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: stat.color,
                    width: 56,
                    height: 56,
                  }}
                >
                  {stat.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
        }}
      >
        {/* Recent Bookings */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            height: 'fit-content',
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Đặt sân gần đây
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
          </Box>
          <List sx={{ p: 0 }}>
            {recentBookings.map((booking, index) => (
              <ListItem
                key={booking.id}
                sx={{
                  borderBottom: index < recentBookings.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  py: 2,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {booking.customerName.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {booking.customerName}
                      </Typography>
                      <Chip
                        label={getStatusText(booking.status)}
                        size="small"
                        color={getStatusColor(booking.status)}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {booking.court} • {booking.time}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.date} • {booking.amount} VNĐ
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {booking.status === 'confirmed' && (
                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                  )}
                  {booking.status === 'pending' && (
                    <PendingActions sx={{ color: 'warning.main', fontSize: 20 }} />
                  )}
                  {booking.status === 'cancelled' && (
                    <Cancel sx={{ color: 'error.main', fontSize: 20 }} />
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Court Status */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            height: 'fit-content',
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Trạng thái sân
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            {courtStatus.map((court, index) => (
              <Box
                key={court.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1.5,
                  borderBottom: index < courtStatus.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                    {court.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: getCourtStatusColor(court.status),
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {getCourtStatusText(court.status)}
                    </Typography>
                  </Box>
                </Box>
                {court.nextAvailable && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Rảnh lúc
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {court.nextAvailable}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
