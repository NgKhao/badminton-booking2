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
  Visibility,
  Search,
  Refresh,
  Save,
  Cancel,
  CheckCircle,
  Star,
  AttachMoney,
  Group,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Customer types and interfaces (based on data.sql)
interface Customer {
  customer_id: number;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  membership_level: 'basic' | 'premium' | 'vip';
  total_spent: number;
  booking_count: number;
  last_booking?: string;
  is_active: boolean;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

interface CustomerFormData {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  membership_level: 'basic' | 'premium' | 'vip';
  is_active: boolean;
}

// Mock customer data
const mockCustomers: Customer[] = [
  {
    customer_id: 1,
    full_name: 'Nguyễn Văn An',
    email: 'nguyen.van.an@gmail.com',
    phone: '0901234567',
    date_of_birth: '1990-05-15',
    gender: 'male',
    membership_level: 'vip',
    total_spent: 2500000,
    booking_count: 45,
    last_booking: '2025-01-15T10:00:00Z',
    is_active: true,
    role: 'customer',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  },
  {
    customer_id: 2,
    full_name: 'Trần Thị Bình',
    email: 'tran.thi.binh@yahoo.com',
    phone: '0912345678',
    date_of_birth: '1985-08-22',
    gender: 'female',
    membership_level: 'premium',
    total_spent: 1800000,
    booking_count: 32,
    last_booking: '2025-01-14T14:30:00Z',
    is_active: true,
    role: 'customer',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2025-01-14T14:30:00Z',
  },
  {
    customer_id: 3,
    full_name: 'Lê Minh Cường',
    email: 'le.minh.cuong@outlook.com',
    phone: '0923456789',
    date_of_birth: '1992-12-03',
    gender: 'male',
    membership_level: 'basic',
    total_spent: 850000,
    booking_count: 18,
    last_booking: '2025-01-10T09:15:00Z',
    is_active: true,
    role: 'customer',
    created_at: '2024-06-10T00:00:00Z',
    updated_at: '2025-01-10T09:15:00Z',
  },
  {
    customer_id: 4,
    full_name: 'Phạm Thu Duyên',
    email: 'pham.thu.duyen@gmail.com',
    phone: '0934567890',
    date_of_birth: '1988-03-18',
    gender: 'female',
    membership_level: 'premium',
    total_spent: 1200000,
    booking_count: 25,
    is_active: false,
    role: 'customer',
    created_at: '2024-03-20T00:00:00Z',
    updated_at: '2024-12-15T00:00:00Z',
  },
];

export const AdminCustomersPage: React.FC = () => {
  const theme = useTheme();
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMembership, setFilterMembership] = useState<string>('all');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CustomerFormData>({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'male',
    membership_level: 'basic',
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
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((customer) =>
        filterStatus === 'active' ? customer.is_active : !customer.is_active
      );
    }

    if (filterMembership !== 'all') {
      filtered = filtered.filter((customer) => customer.membership_level === filterMembership);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, filterStatus, filterMembership]);

  // Helper functions
  const getMembershipColor = (level: string): 'warning' | 'info' | 'error' | 'default' => {
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

  const getMembershipText = (level: string) => {
    switch (level) {
      case 'vip':
        return 'VIP';
      case 'premium':
        return 'Premium';
      case 'basic':
        return 'Basic';
      default:
        return level;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // CRUD operations
  const handleAdd = () => {
    setEditMode(false);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: 'male',
      membership_level: 'basic',
      is_active: true,
    });
    setOpenDialog(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditMode(true);
    setSelectedCustomer(customer);
    setFormData({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      date_of_birth: customer.date_of_birth || '',
      gender: customer.gender || 'male',
      membership_level: customer.membership_level,
      is_active: customer.is_active,
    });
    setOpenDialog(true);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenViewDialog(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenDeleteDialog(true);
  };

  const handleSave = () => {
    if (!formData.full_name || !formData.email || !formData.phone) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        severity: 'error',
      });
      return;
    }

    if (editMode && selectedCustomer) {
      // Update customer
      const updatedCustomer: Customer = {
        ...selectedCustomer,
        ...formData,
        updated_at: new Date().toISOString(),
      };
      setCustomers(
        customers.map((customer) =>
          customer.customer_id === selectedCustomer.customer_id ? updatedCustomer : customer
        )
      );
      setSnackbar({
        open: true,
        message: 'Cập nhật khách hàng thành công!',
        severity: 'success',
      });
    } else {
      // Add new customer
      const newCustomer: Customer = {
        customer_id: Math.max(...customers.map((c) => c.customer_id)) + 1,
        ...formData,
        total_spent: 0,
        booking_count: 0,
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCustomers([...customers, newCustomer]);
      setSnackbar({
        open: true,
        message: 'Thêm khách hàng mới thành công!',
        severity: 'success',
      });
    }

    setOpenDialog(false);
  };

  const confirmDelete = () => {
    if (selectedCustomer) {
      setCustomers(
        customers.filter((customer) => customer.customer_id !== selectedCustomer.customer_id)
      );
      setSnackbar({
        open: true,
        message: 'Xóa khách hàng thành công!',
        severity: 'success',
      });
      setOpenDeleteDialog(false);
    }
  };

  const toggleCustomerStatus = (customer: Customer) => {
    const updatedCustomer = {
      ...customer,
      is_active: !customer.is_active,
      updated_at: new Date().toISOString(),
    };
    setCustomers(
      customers.map((c) => (c.customer_id === customer.customer_id ? updatedCustomer : c))
    );
    setSnackbar({
      open: true,
      message: `${customer.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'} khách hàng thành công!`,
      severity: 'success',
    });
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
          Quản lý khách hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin và trạng thái các khách hàng
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Tổng khách hàng
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {customers.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <Group />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Khách VIP
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {customers.filter((c) => c.membership_level === 'vip').length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                <Star />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Hoạt động
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {customers.filter((c) => c.is_active).length}
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Tổng chi tiêu
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                  {formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0))
                    .slice(0, -1)
                    .slice(0, -1)}
                  K
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                <AttachMoney />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters and Actions */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <TextField
              placeholder="Tìm kiếm khách hàng..."
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
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Thành viên</InputLabel>
              <Select
                value={filterMembership}
                label="Thành viên"
                onChange={(e) => setFilterMembership(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="vip">VIP</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterMembership('all');
              }}
            >
              Làm mới
            </Button>

            <Box sx={{ flexGrow: 1 }} />

            <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
              Thêm khách hàng
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Customers Table - COMPACT SIZE */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table size="small" sx={{ '& .MuiTableCell-root': { py: 1 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Điện thoại</TableCell>
                <TableCell>Thành viên</TableCell>
                <TableCell>Chi tiêu</TableCell>
                <TableCell>Đặt sân</TableCell>
                <TableCell>Hoạt động</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.customer_id} hover>
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
                        {customer.full_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                          {customer.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {customer.customer_id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{customer.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{customer.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getMembershipText(customer.membership_level)}
                      size="small"
                      color={getMembershipColor(customer.membership_level)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {formatCurrency(customer.total_spent)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{customer.booking_count}</Typography>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={customer.is_active}
                      onChange={() => toggleCustomerStatus(customer)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton size="small" onClick={() => handleView(customer)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" onClick={() => handleEdit(customer)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(customer)}
                          color="error"
                        >
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
        <DialogTitle>{editMode ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
              }}
            >
              <TextField
                label="Họ và tên"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                required
              />
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
              }}
            >
              <TextField
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Ngày sinh"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={formData.gender}
                  label="Giới tính"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as 'male' | 'female' | 'other',
                    })
                  }
                >
                  <MenuItem value="male">Nam</MenuItem>
                  <MenuItem value="female">Nữ</MenuItem>
                  <MenuItem value="other">Khác</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Loại thành viên</InputLabel>
                <Select
                  value={formData.membership_level}
                  label="Loại thành viên"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      membership_level: e.target.value as 'basic' | 'premium' | 'vip',
                    })
                  }
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="vip">VIP</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Kích hoạt tài khoản"
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
              {selectedCustomer?.full_name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedCustomer?.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Chi tiết thông tin khách hàng
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedCustomer.email}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1">{selectedCustomer.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Loại thành viên
                </Typography>
                <Chip
                  label={getMembershipText(selectedCustomer.membership_level)}
                  size="small"
                  color={getMembershipColor(selectedCustomer.membership_level)}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tổng chi tiêu
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(selectedCustomer.total_spent)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Số lần đặt sân
                </Typography>
                <Typography variant="body1">{selectedCustomer.booking_count}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Lần đặt cuối
                </Typography>
                <Typography variant="body1">
                  {selectedCustomer.last_booking
                    ? formatDate(selectedCustomer.last_booking)
                    : 'Chưa có'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Trạng thái hoạt động
                </Typography>
                <Chip
                  label={selectedCustomer.is_active ? 'Đang hoạt động' : 'Tạm ngưng'}
                  size="small"
                  color={selectedCustomer.is_active ? 'success' : 'error'}
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
              if (selectedCustomer) {
                setOpenViewDialog(false);
                handleEdit(selectedCustomer);
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
          <Typography>
            Bạn có chắc chắn muốn xóa khách hàng "{selectedCustomer?.full_name}"?
          </Typography>
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
