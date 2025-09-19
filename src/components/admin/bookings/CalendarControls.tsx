import React from 'react';
import {
  Box,
  Card,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface Court {
  court_id: number;
  court_name: string;
  court_type: string;
  hourly_rate: number;
}

interface CalendarControlsProps {
  showConflicts: boolean;
  onShowConflictsChange: (checked: boolean) => void;
  selectedCourt: number | 'all';
  onSelectedCourtChange: (court: number | 'all') => void;
  courts: Court[];
  onRefresh: () => void;
  onAddBooking: () => void;
}

export const CalendarControls: React.FC<CalendarControlsProps> = ({
  showConflicts,
  onShowConflictsChange,
  selectedCourt,
  onSelectedCourtChange,
  courts,
  onRefresh,
  onAddBooking,
}) => {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Lọc sân</InputLabel>
            <Select
              value={selectedCourt}
              onChange={(e) => onSelectedCourtChange(e.target.value as number | 'all')}
              label="Lọc sân"
            >
              <MenuItem value="all">Tất cả sân</MenuItem>
              {courts.map((court) => (
                <MenuItem key={court.court_id} value={court.court_id}>
                  {court.court_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh}>
            Làm mới
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddBooking}>
            Thêm đặt sân
          </Button>
        </Box>
      </Box>
    </Card>
  );
};
