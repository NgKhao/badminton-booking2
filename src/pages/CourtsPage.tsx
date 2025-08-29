import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Rating,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  FilterList,
  LocationOn,
  AcUnit,
  WbSunny,
  Schedule,
  Star,
  Close,
  SportsTennis,
} from '@mui/icons-material';
import type { Court } from '../types';

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
  const [filters, setFilters] = useState({
    courtType: '',
    priceRange: '',
    sortBy: 'price-asc',
  });

  // Filter functions
  const applyFilters = React.useCallback(() => {
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

  React.useEffect(() => {
    applyFilters();
  }, [filters]);

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
    if (selectedCourt) {
      // TODO: Navigate to booking page with selected court
      console.log('Book court:', selectedCourt);
      setSelectedCourt(null);
    }
  };

  return (
    <Box className="min-h-screen bg-gray-50">
      <Container maxWidth="lg" className="py-8">
        {/* Header */}
        <Box className="mb-8">
          <Typography variant="h4" className="font-bold text-gray-900 mb-2">
            Chọn sân cầu lông
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Tìm và đặt sân phù hợp với nhu cầu của bạn
          </Typography>
        </Box>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent>
            <Box className="flex items-center gap-4 flex-wrap">
              <Box className="flex items-center gap-2">
                <FilterList className="text-gray-600" />
                <Typography variant="h6" className="font-semibold">
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
        <Grid container spacing={3}>
          {filteredCourts.map((court) => (
            <Grid item xs={12} md={6} lg={4} key={court.court_id}>
              <Card
                className={`hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  court.status !== 'available' ? 'opacity-60' : ''
                }`}
                onClick={() => handleSelectCourt(court)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={court.images?.[0] || '/api/placeholder/400/300'}
                  alt={court.court_name}
                />
                <CardContent>
                  <Box className="flex justify-between items-start mb-2">
                    <Typography variant="h6" className="font-semibold">
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
                      className={
                        court.court_type === 'Trong nhà'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }
                    />
                  </Box>

                  <Typography variant="body2" className="text-gray-600 mb-3" noWrap>
                    {court.description}
                  </Typography>

                  <Box className="flex justify-between items-center mb-3">
                    <Typography variant="h6" className="text-emerald-600 font-bold">
                      {court.hourly_rate.toLocaleString('vi-VN')}đ/giờ
                    </Typography>
                    <Chip
                      label={getStatusText(court.status)}
                      size="small"
                      color={getStatusColor(court.status)}
                    />
                  </Box>

                  <Box className="flex items-center justify-between">
                    <Box className="flex items-center gap-1">
                      <LocationOn fontSize="small" className="text-gray-400" />
                      <Typography variant="body2" className="text-gray-600">
                        Địa điểm 1
                      </Typography>
                    </Box>
                    <Rating value={4.5} precision={0.1} readOnly size="small" />
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    className="mt-3 bg-emerald-500 hover:bg-emerald-600"
                    startIcon={<SportsTennis />}
                    disabled={court.status !== 'available'}
                  >
                    {court.status === 'available' ? 'Đặt sân' : 'Không khả dụng'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Court Detail Dialog */}
        <Dialog
          open={!!selectedCourt}
          onClose={() => setSelectedCourt(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box className="flex justify-between items-center">
              <Typography variant="h5" className="font-bold">
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
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />

                <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <LocationOn className="text-gray-500" />
                        <Typography>Địa điểm 1</Typography>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <Schedule className="text-gray-500" />
                        <Typography>Mở cửa 06:00 - 22:00</Typography>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <Star className="text-amber-500" />
                        <Rating value={4.5} precision={0.1} readOnly size="small" />
                        <Typography>(4.5/5)</Typography>
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
                    <Typography variant="body2" className="text-gray-600 mb-4">
                      {selectedCourt.description}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      className="bg-emerald-500 hover:bg-emerald-600"
                      onClick={handleBookCourt}
                    >
                      Đặt sân ngay
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};
