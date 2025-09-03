import { useState, useCallback, useEffect } from 'react';
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
} from '@mui/material';
import {
  FilterList,
  AcUnit,
  WbSunny,
  Schedule,
  Close,
  SportsTennis,
  Login,
} from '@mui/icons-material';
import type { Court } from '../../types';
import { useAuthStore } from '../../store/authStore';

// Mock data cho sân cầu lông
const mockCourts: Court[] = [
  {
    court_id: 1,
    court_name: 'Sân VIP 1',
    court_type: 'Trong nhà',
    status: 'available',
    hourly_rate: 150000,
    description: 'Sân VIP với đầy đủ tiện nghi cao cấp, điều hòa mát lạnh, âm thanh chuyên nghiệp',
    images: ['/api/placeholder/400/300'],
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    court_id: 2,
    court_name: 'Sân Ngoài trời A',
    court_type: 'Ngoài trời',
    status: 'available',
    hourly_rate: 100000,
    description: 'Sân ngoài trời thoáng mát, không gian rộng rãi, giá cả phải chăng',
    images: ['/api/placeholder/400/300'],
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    court_id: 3,
    court_name: 'Sân Premium 2',
    court_type: 'Trong nhà',
    status: 'available',
    hourly_rate: 200000,
    description: 'Sân premium với dịch vụ 5 sao, VIP lounge, đồ uống miễn phí',
    images: ['/api/placeholder/400/300'],
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    court_id: 4,
    court_name: 'Sân Ngoài trời B',
    court_type: 'Ngoài trời',
    status: 'available',
    hourly_rate: 90000,
    description: 'Sân ngoài trời giá rẻ, phù hợp cho việc luyện tập hàng ngày',
    images: ['/api/placeholder/400/300'],
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    court_id: 5,
    court_name: 'Sân Standard 1',
    court_type: 'Trong nhà',
    status: 'available',
    hourly_rate: 120000,
    description: 'Sân standard với chất lượng tốt, giá cả hợp lý',
    images: ['/api/placeholder/400/300'],
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    court_id: 6,
    court_name: 'Sân Standard 2',
    court_type: 'Trong nhà',
    status: 'maintenance',
    hourly_rate: 120000,
    description: 'Sân đang bảo trì, sẽ mở lại sớm',
    images: ['/api/placeholder/400/300'],
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

export const CourtsPage: React.FC = () => {
  const [courts] = useState<Court[]>(mockCourts);
  const [filteredCourts, setFilteredCourts] = useState<Court[]>(mockCourts);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [filters, setFilters] = useState({
    courtType: '',
    priceRange: '',
    sortBy: 'price-asc',
  });

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Filter functions
  const applyFilters = useCallback(() => {
    let filtered = [...courts];

    // Filter by court type
    if (filters.courtType) {
      filtered = filtered.filter((court) => court.court_type === filters.courtType);
    }

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter((court) => court.hourly_rate >= min && court.hourly_rate <= max);
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.hourly_rate - b.hourly_rate);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.hourly_rate - a.hourly_rate);
        break;
      case 'name':
        filtered.sort((a, b) => a.court_name.localeCompare(b.court_name));
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
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'available':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'unavailable':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'maintenance':
        return 'Bảo trì';
      case 'unavailable':
        return 'Không có sẵn';
      default:
        return status;
    }
  };

  const handleSelectCourt = (court: Court) => {
    if (court.status === 'available') {
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
              key={court.court_id}
              sx={{
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                opacity: court.status !== 'available' ? 0.6 : 1,
              }}
              onClick={() => handleSelectCourt(court)}
            >
              <CardMedia
                component="img"
                height="200"
                image={court.images?.[0] || '/api/placeholder/400/300'}
                alt={court.court_name}
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
                    {court.court_name}
                  </Typography>
                  <Chip
                    icon={
                      court.court_type === 'Trong nhà' ? (
                        <AcUnit fontSize="small" />
                      ) : (
                        <WbSunny fontSize="small" />
                      )
                    }
                    label={court.court_type}
                    size="small"
                    color={court.court_type === 'Trong nhà' ? 'primary' : 'secondary'}
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                  {court.description}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {court.hourly_rate.toLocaleString('vi-VN')}đ/giờ
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
                  disabled={court.status !== 'available'}
                >
                  {court.status === 'available' ? 'Xem chi tiết' : 'Không khả dụng'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Court Detail Dialog */}
        <Dialog
          open={!!selectedCourt}
          onClose={() => setSelectedCourt(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {selectedCourt?.court_name}
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
                  src={selectedCourt.images?.[0] || '/api/placeholder/600/400'}
                  alt={selectedCourt.court_name}
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
                        {selectedCourt.court_type === 'Trong nhà' ? (
                          <AcUnit className="text-blue-500" />
                        ) : (
                          <WbSunny className="text-amber-500" />
                        )}
                        <Typography>{selectedCourt.court_type}</Typography>
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
                  </Box>

                  <Box>
                    <Typography variant="h6" className="font-semibold mb-2">
                      Giá và đặt sân
                    </Typography>
                    <Typography variant="h4" className="text-emerald-600 font-bold mb-4">
                      {selectedCourt.hourly_rate.toLocaleString('vi-VN')}đ/giờ
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
      </Container>
    </Box>
  );
};
