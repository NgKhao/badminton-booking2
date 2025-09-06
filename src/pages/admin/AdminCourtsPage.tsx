import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  SportsTennis,
  Visibility,
  Search,
  Refresh,
  Save,
  Cancel,
  CheckCircle,
  Warning,
  WbSunny,
  AcUnit,
  TrendingUp,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Types based on database schema
interface Court {
  court_id: number;
  court_name: string;
  court_type: 'Trong nhà' | 'Ngoài trời';
  status: 'available' | 'maintenance' | 'unavailable';
  hourly_rate: number;
  description: string;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CourtFormData {
  court_name: string;
  court_type: 'Trong nhà' | 'Ngoài trời';
  status: 'available' | 'maintenance' | 'unavailable';
  hourly_rate: number;
  description: string;
  images: string[];
  is_active: boolean;
}

// Mock data
const mockCourts: Court[] = [
  {
    court_id: 1,
    court_name: 'Sân VIP 1',
    court_type: 'Trong nhà',
    status: 'available',
    hourly_rate: 150000,
    description: 'Sân cầu lông VIP với điều hòa và ánh sáng LED chuyên nghiệp',
    images: ['/api/placeholder/400/300'],
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    court_id: 2,
    court_name: 'Sân Standard 1',
    court_type: 'Trong nhà',
    status: 'available',
    hourly_rate: 120000,
    description: 'Sân cầu lông tiêu chuẩn với trang thiết bị đầy đủ',
    images: ['/api/placeholder/400/300'],
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    court_id: 3,
    court_name: 'Sân Ngoài trời A',
    court_type: 'Ngoài trời',
    status: 'maintenance',
    hourly_rate: 100000,
    description: 'Sân ngoài trời rộng rãi với view thiên nhiên đẹp',
    images: ['/api/placeholder/400/300'],
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    court_id: 4,
    court_name: 'Sân Ngoài trời B',
    court_type: 'Ngoài trời',
    status: 'unavailable',
    hourly_rate: 100000,
    description: 'Sân ngoài trời với không gian thoáng đãng',
    images: ['/api/placeholder/400/300'],
    is_active: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

export const AdminCourtsPage: React.FC = () => {
  const theme = useTheme();
  const [courts, setCourts] = useState<Court[]>(mockCourts);
  const [filteredCourts, setFilteredCourts] = useState<Court[]>(mockCourts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CourtFormData>({
    court_name: '',
    court_type: 'Trong nhà',
    status: 'available',
    hourly_rate: 0,
    description: '',
    images: [],
    is_active: true,
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Filter and search logic
  React.useEffect(() => {
    let filtered = courts;

    if (searchTerm) {
      filtered = filtered.filter(
        (court) =>
          court.court_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          court.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((court) => court.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((court) => court.court_type === filterType);
    }

    setFilteredCourts(filtered);
  }, [courts, searchTerm, filterStatus, filterType]);

  // Helper functions
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
        return 'Không khả dụng';
      default:
        return status;
    }
  };

  const getCourtTypeIcon = (type: string) => {
    return type === 'Trong nhà' ? <AcUnit /> : <WbSunny />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // CRUD operations
  const handleAdd = () => {
    setEditMode(false);
    setFormData({
      court_name: '',
      court_type: 'Trong nhà',
      status: 'available',
      hourly_rate: 0,
      description: '',
      images: [],
      is_active: true,
    });
    setOpenDialog(true);
  };

  const handleEdit = (court: Court) => {
    setEditMode(true);
    setSelectedCourt(court);
    setFormData({
      court_name: court.court_name,
      court_type: court.court_type,
      status: court.status,
      hourly_rate: court.hourly_rate,
      description: court.description,
      images: court.images,
      is_active: court.is_active,
    });
    setOpenDialog(true);
  };

  const handleView = (court: Court) => {
    setSelectedCourt(court);
    setOpenViewDialog(true);
  };

  const handleDelete = (court: Court) => {
    setSelectedCourt(court);
    setOpenDeleteDialog(true);
  };

  const handleSave = () => {
    if (!formData.court_name || !formData.hourly_rate) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        severity: 'error',
      });
      return;
    }

    if (editMode && selectedCourt) {
      // Update court
      const updatedCourt: Court = {
        ...selectedCourt,
        ...formData,
        updated_at: new Date().toISOString(),
      };
      setCourts(
        courts.map((court) => (court.court_id === selectedCourt.court_id ? updatedCourt : court))
      );
      setSnackbar({
        open: true,
        message: 'Cập nhật sân thành công!',
        severity: 'success',
      });
    } else {
      // Add new court
      const newCourt: Court = {
        court_id: Math.max(...courts.map((c) => c.court_id)) + 1,
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCourts([...courts, newCourt]);
      setSnackbar({
        open: true,
        message: 'Thêm sân mới thành công!',
        severity: 'success',
      });
    }

    setOpenDialog(false);
  };

  const confirmDelete = () => {
    if (selectedCourt) {
      setCourts(courts.filter((court) => court.court_id !== selectedCourt.court_id));
      setSnackbar({
        open: true,
        message: 'Xóa sân thành công!',
        severity: 'success',
      });
      setOpenDeleteDialog(false);
    }
  };

  const toggleCourtStatus = (court: Court) => {
    const updatedCourt = {
      ...court,
      is_active: !court.is_active,
      updated_at: new Date().toISOString(),
    };
    setCourts(courts.map((c) => (c.court_id === court.court_id ? updatedCourt : c)));
    setSnackbar({
      open: true,
      message: `${court.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'} sân thành công!`,
      severity: 'success',
    });
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
          Quản lý sân
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin và trạng thái các sân cầu lông
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Tổng sân
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {courts.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <SportsTennis />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Sân hoạt động
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {courts.filter((c) => c.status === 'available').length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                <CheckCircle />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Đang bảo trì
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {courts.filter((c) => c.status === 'maintenance').length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                <Warning />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Doanh thu/giờ
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                  {formatCurrency(courts.reduce((sum, c) => sum + c.hourly_rate, 0)).slice(0, -1)}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                <TrendingUp />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters and Actions */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
            <TextField
              placeholder="Tìm kiếm sân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ minWidth: 250 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                label="Trạng thái"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="available">Có sẵn</MenuItem>
                <MenuItem value="maintenance">Bảo trì</MenuItem>
                <MenuItem value="unavailable">Không khả dụng</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Loại sân</InputLabel>
              <Select
                value={filterType}
                label="Loại sân"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="Trong nhà">Trong nhà</MenuItem>
                <MenuItem value="Ngoài trời">Ngoài trời</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterType('all');
              }}
            >
              Làm mới
            </Button>

            <Box sx={{ flexGrow: 1 }} />

            <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
              Thêm sân mới
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Courts Table - COMPACT SIZE */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table size="small" sx={{ '& .MuiTableCell-root': { py: 1 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Sân</TableCell>
                <TableCell>Loại sân</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Giá/giờ</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Hoạt động</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourts.map((court) => (
                <TableRow key={court.court_id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 32,
                          height: 32,
                          fontSize: '0.875rem',
                        }}
                      >
                        {court.court_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                          {court.court_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {court.court_id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getCourtTypeIcon(court.court_type)}
                      <Typography variant="body2">{court.court_type}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(court.status)}
                      size="small"
                      color={getStatusColor(court.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {formatCurrency(court.hourly_rate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {court.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={court.is_active}
                      onChange={() => toggleCourtStatus(court)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton size="small" onClick={() => handleView(court)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" onClick={() => handleEdit(court)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton size="small" onClick={() => handleDelete(court)} color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Chỉnh sửa sân' : 'Thêm sân mới'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}
            >
              <TextField
                label="Tên sân"
                value={formData.court_name}
                onChange={(e) => setFormData({ ...formData, court_name: e.target.value })}
                fullWidth
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Loại sân</InputLabel>
                <Select
                  value={formData.court_type}
                  label="Loại sân"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      court_type: e.target.value as 'Trong nhà' | 'Ngoài trời',
                    })
                  }
                >
                  <MenuItem value="Trong nhà">Trong nhà</MenuItem>
                  <MenuItem value="Ngoài trời">Ngoài trời</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}
            >
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng thái"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'available' | 'maintenance' | 'unavailable',
                    })
                  }
                >
                  <MenuItem value="available">Có sẵn</MenuItem>
                  <MenuItem value="maintenance">Bảo trì</MenuItem>
                  <MenuItem value="unavailable">Không khả dụng</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Giá thuê (VNĐ/giờ)"
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
                fullWidth
                required
              />
            </Box>
            <TextField
              label="Mô tả"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Kích hoạt sân"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>
            Hủy
          </Button>
          <Button variant="contained" onClick={handleSave} startIcon={<Save />}>
            {editMode ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              {selectedCourt?.court_name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedCourt?.court_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Chi tiết thông tin sân
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCourt && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Loại sân
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getCourtTypeIcon(selectedCourt.court_type)}
                  <Typography variant="body1">{selectedCourt.court_type}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Trạng thái
                </Typography>
                <Chip
                  label={getStatusText(selectedCourt.status)}
                  size="small"
                  color={getStatusColor(selectedCourt.status)}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Giá thuê
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(selectedCourt.hourly_rate)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Mô tả
                </Typography>
                <Typography variant="body1">{selectedCourt.description}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Trạng thái hoạt động
                </Typography>
                <Chip
                  label={selectedCourt.is_active ? 'Đang hoạt động' : 'Tạm ngưng'}
                  size="small"
                  color={selectedCourt.is_active ? 'success' : 'error'}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedCourt) {
                setOpenViewDialog(false);
                handleEdit(selectedCourt);
              }
            }}
          >
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa sân "{selectedCourt?.court_name}"?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
