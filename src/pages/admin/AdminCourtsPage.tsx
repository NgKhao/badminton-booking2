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
  CircularProgress,
  Pagination,
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
  CloudUpload,
} from '@mui/icons-material';
import courtImage from '../../assets/court.jpg';
import { useTheme } from '@mui/material/styles';
import {
  useAdminCourts,
  type Court,
  useCreateCourtMutation,
  useUpdateCourtMutation,
  useDeleteCourtMutation,
  type CreateCourtRequest,
  type UpdateCourtRequest,
  useBranches,
  useMaintenanceReportMutation,
} from '../../hooks/useApi';
import { useAuthStore } from '../../store/authStore';

interface CourtFormData {
  courtName: string;
  courtType: 'INDOOR' | 'OUTDOOR';
  status: 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
  hourlyRate: number;
  description: string;
  isActive: boolean;
  branchId?: number; // Optional for admin to select branch
}

export const AdminCourtsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Fetch branches for admin filter (only for admin users)
  const { data: branchesData } = useBranches({ page: 0, size: 100 }, { enabled: isAdmin });
  const branches = React.useMemo(() => branchesData?.branches || [], [branchesData?.branches]);

  // React Query hook for fetching admin courts
  const {
    data: courtsData,
    isLoading,
    error,
    refetch,
  } = useAdminCourts({
    page: currentPage,
    size: pageSize,
  });

  const courts = React.useMemo(() => courtsData?.courts || [], [courtsData?.courts]);
  const paginationInfo = courtsData?.pagination;

  // Mutation hooks for court management
  const createCourtMutation = useCreateCourtMutation({
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Thêm sân mới thành công!',
        severity: 'success',
      });
      setOpenDialog(false);
      refetch(); // Thêm dòng này
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi thêm sân: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const updateCourtMutation = useUpdateCourtMutation({
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Cập nhật sân thành công!',
        severity: 'success',
      });
      setOpenDialog(false);
      refetch(); // Thêm dòng này
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi cập nhật sân: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const deleteCourtMutation = useDeleteCourtMutation({
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Xóa sân thành công!',
        severity: 'success',
      });
      setOpenDeleteDialog(false);
      refetch(); // Thêm dòng này
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi xóa sân: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const maintenanceReportMutation = useMaintenanceReportMutation({
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: data.detail || 'Gửi báo cáo bảo trì thành công!',
        severity: 'success',
      });
      setOpenMaintenanceDialog(false);
      setMaintenanceDescription('');
      refetch();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Lỗi khi gửi báo cáo: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openMaintenanceDialog, setOpenMaintenanceDialog] = useState(false);
  const [maintenanceDescription, setMaintenanceDescription] = useState('');
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CourtFormData>({
    courtName: '',
    courtType: 'INDOOR',
    status: 'AVAILABLE',
    hourlyRate: 0,
    description: '',
    isActive: true,
  });

  // Image upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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
          court.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (court.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
          (court.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((court) => court.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((court) => court.courtType === filterType);
    }

    if (filterBranch !== 'all') {
      filtered = filtered.filter((court) => court.branchId?.toString() === filterBranch);
    }

    setFilteredCourts(filtered);
  }, [courts, searchTerm, filterStatus, filterType, filterBranch]);

  // Helper functions
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
        return 'Không khả dụng';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'INDOOR':
        return 'Trong nhà';
      case 'OUTDOOR':
        return 'Ngoài trời';
      default:
        return type;
    }
  };

  const getCourtTypeIcon = (type: string) => {
    return type === 'INDOOR' ? <AcUnit /> : <WbSunny />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: 'Vui lòng chọn file hình ảnh!',
          severity: 'error',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Kích thước file không được vượt quá 5MB!',
          severity: 'error',
        });
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData({
      ...formData,
    });
  };

  // CRUD operations
  const handleAdd = () => {
    setEditMode(false);
    setFormData({
      courtName: '',
      courtType: 'INDOOR',
      status: 'AVAILABLE',
      hourlyRate: 0,
      description: '',
      isActive: true,
      branchId: undefined,
    });
    setSelectedFile(null);
    setImagePreview('');
    setOpenDialog(true);
  };

  const handleEdit = (court: Court) => {
    setEditMode(true);
    setSelectedCourt(court);
    setFormData({
      courtName: court.courtName,
      courtType: court.courtType,
      status: court.status,
      hourlyRate: court.hourlyRate,
      description: court.description ?? '',
      isActive: court.isActive,
      branchId: court.branchId,
    });

    // Set preview for existing image
    if (court.images && court.images.length > 0) {
      setImagePreview(`${import.meta.env.VITE_IMG_URL}${court.images[0]}`);
    } else {
      setImagePreview('');
    }
    setSelectedFile(null);
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
    if (!formData.courtName || !formData.hourlyRate) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        severity: 'error',
      });
      return;
    }

    // Validate branch selection for admin
    if (isAdmin && !formData.branchId) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn chi nhánh cho sân',
        severity: 'error',
      });
      return;
    }

    // Validate status/isActive combination
    const validation = validateStatusChange(formData.status, formData.isActive);
    if (!validation.isValid) {
      setSnackbar({
        open: true,
        message: validation.message!,
        severity: 'error',
      });
      return;
    }

    // Nếu STAFF chuyển sang MAINTENANCE, yêu cầu báo cáo trước khi lưu
    if (
      !isAdmin &&
      editMode &&
      selectedCourt &&
      formData.status === 'MAINTENANCE' &&
      selectedCourt.status !== 'MAINTENANCE'
    ) {
      if (!maintenanceDescription.trim()) {
        setSnackbar({
          open: true,
          message: 'Vui lòng nhập báo cáo bảo trì trước khi chuyển trạng thái',
          severity: 'error',
        });
        setOpenMaintenanceDialog(true);
        return;
      }
    }

    if (editMode && selectedCourt) {
      // Update court - branchId cannot be changed
      const courtDTO: UpdateCourtRequest = {
        courtName: formData.courtName,
        courtType: formData.courtType,
        hourlyRate: formData.hourlyRate,
        description: formData.description,
        isActive: formData.isActive,
        status: formData.status, // Add status field
        // Don't include branchId in update as it's not editable
      };

      // Nếu STAFF chuyển sang MAINTENANCE, update trước rồi gửi báo cáo sau
      const shouldSendReport =
        !isAdmin &&
        formData.status === 'MAINTENANCE' &&
        selectedCourt.status !== 'MAINTENANCE' &&
        maintenanceDescription.trim();

      updateCourtMutation.mutate(
        {
          courtId: selectedCourt.id,
          data: {
            courtDTO,
            imageFile: selectedFile || undefined,
          },
        },
        {
          onSuccess: () => {
            // Sau khi update thành công, gửi báo cáo nếu cần
            if (shouldSendReport) {
              maintenanceReportMutation.mutate({
                courtId: selectedCourt.id,
                description: maintenanceDescription,
              });
            }
          },
        }
      );
    } else {
      // Create new court
      const courtDTO: CreateCourtRequest = {
        courtName: formData.courtName,
        courtType: formData.courtType,
        hourlyRate: formData.hourlyRate,
        description: formData.description,
        branchId: formData.branchId,
      };

      createCourtMutation.mutate({
        courtDTO,
        imageFile: selectedFile || undefined,
      });
    }
  };

  const confirmDelete = () => {
    if (selectedCourt) {
      deleteCourtMutation.mutate(selectedCourt.id);
    }
  };

  const toggleCourtStatus = (_court: Court) => {
    // TODO: Implement API call for toggling court status
    setSnackbar({
      open: true,
      message: 'Chức năng thay đổi trạng thái sân đang được phát triển',
      severity: 'info',
    });
  };

  // Thêm function để validate status change
  const validateStatusChange = (
    newStatus: string,
    isActive: boolean
  ): { isValid: boolean; message?: string } => {
    // Nếu status khác AVAILABLE và isActive là true, không hợp lệ
    if (newStatus !== 'AVAILABLE' && isActive) {
      return {
        isValid: false,
        message: 'Sân chỉ có thể hoạt động khi trạng thái là "Có sẵn"',
      };
    }
    return { isValid: true };
  };

  const handleStatusChange = (newStatus: string) => {
    const newFormData = {
      ...formData,
      status: newStatus as 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE',
    };

    // Tự động set isActive = false nếu status không phải AVAILABLE
    if (newStatus !== 'AVAILABLE') {
      newFormData.isActive = false;
    }

    // Nếu STAFF chuyển sang MAINTENANCE, yêu cầu mở dialog báo cáo
    if (!isAdmin && newStatus === 'MAINTENANCE' && selectedCourt) {
      setOpenMaintenanceDialog(true);
    }

    setFormData(newFormData);
  };

  // Cập nhật handler cho isActive change
  const handleActiveChange = (isActive: boolean) => {
    const validation = validateStatusChange(formData.status, isActive);

    if (!validation.isValid) {
      setSnackbar({
        open: true,
        message: validation.message!,
        severity: 'warning',
      });
      return;
    }

    setFormData({ ...formData, isActive });
  };

  // Handler for maintenance report submission
  const handleMaintenanceReport = () => {
    if (!maintenanceDescription.trim()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập mô tả chi tiết về sự cố bảo trì',
        severity: 'error',
      });
      return;
    }

    // Close dialog and allow user to proceed with saving
    setOpenMaintenanceDialog(false);
    setSnackbar({
      open: true,
      message: 'Đã nhập báo cáo. Vui lòng nhấn "Cập nhật" để lưu thay đổi.',
      severity: 'info',
    });
  };

  // Pagination handlers
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value - 1); // Material UI Pagination is 1-indexed, API is 0-indexed
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset to first page
  };

  return (
    <Box>
      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        >
          Có lỗi xảy ra khi tải dữ liệu: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

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
                  {courts.filter((c) => c.status === 'AVAILABLE').length}
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
                  {courts.filter((c) => c.status === 'MAINTENANCE').length}
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
                  {formatCurrency(courts.reduce((sum, c) => sum + c.hourlyRate, 0)).slice(0, -1)}
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

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                label="Trạng thái"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="AVAILABLE">Có sẵn</MenuItem>
                <MenuItem value="MAINTENANCE">Bảo trì</MenuItem>
                <MenuItem value="UNAVAILABLE">Không khả dụng</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Loại sân</InputLabel>
              <Select
                value={filterType}
                label="Loại sân"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="INDOOR">Trong nhà</MenuItem>
                <MenuItem value="OUTDOOR">Ngoài trời</MenuItem>
              </Select>
            </FormControl>

            {isAdmin && branches.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Chi nhánh</InputLabel>
                <Select
                  value={filterBranch}
                  label="Chi nhánh"
                  onChange={(e) => setFilterBranch(e.target.value)}
                >
                  <MenuItem value="all">Tất cả chi nhánh</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id.toString()}>
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterType('all');
                setFilterBranch('all');
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
                <TableCell>Hình ảnh</TableCell>
                <TableCell>Chi nhánh</TableCell>
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
                <TableRow key={court.id} hover>
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
                        {court.courtName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                          {court.courtName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {court.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {court.images && court.images.length > 0 ? (
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_IMG_URL}${court.images[0]}` || courtImage}
                        alt={court.courtName}
                        sx={{
                          width: 60,
                          height: 40,
                          borderRadius: 1,
                          objectFit: 'cover',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src={courtImage}
                        alt={court.courtName}
                        sx={{
                          width: 60,
                          height: 40,
                          borderRadius: 1,
                          objectFit: 'cover',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {court.branchName ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                          {court.branchName}
                        </Typography>
                        {court.branchPhone && (
                          <Typography variant="caption" color="text.secondary">
                            {court.branchPhone}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                      >
                        Chưa gán chi nhánh
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getCourtTypeIcon(court.courtType)}
                      <Typography variant="body2">{getTypeText(court.courtType)}</Typography>
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
                      {formatCurrency(court.hourlyRate)}
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
                      checked={court.isActive}
                      onChange={() => toggleCourtStatus(court)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => handleView(court)}
                          sx={{ color: 'info.main' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(court)}
                          sx={{ color: 'warning.main' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(court)}
                          sx={{ color: 'error.main' }}
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

        {/* Pagination */}
        {paginationInfo && paginationInfo.totalPages > 1 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Hiển thị {currentPage * pageSize + 1} -{' '}
              {Math.min((currentPage + 1) * pageSize, paginationInfo.totalElements)} của{' '}
              {paginationInfo.totalElements} sân
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <InputLabel>Số/trang</InputLabel>
                <Select
                  value={pageSize}
                  label="Số/trang"
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
              <Pagination
                count={paginationInfo.totalPages}
                page={currentPage + 1}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </Box>
        )}
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
                value={formData.courtName}
                onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                fullWidth
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Loại sân</InputLabel>
                <Select
                  value={formData.courtType}
                  label="Loại sân"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courtType: e.target.value as 'INDOOR' | 'OUTDOOR',
                    })
                  }
                >
                  <MenuItem value="INDOOR">Trong nhà</MenuItem>
                  <MenuItem value="OUTDOOR">Ngoài trời</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {/* Branch selection - only for admin */}
            {isAdmin && (
              <FormControl fullWidth required>
                <InputLabel>Chi nhánh</InputLabel>
                <Select
                  value={formData.branchId || ''}
                  label="Chi nhánh"
                  onChange={(e) => setFormData({ ...formData, branchId: Number(e.target.value) })}
                  disabled={editMode}
                >
                  <MenuItem value="" disabled>
                    Chọn chi nhánh
                  </MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id}>
                      {branch.branchName} - {branch.address}
                    </MenuItem>
                  ))}
                </Select>
                {editMode && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Chi nhánh không thể thay đổi khi chỉnh sửa sân
                  </Typography>
                )}
              </FormControl>
            )}
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}
            >
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng thái"
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <MenuItem value="AVAILABLE">Có sẵn</MenuItem>
                  <MenuItem value="MAINTENANCE">Bảo trì</MenuItem>
                  <MenuItem value="UNAVAILABLE">Không khả dụng</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Giá thuê (VNĐ/giờ)"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
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
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Hình ảnh sân
              </Typography>

              {/* File Upload Input */}
              <Box sx={{ mb: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderStyle: 'dashed',
                      '&:hover': {
                        borderStyle: 'dashed',
                      },
                    }}
                  >
                    {selectedFile ? selectedFile.name : 'Chọn hình ảnh từ máy tính'}
                  </Button>
                </label>
              </Box>

              {/* Image Preview */}
              {imagePreview && (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Xem trước:
                  </Typography>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      width: 200,
                      height: 120,
                      borderRadius: 1,
                      objectFit: 'cover',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'block',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={removeImage}
                    sx={{
                      position: 'absolute',
                      top: 25,
                      right: 5,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'error.dark',
                      },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {!imagePreview && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Chọn file JPG, PNG hoặc GIF (tối đa 5MB)
                </Typography>
              )}
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleActiveChange(e.target.checked)}
                  disabled={formData.status !== 'AVAILABLE'} // Disable khi status không phải AVAILABLE
                />
              }
              label={
                <Box>
                  <Typography>Kích hoạt sân</Typography>
                  {formData.status !== 'AVAILABLE' && (
                    <Typography variant="caption" color="warning.main">
                      Sân chỉ có thể hoạt động khi trạng thái là "Có sẵn"
                    </Typography>
                  )}
                </Box>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<Save />}
            disabled={createCourtMutation.isPending || updateCourtMutation.isPending}
          >
            {createCourtMutation.isPending || updateCourtMutation.isPending
              ? 'Đang lưu...'
              : editMode
                ? 'Cập nhật'
                : 'Thêm mới'}
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
              {selectedCourt?.courtName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedCourt?.courtName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Chi tiết thông tin sân
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCourt && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {selectedCourt.branchName && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Chi nhánh
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {selectedCourt.branchName}
                  </Typography>
                  {selectedCourt.branchAddress && (
                    <Typography variant="caption" color="text.secondary">
                      {selectedCourt.branchAddress}
                    </Typography>
                  )}
                  {selectedCourt.branchPhone && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      SĐT: {selectedCourt.branchPhone}
                    </Typography>
                  )}
                </Box>
              )}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Loại sân
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getCourtTypeIcon(selectedCourt.courtType)}
                  <Typography variant="body1">{getTypeText(selectedCourt.courtType)}</Typography>
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
                  {formatCurrency(selectedCourt.hourlyRate)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Hình ảnh sân
                </Typography>
                {selectedCourt.images && selectedCourt.images.length > 0 ? (
                  <Box
                    component="img"
                    src={`${import.meta.env.VITE_IMG_URL}${selectedCourt.images[0]}` || courtImage}
                    alt={selectedCourt.courtName}
                    sx={{
                      width: 200,
                      height: 120,
                      borderRadius: 1,
                      objectFit: 'cover',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={courtImage}
                    alt={selectedCourt.courtName}
                    sx={{
                      width: 200,
                      height: 120,
                      borderRadius: 1,
                      objectFit: 'cover',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                )}
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
                  label={selectedCourt.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                  size="small"
                  color={selectedCourt.isActive ? 'success' : 'error'}
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
          <Typography>Bạn có chắc chắn muốn xóa sân "{selectedCourt?.courtName}"?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleteCourtMutation.isPending}
          >
            {deleteCourtMutation.isPending ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance Report Dialog - For STAFF */}
      <Dialog
        open={openMaintenanceDialog}
        onClose={() => {
          setOpenMaintenanceDialog(false);
          setMaintenanceDescription('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            <Typography variant="h6">Báo cáo bảo trì sân</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Bạn đang chuyển sân <strong>{selectedCourt?.courtName}</strong> sang trạng thái bảo
              trì. Vui lòng nhập báo cáo chi tiết về sự cố. Sau khi lưu, báo cáo sẽ được gửi lên
              admin để xử lý.
            </Alert>
            <TextField
              label="Mô tả chi tiết sự cố bảo trì"
              placeholder="Ví dụ: Đèn sân bị cháy, cần thay bóng mới; Lưới bị rách, cần thay mới; Sàn sân bị ướt do thấm nước..."
              value={maintenanceDescription}
              onChange={(e) => setMaintenanceDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              required
              helperText="Báo cáo này sẽ được gửi cho admin sau khi cập nhật trạng thái sân"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setOpenMaintenanceDialog(false);
              setMaintenanceDescription('');
            }}
            startIcon={<Cancel />}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleMaintenanceReport}
            startIcon={<Warning />}
            disabled={!maintenanceDescription.trim()}
          >
            Xác nhận
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
