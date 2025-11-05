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
import type { Court } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useCourts, usePublicBranches } from '../../hooks/useApi';
import courtImage from '../../assets/court.jpg';

export const CourtsPage: React.FC = () => {
  // Pagination state
  const [page, setPage] = useState(1); // Material-UI Pagination uses 1-based indexing
  const [pageSize] = useState(6);

  // React Query hook for fetching courts with pagination
  const { data, isLoading, error, refetch } = useCourts({ page: page - 1, size: pageSize });

  // Fetch public branches for filtering (no auth required)
  const { data: branchesData } = usePublicBranches();
  const branches = useMemo(() => branchesData || [], [branchesData]);

  const courts = useMemo(() => data?.courts || [], [data]);
  const pagination = data?.pagination;

  const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [filters, setFilters] = useState({
    courtType: '',
    priceRange: '',
    branchId: '',
    sortBy: 'price-asc',
  });

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

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

    // Sort
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.hourlyRate - a.hourlyRate);
        break;
      case 'name':
        filtered.sort((a, b) => a.courtName.localeCompare(b.courtName));
        break;
      default:
        break;
    }

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
      // Navigate to booking page with selected court
      navigate('/booking', { state: { selectedCourt } });
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
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterList color="action" />
                    <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                      Bộ lọc
                    </Typography>
                  </Box>

                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Chi nhánh</InputLabel>
                    <Select
                      value={filters.branchId}
                      label="Chi nhánh"
                      onChange={(e) => handleFilterChange('branchId', e.target.value)}
                    >
                      <MenuItem value="">Tất cả chi nhánh</MenuItem>
                      {branches.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id.toString()}>
                          {branch.branchName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Loại sân</InputLabel>
                    <Select
                      value={filters.courtType}
                      label="Loại sân"
                      onChange={(e) => handleFilterChange('courtType', e.target.value)}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="Trong nhà">Trong nhà</MenuItem>
                      <MenuItem value="Ngoài trời">Ngoài trời</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Giá (VNĐ/giờ)</InputLabel>
                    <Select
                      value={filters.priceRange}
                      label="Giá (VNĐ/giờ)"
                      onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="0-100000">Dưới 100k</MenuItem>
                      <MenuItem value="100000-150000">100k - 150k</MenuItem>
                      <MenuItem value="150000-200000">150k - 200k</MenuItem>
                      <MenuItem value="200000-999999">Trên 200k</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Sắp xếp</InputLabel>
                    <Select
                      value={filters.sortBy}
                      label="Sắp xếp"
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      <MenuItem value="price-asc">Giá tăng dần</MenuItem>
                      <MenuItem value="price-desc">Giá giảm dần</MenuItem>
                      <MenuItem value="name">Tên A-Z</MenuItem>
                    </Select>
                  </FormControl>
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
