import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert,
  Snackbar,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  FilterList,
  AcUnit,
  WbSunny,
  Schedule,
  Close,
  SportsTennis,
  Login,
  LocationOn,
  Phone,
  Store,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import type { Court } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useCourts, usePublicBranches, useFreeCourts } from '../../hooks/useApi';
import courtImage from '../../assets/court.jpg';

export const CourtsPage: React.FC = () => {
  // Pagination state
  const [page, setPage] = useState(1); // Material-UI Pagination uses 1-based indexing
  const [pageSize] = useState(6);

  // Time filter state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);
  const [useTimeFilter, setUseTimeFilter] = useState(false);

  // Format time filter params
  const timeFilterParams = useMemo(() => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return null;
    return {
      date: format(selectedDate, 'yyyy-MM-dd'),
      start: format(selectedStartTime, 'HH:mm'),
      end: format(selectedEndTime, 'HH:mm'),
    };
  }, [selectedDate, selectedStartTime, selectedEndTime]);

  // React Query hooks - conditional based on time filter
  const {
    data: regularData,
    isLoading: regularLoading,
    error: regularError,
    refetch: regularRefetch,
  } = useCourts({ page: page - 1, size: pageSize }, { enabled: !useTimeFilter });

  const {
    data: freeCourtsList,
    isLoading: freeLoading,
    error: freeError,
    refetch: freeRefetch,
  } = useFreeCourts(timeFilterParams!, { enabled: useTimeFilter && !!timeFilterParams });

  // Determine which data to use
  const isLoading = useTimeFilter ? freeLoading : regularLoading;
  const error = useTimeFilter ? freeError : regularError;
  const refetch = useTimeFilter ? freeRefetch : regularRefetch;

  // Get courts and pagination
  const courts = useMemo(() => {
    if (useTimeFilter) {
      // Reverse order for time filter results
      return [...(freeCourtsList || [])].reverse();
    }
    return regularData?.courts || [];
  }, [useTimeFilter, freeCourtsList, regularData]);

  const pagination = regularData?.pagination; // Pagination only for regular view

  // Fetch public branches for filtering (no auth required)
  const { data: branchesData } = usePublicBranches();
  const branches = useMemo(() => branchesData || [], [branchesData]);

  const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [filters, setFilters] = useState({
    courtType: '',
    priceRange: '',
    branchId: '',
  });

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Apply time filter
  const handleApplyTimeFilter = () => {
    if (selectedDate && selectedStartTime && selectedEndTime) {
      setUseTimeFilter(true);
      setPage(1); // Reset to first page
    }
  };

  // Clear time filter
  const handleClearTimeFilter = () => {
    setUseTimeFilter(false);
    setSelectedDate(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setPage(1); // Reset to first page
  };

  // Filter functions
  const applyFilters = useCallback(() => {
    let filtered = [...courts];

    // Filter by court type
    if (filters.courtType) {
      // Map Vietnamese filter to API format
      const typeMapping: { [key: string]: 'INDOOR' | 'OUTDOOR' } = {
        'Trong nhà': 'INDOOR',
        'Ngoài trời': 'OUTDOOR',
      };
      const mappedType = typeMapping[filters.courtType];
      if (mappedType) {
        filtered = filtered.filter((court) => court.courtType === mappedType);
      }
    }

    // Filter by branch
    if (filters.branchId) {
      filtered = filtered.filter((court) => court.branchId?.toString() === filters.branchId);
    }

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter((court) => court.hourlyRate >= min && court.hourlyRate <= max);
    }

    // No sorting - display in original API order
    setFilteredCourts(filtered);
  }, [courts, filters]);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'MAINTENANCE':
        return 'warning';
      case 'UNAVAILABLE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Có sẵn';
      case 'MAINTENANCE':
        return 'Bảo trì';
      case 'UNAVAILABLE':
        return 'Không có sẵn';
      default:
        return status;
    }
  };

  const getCourtTypeText = (type: 'INDOOR' | 'OUTDOOR') => {
    return type === 'INDOOR' ? 'Trong nhà' : 'Ngoài trời';
  };

  const getCourtTypeIcon = (type: 'INDOOR' | 'OUTDOOR') => {
    return type === 'INDOOR' ? <AcUnit /> : <WbSunny />;
  };

  const handleSelectCourt = (court: Court) => {
    if (court.status === 'AVAILABLE') {
      setSelectedCourt(court);
    }
  };

  const handleBookCourt = () => {
    if (!isAuthenticated) {
      setShowLoginAlert(true);
      return;
    }

    if (selectedCourt) {
      // Navigate to booking page with selected court and optional time params
      const navigationState: {
        selectedCourt: Court;
        selectedDate?: Date;
        selectedStartTime?: Date;
        selectedEndTime?: Date;
      } = {
        selectedCourt,
      };

      // If time filter is active, pass the time parameters
      if (useTimeFilter && selectedDate && selectedStartTime && selectedEndTime) {
        navigationState.selectedDate = selectedDate;
        navigationState.selectedStartTime = selectedStartTime;
        navigationState.selectedEndTime = selectedEndTime;
      }

      navigate('/booking', { state: navigationState });
      setSelectedCourt(null);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/auth');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Loading state */}
        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            Lỗi khi tải danh sách sân: {error.message}
            <Button onClick={() => refetch()} sx={{ ml: 2 }}>
              Thử lại
            </Button>
          </Alert>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
                Chọn sân cầu lông
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tìm và đặt sân phù hợp với nhu cầu của bạn
              </Typography>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 4, boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                {/* Basic Filters Section */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <FilterList color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Bộ lọc cơ bản
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                      },
                      gap: 2,
                    }}
                  >
                    <FormControl size="small" fullWidth>
                      <InputLabel>Chi nhánh</InputLabel>
                      <Select
                        value={filters.branchId}
                        label="Chi nhánh"
                        onChange={(e) => handleFilterChange('branchId', e.target.value)}
                        disabled={useTimeFilter}
                      >
                        <MenuItem value="">Tất cả chi nhánh</MenuItem>
                        {branches.map((branch) => (
                          <MenuItem key={branch.id} value={branch.id.toString()}>
                            {branch.branchName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth>
                      <InputLabel>Loại sân</InputLabel>
                      <Select
                        value={filters.courtType}
                        label="Loại sân"
                        onChange={(e) => handleFilterChange('courtType', e.target.value)}
                        disabled={useTimeFilter}
                      >
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value="Trong nhà">Trong nhà</MenuItem>
                        <MenuItem value="Ngoài trời">Ngoài trời</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth>
                      <InputLabel>Khoảng giá</InputLabel>
                      <Select
                        value={filters.priceRange}
                        label="Khoảng giá"
                        onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                        disabled={useTimeFilter}
                      >
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value="0-100000">Dưới 100k</MenuItem>
                        <MenuItem value="100000-150000">100k - 150k</MenuItem>
                        <MenuItem value="150000-200000">150k - 200k</MenuItem>
                        <MenuItem value="200000-999999">Trên 200k</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Divider */}
                <Box sx={{ borderTop: 1, borderColor: 'divider', my: 3 }} />

                {/* Time Filter Section */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Schedule color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Lọc theo thời gian
                    </Typography>
                  </Box>

                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(4, 1fr)',
                        },
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <DatePicker
                        label="Chọn ngày"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        disablePast
                        minDate={new Date()}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                          },
                        }}
                      />

                      <TimePicker
                        label="Giờ bắt đầu"
                        value={selectedStartTime}
                        onChange={(newValue) => setSelectedStartTime(newValue)}
                        ampm={false}
                        minTime={new Date(2000, 0, 1, 6, 0)}
                        maxTime={new Date(2000, 0, 1, 22, 0)}
                        minutesStep={30}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                          },
                        }}
                      />

                      <TimePicker
                        label="Giờ kết thúc"
                        value={selectedEndTime}
                        onChange={(newValue) => setSelectedEndTime(newValue)}
                        ampm={false}
                        minTime={new Date(2000, 0, 1, 6, 0)}
                        maxTime={new Date(2000, 0, 1, 22, 0)}
                        minutesStep={30}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                          },
                        }}
                      />

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleApplyTimeFilter}
                          disabled={!selectedDate || !selectedStartTime || !selectedEndTime}
                          sx={{ height: '40px' }}
                        >
                          Áp dụng
                        </Button>
                        {useTimeFilter && (
                          <Button
                            variant="outlined"
                            onClick={handleClearTimeFilter}
                            sx={{ minWidth: '40px', height: '40px', px: 1 }}
                          >
                            <Close />
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </LocalizationProvider>

                  {useTimeFilter && (
                    <Alert severity="success" icon={<Schedule />} sx={{ mt: 1 }}>
                      Hiển thị sân trống từ{' '}
                      <strong>{selectedStartTime && format(selectedStartTime, 'HH:mm')}</strong> đến{' '}
                      <strong>{selectedEndTime && format(selectedEndTime, 'HH:mm')}</strong> vào{' '}
                      <strong>{selectedDate && format(selectedDate, 'dd/MM/yyyy')}</strong>
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Courts Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
                gap: 3,
              }}
            >
              {filteredCourts.map((court) => (
                <Card
                  key={court.id}
                  sx={{
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    opacity: court.status !== 'AVAILABLE' ? 0.6 : 1,
                  }}
                  onClick={() => handleSelectCourt(court)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={`${import.meta.env.VITE_IMG_URL}${court.images?.[0]}` || courtImage}
                    alt={court.courtName}
                    sx={{ height: 192, objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                        {court.courtName}
                      </Typography>
                      <Chip
                        icon={getCourtTypeIcon(court.courtType)}
                        label={getCourtTypeText(court.courtType)}
                        size="small"
                        color={court.courtType === 'INDOOR' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                      {court.description}
                    </Typography>

                    {/* Branch Info */}
                    {court.branchName && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mb: 1.5,
                          p: 1,
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                        }}
                      >
                        <Store fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {court.branchName}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {court.hourlyRate.toLocaleString('vi-VN')}đ/giờ
                      </Typography>
                      <Chip
                        label={getStatusText(court.status)}
                        size="small"
                        color={getStatusColor(court.status)}
                      />
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<SportsTennis />}
                      disabled={court.status !== 'AVAILABLE'}
                    >
                      {court.status === 'AVAILABLE' ? 'Xem chi tiết' : 'Không khả dụng'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}

            {/* Court Detail Dialog */}
            <Dialog
              open={!!selectedCourt}
              onClose={() => setSelectedCourt(null)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {selectedCourt?.courtName}
                  </Typography>
                  <IconButton onClick={() => setSelectedCourt(null)}>
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                {selectedCourt && (
                  <Box>
                    <img
                      src={
                        `${import.meta.env.VITE_IMG_URL}${selectedCourt.images?.[0]}` || courtImage
                      }
                      alt={selectedCourt.courtName}
                      style={{
                        width: '100%',
                        height: 256,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginBottom: 16,
                      }}
                    />

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 3,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" className="font-semibold mb-2">
                          Thông tin sân
                        </Typography>
                        <Box className="space-y-2">
                          <Box className="flex items-center gap-2">
                            {getCourtTypeIcon(selectedCourt.courtType)}
                            <Typography>{getCourtTypeText(selectedCourt.courtType)}</Typography>
                          </Box>
                          <Box className="flex items-center gap-2">
                            <Schedule className="text-gray-500" />
                            <Typography>Mở cửa 06:00 - 22:00</Typography>
                          </Box>
                          <Box className="flex items-center gap-2">
                            <Typography variant="body2" className="text-gray-600 mb-4">
                              {selectedCourt.description}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Branch Information */}
                        {selectedCourt.branchName && (
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" className="font-semibold mb-2">
                              Chi nhánh
                            </Typography>
                            <Box className="space-y-2">
                              <Box className="flex items-start gap-2">
                                <Store className="text-gray-500" sx={{ mt: 0.5 }} />
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {selectedCourt.branchName}
                                  </Typography>
                                </Box>
                              </Box>
                              {selectedCourt.branchAddress && (
                                <Box className="flex items-start gap-2">
                                  <LocationOn className="text-gray-500" sx={{ mt: 0.5 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {selectedCourt.branchAddress}
                                  </Typography>
                                </Box>
                              )}
                              {selectedCourt.branchPhone && (
                                <Box className="flex items-center gap-2">
                                  <Phone className="text-gray-500" />
                                  <Typography variant="body2" color="text.secondary">
                                    {selectedCourt.branchPhone}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}
                      </Box>

                      <Box>
                        <Typography variant="h6" className="font-semibold mb-2">
                          Giá và đặt sân
                        </Typography>
                        <Typography variant="h4" className="text-emerald-600 font-bold mb-4">
                          {selectedCourt.hourlyRate.toLocaleString('vi-VN')}đ/giờ
                        </Typography>

                        {!isAuthenticated ? (
                          <Box className="space-y-3">
                            <Alert severity="info" className="mb-3">
                              Bạn cần đăng nhập để đặt sân
                            </Alert>
                            <Button
                              fullWidth
                              variant="outlined"
                              size="large"
                              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 mb-2"
                              startIcon={<Login />}
                              onClick={handleLoginRedirect}
                            >
                              Đăng nhập để đặt sân
                            </Button>
                          </Box>
                        ) : (
                          <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            className="bg-emerald-500 hover:bg-emerald-600"
                            onClick={handleBookCourt}
                          >
                            Đặt sân ngay
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
              </DialogContent>
            </Dialog>

            {/* Login Alert Snackbar */}
            <Snackbar
              open={showLoginAlert}
              autoHideDuration={6000}
              onClose={() => setShowLoginAlert(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert
                onClose={() => setShowLoginAlert(false)}
                severity="info"
                className="w-full"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={handleLoginRedirect}
                    className="text-blue-600"
                  >
                    Đăng nhập
                  </Button>
                }
              >
                Bạn cần đăng nhập để đặt sân!
              </Alert>
            </Snackbar>
          </>
        )}
      </Container>
    </Box>
  );
};
