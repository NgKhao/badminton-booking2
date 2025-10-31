import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Button,
  Avatar,
  Tooltip,
  InputAdornment,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Visibility,
  Search,
  Refresh,
  Store,
  CheckCircle,
  Phone,
  LocationOn,
  Person,
  Email,
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  useBranches,
  useBranchManager,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  type Branch,
} from '../../hooks/useApi';

export const AdminBranchesPage: React.FC = () => {
  const theme = useTheme();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // React Query hooks
  const {
    data: branchesData,
    isLoading,
    error,
    refetch,
  } = useBranches({
    page: currentPage,
    size: pageSize,
  });

  const branches = React.useMemo(() => branchesData?.branches || [], [branchesData?.branches]);
  const paginationInfo = branchesData?.pagination;

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);

  // Dialog states
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Form state for creating branch
  const [formData, setFormData] = useState({
    branchName: '',
    address: '',
    phone: '',
    isActive: true,
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Mutation hook for creating branch
  const createBranchMutation = useCreateBranchMutation({
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Tạo chi nhánh thành công! Tài khoản quản lý đã được tạo tự động.',
        severity: 'success',
      });
      setOpenCreateDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi tạo chi nhánh: ${error.message}`,
        severity: 'error',
      });
    },
  });

  // Mutation hook for updating branch
  const updateBranchMutation = useUpdateBranchMutation({
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Cập nhật chi nhánh thành công!',
        severity: 'success',
      });
      setOpenEditDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi cập nhật chi nhánh: ${error.message}`,
        severity: 'error',
      });
    },
  });

  // Mutation hook for deleting branch
  const deleteBranchMutation = useDeleteBranchMutation({
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Xóa chi nhánh thành công!',
        severity: 'success',
      });
      setOpenDeleteDialog(false);
      setSelectedBranch(null);
      refetch();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi xóa chi nhánh: ${error.message}`,
        severity: 'error',
      });
    },
  });

  // Filter and search logic - Apply locally on current page data
  React.useEffect(() => {
    let filtered = branches;

    if (searchTerm) {
      filtered = filtered.filter(
        (branch: Branch) =>
          branch.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          branch.phone?.includes(searchTerm)
      );
    }

    setFilteredBranches(filtered);
  }, [branches, searchTerm]);

  // Helper functions
  const getStatusColor = (active: boolean): 'success' | 'error' => {
    return active ? 'success' : 'error';
  };

  const getStatusText = (active: boolean) => {
    return active ? 'Hoạt động' : 'Không hoạt động';
  };

  const handleView = (branch: Branch) => {
    setSelectedBranch(branch);
    setOpenViewDialog(true);
  };

  const handleAdd = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      branchName: branch.branchName,
      address: branch.address,
      phone: branch.phone,
      isActive: branch.isActive,
    });
    setOpenEditDialog(true);
  };

  const handleDelete = (branch: Branch) => {
    setSelectedBranch(branch);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedBranch) {
      deleteBranchMutation.mutate(selectedBranch.id);
    }
  };

  const resetForm = () => {
    setFormData({
      branchName: '',
      address: '',
      phone: '',
      isActive: true,
    });
  };

  const handleSave = () => {
    // Validation
    if (!formData.branchName || !formData.address || !formData.phone) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        severity: 'error',
      });
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      setSnackbar({
        open: true,
        message: 'Số điện thoại không hợp lệ (10-11 chữ số)',
        severity: 'error',
      });
      return;
    }

    if (selectedBranch) {
      // Update branch
      updateBranchMutation.mutate({
        branchId: selectedBranch.id,
        data: formData,
      });
    } else {
      // Create branch
      const { isActive, ...createData } = formData;
      createBranchMutation.mutate(createData);
    }
  };

  // Pagination handlers
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value - 1); // Material UI Pagination is 1-indexed, API is 0-indexed
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset to first page
  };

  // Loading state - check before rendering any content that uses branches
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
          Lỗi khi tải danh sách chi nhánh: {error.message}
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
          Quản lý chi nhánh
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin chi nhánh trong hệ thống
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
                  Tổng chi nhánh
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {paginationInfo?.totalElements || 0}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <Store />
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
                  Đang hoạt động
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {branches.filter((b: Branch) => b.isActive).length}
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
            }}
          >
            <TextField
              placeholder="Tìm kiếm chi nhánh..."
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

            <Tooltip title="Làm mới dữ liệu">
              <IconButton onClick={() => refetch()}>
                <Refresh />
              </IconButton>
            </Tooltip>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAdd}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Thêm chi nhánh
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Branches Table */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên chi nhánh</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Địa chỉ</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Số điện thoại</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBranches.map((branch) => (
                <TableRow
                  key={branch.id}
                  hover
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    opacity: branch.isActive ? 1 : 0.6,
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                        <Store fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {branch.branchName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {branch.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{branch.address}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{branch.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(branch.isActive)}
                      size="small"
                      color={getStatusColor(branch.isActive)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => handleView(branch)}
                          sx={{ color: 'info.main' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(branch)}
                          sx={{ color: 'warning.main' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(branch)}
                          sx={{ color: 'error.main' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBranches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có chi nhánh nào được tìm thấy
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {paginationInfo && paginationInfo.totalPages > 1 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Hiển thị
              </Typography>
              <FormControl size="small">
                <Select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                trên tổng {paginationInfo.totalElements} chi nhánh
              </Typography>
            </Box>

            <Pagination
              count={paginationInfo.totalPages}
              page={currentPage + 1}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Card>

      {/* Create Branch Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm chi nhánh mới</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              Tạo chi nhánh sẽ tự động tạo tài khoản quản lý cho chi nhánh đó
            </Alert>

            <TextField
              label="Tên chi nhánh"
              value={formData.branchName}
              onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
              fullWidth
              required
              placeholder="VD: Chi nhánh Quận 1"
            />

            <TextField
              label="Địa chỉ"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              required
              multiline
              rows={2}
              placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM"
            />

            <TextField
              label="Số điện thoại"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
              required
              placeholder="VD: 0912345678"
              inputProps={{
                maxLength: 11,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={createBranchMutation.isPending}
          >
            {createBranchMutation.isPending ? 'Đang tạo...' : 'Tạo chi nhánh'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa chi nhánh</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tên chi nhánh"
              value={formData.branchName}
              onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
              fullWidth
              required
              placeholder="VD: Chi nhánh Quận 1"
            />

            <TextField
              label="Địa chỉ"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              required
              multiline
              rows={2}
              placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM"
            />

            <TextField
              label="Số điện thoại"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
              required
              placeholder="VD: 0912345678"
              inputProps={{
                maxLength: 11,
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="success"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Trạng thái hoạt động</Typography>
                  <Chip
                    label={formData.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    size="small"
                    color={formData.isActive ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={updateBranchMutation.isPending}
          >
            {updateBranchMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa chi nhánh</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn xóa chi nhánh này? Xóa chi nhánh sẽ xóa tất cả sân thuộc chi nhánh
          </Alert>
          {selectedBranch && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tên chi nhánh:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {selectedBranch.branchName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Địa chỉ: {selectedBranch.address}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteBranchMutation.isPending}
            startIcon={<Delete />}
          >
            {deleteBranchMutation.isPending ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <ViewBranchDialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        branch={selectedBranch}
      />
    </Box>
  );
};

// Component hiển thị chi tiết chi nhánh
interface ViewBranchDialogProps {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
}

const ViewBranchDialog: React.FC<ViewBranchDialogProps> = ({ open, onClose, branch }) => {
  // Fetch manager info when dialog opens
  const {
    data: manager,
    isLoading: managerLoading,
    error: managerError,
  } = useBranchManager(branch?.managerId || 0);

  if (!branch) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Store />
          Thông tin chi nhánh
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Branch Info */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {branch.branchName}
            </Typography>
            <Chip
              label={branch.isActive ? 'Hoạt động' : 'Không hoạt động'}
              size="small"
              color={branch.isActive ? 'success' : 'error'}
            />
          </Box>

          <Divider />

          {/* Address */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOn sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.secondary">
                Địa chỉ
              </Typography>
            </Box>
            <Typography variant="body1">{branch.address}</Typography>
          </Box>

          {/* Phone */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Phone sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.secondary">
                Số điện thoại
              </Typography>
            </Box>
            <Typography variant="body1">{branch.phone}</Typography>
          </Box>

          <Divider />

          {/* Manager Info */}
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Thông tin quản lý
            </Typography>

            {managerLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {managerError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                Không thể tải thông tin quản lý
              </Alert>
            )}

            {manager && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {/* Manager Name */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Person sx={{ color: 'text.secondary' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Họ và tên
                    </Typography>
                  </Box>
                  <Typography variant="body1">{manager.fullName}</Typography>
                </Box>

                {/* Manager Email */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Email sx={{ color: 'text.secondary' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                  </Box>
                  <Typography variant="body1">{manager.email}</Typography>
                </Box>

                {/* Manager Role */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vai trò
                    </Typography>
                  </Box>
                  <Chip label="Quản lý chi nhánh" size="small" color="primary" />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};
