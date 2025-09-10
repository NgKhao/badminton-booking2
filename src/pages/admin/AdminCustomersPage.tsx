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
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
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
  Group,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  useCustomers,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  type Customer,
  type UpdateCustomerRequest,
} from '../../hooks/useApi';

// Simplified Customer Form Data (removed unnecessary fields)
interface CustomerFormData {
  fullName: string;
  email: string;
  numberPhone: string;
  active: boolean;
}

export const AdminCustomersPage: React.FC = () => {
  const theme = useTheme();

  // React Query hooks
  const { data: customers = [], isLoading, error, refetch } = useCustomers();

  // Mutation hooks for update and delete
  const updateCustomerMutation = useUpdateCustomerMutation({
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Cập nhật khách hàng thành công!',
        severity: 'success',
      });
      setOpenDialog(false);
      refetch(); // Refresh the customer list
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi cập nhật khách hàng: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const deleteCustomerMutation = useDeleteCustomerMutation({
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Xóa khách hàng thành công!',
        severity: 'success',
      });
      setOpenDeleteDialog(false);
      refetch(); // Refresh the customer list
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi xóa khách hàng: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form state - simplified
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: '',
    email: '',
    numberPhone: '',
    active: true,
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
          customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.numberPhone?.includes(searchTerm)
      );
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  // Helper functions - simplified
  const getStatusColor = (active: boolean): 'success' | 'error' => {
    return active ? 'success' : 'error';
  };

  const getStatusText = (active: boolean) => {
    return active ? 'Hoạt động' : 'Không hoạt động';
  };

  // CRUD operations - simplified for display only
  const handleAdd = () => {
    setEditMode(false);
    setFormData({
      fullName: '',
      email: '',
      numberPhone: '',
      active: true,
    });
    setOpenDialog(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditMode(true);
    setSelectedCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      email: customer.email,
      numberPhone: customer.numberPhone,
      active: customer.active,
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
    if (!formData.fullName || !formData.email || !formData.numberPhone) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        severity: 'error',
      });
      return;
    }

    if (editMode && selectedCustomer) {
      // Update existing customer
      const updateData: UpdateCustomerRequest = {
        fullName: formData.fullName,
        email: formData.email,
        numberPhone: formData.numberPhone,
        active: formData.active,
      };

      updateCustomerMutation.mutate({
        customerId: selectedCustomer.userId,
        data: updateData,
      });
    } else {
      // Create new customer - TODO: Add create customer API when available
      setSnackbar({
        open: true,
        message: 'Tính năng tạo khách hàng mới chưa được triển khai',
        severity: 'warning',
      });
      setOpenDialog(false);
    }
  };

  const confirmDelete = () => {
    if (selectedCustomer) {
      deleteCustomerMutation.mutate(selectedCustomer.userId);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Lỗi khi tải danh sách khách hàng: {error.message}
        </Alert>
        <Button onClick={() => refetch()} startIcon={<Refresh />}>
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý khách hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin khách hàng trong hệ thống
        </Typography>
      </Box>

      {/* Stats Cards - simplified */}
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
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
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
                  Hoạt động
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {customers.filter((c) => c.active).length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                <CheckCircle />
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
              sx={{ minWidth: 300 }}
            />

            <Button variant="contained" startIcon={<Add />} onClick={handleAdd} sx={{ ml: 'auto' }}>
              Thêm khách hàng
            </Button>

            <Tooltip title="Làm mới dữ liệu">
              <IconButton onClick={() => refetch()}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Card>

      {/* Customers Table */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Khách hàng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Số điện thoại</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Vai trò</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.userId}
                  hover
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    opacity: customer.active ? 1 : 0.6,
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                        {customer.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {customer.fullName || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {customer.customerId || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{customer.email || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{customer.numberPhone || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={customer.roleName}
                      size="small"
                      variant="outlined"
                      color={customer.roleName === 'ADMIN' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(customer.active)}
                      size="small"
                      color={getStatusColor(customer.active)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => handleView(customer)}
                          sx={{ color: 'info.main' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(customer)}
                          sx={{ color: 'warning.main' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(customer)}
                          sx={{ color: 'error.main' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có khách hàng nào được tìm thấy
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Họ và tên"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
            <TextField
              label="Số điện thoại"
              value={formData.numberPhone}
              onChange={(e) => setFormData({ ...formData, numberPhone: e.target.value })}
              fullWidth
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label="Kích hoạt tài khoản"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<Save />}
            disabled={updateCustomerMutation.isPending}
          >
            {updateCustomerMutation.isPending ? (
              <CircularProgress size={20} />
            ) : editMode ? (
              'Cập nhật'
            ) : (
              'Tạo mới'
            )}
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
        <DialogTitle>Thông tin khách hàng</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 56, height: 56 }}>
                  {selectedCustomer.fullName?.charAt(0)?.toUpperCase() || '?'}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedCustomer.fullName || 'N/A'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {selectedCustomer.customerId || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedCustomer.email || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1">{selectedCustomer.numberPhone || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Vai trò
                </Typography>
                <Chip
                  label={selectedCustomer.roleName}
                  size="small"
                  color={selectedCustomer.roleName === 'ADMIN' ? 'primary' : 'default'}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Trạng thái
                </Typography>
                <Chip
                  label={getStatusText(selectedCustomer.active)}
                  size="small"
                  color={getStatusColor(selectedCustomer.active)}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa khách hàng "{selectedCustomer?.fullName}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteCustomerMutation.isPending}
          >
            {deleteCustomerMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Xóa'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
