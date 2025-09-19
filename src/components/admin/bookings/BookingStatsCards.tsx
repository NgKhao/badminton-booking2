import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  EventNote,
} from '@mui/icons-material';

interface Booking {
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface BookingStatsCardsProps {
  bookings: Booking[];
}

export const BookingStatsCards: React.FC<BookingStatsCardsProps> = ({ bookings }) => {
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;
  const totalCount = bookings.length;

  return (
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
                Đã xác nhận
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {confirmedCount}
              </Typography>
            </Box>
            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
          </Box>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Chờ xác nhận
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {pendingCount}
              </Typography>
            </Box>
            <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
          </Box>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Đã hủy
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {cancelledCount}
              </Typography>
            </Box>
            <CancelIcon sx={{ fontSize: 40, color: 'error.main' }} />
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
                {totalCount}
              </Typography>
            </Box>
            <EventNote sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
