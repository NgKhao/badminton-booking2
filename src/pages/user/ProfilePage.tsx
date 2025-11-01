import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Lock,
  Edit,
  Save,
  Cancel,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import {
  useCurrentUser,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useStaffBranch,
  useUpdateStaffBranchMutation,
  type ChangePasswordRequest,
  type UserProfile,
} from '../../hooks/useApi';
import type { User } from '../../types';

interface ProfileFormData {
  fullName: string;
  phone: string;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const getFullName = (user: User | UserProfile | null): string => {
  if (!user) return '';
  return 'fullName' in user ? user.fullName : user.full_name || '';
};

const getPhone = (user: User | UserProfile | null): string => {
  if (!user) return '';
  return 'numberPhone' in user ? user.numberPhone || '' : user.phone || '';
};

const getIsActive = (user: User | UserProfile | null): boolean => {
  if (!user) return false;
  return 'active' in user ? user.active : user.is_active;
};

const getRoleName = (user: User | UserProfile | null): string => {
  if (!user) return 'CUSTOMER';
  if ('roleName' in user) {
    if (user.roleName === 'ADMIN') return 'admin';
    if (user.roleName === 'STAFF') return 'staff';
    return 'customer';
  }
  return user.role || 'customer';
};

export const ProfilePage: React.FC = () => {
  const { user: authUser, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    fullName: '',
    phone: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: userData, isLoading, refetch } = useCurrentUser();

  // Fetch staff branch info if user is STAFF
  const isStaff = userData?.roleName === 'STAFF';
  const staffBranchQuery = useStaffBranch();
  const staffBranchData = isStaff ? staffBranchQuery.data : undefined;

  // Mutation for updating staff branch phone
  const updateStaffBranchMutation = useUpdateStaffBranchMutation({
    onSuccess: () => {
      setSuccessMessage('Cập nhật số điện thoại thành công!');
      setIsEditing(false);
      staffBranchQuery.refetch(); // Refetch staff branch data
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      const errorMsg =
        (error as { response?: { data?: { messenger?: string } } }).response?.data?.messenger ||
        'Có lỗi xảy ra khi cập nhật số điện thoại';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const updateProfileMutation = useUpdateProfileMutation({
    onSuccess: (data) => {
      setSuccessMessage('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
      updateUser({
        full_name: data.fullName,
        phone: data.numberPhone || undefined,
      });
      setTimeout(() => setSuccessMessage(''), 3000);
      refetch();
    },
    onError: (error) => {
      const errorMsg =
        (error as { response?: { data?: { messenger?: string } } }).response?.data?.messenger ||
        'Có lỗi xảy ra khi cập nhật hồ sơ';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const changePasswordMutation = useChangePasswordMutation({
    onSuccess: (data) => {
      // Use the message from API response
      setSuccessMessage(data.messenger || 'Đổi mật khẩu thành công!');
      setOpenPasswordDialog(false);
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      const errorMsg =
        (error as { response?: { data?: { messenger?: string } } }).response?.data?.messenger ||
        'Có lỗi xảy ra khi đổi mật khẩu';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const user = userData || authUser;

  // Update form data when user or staff branch data changes
  useEffect(() => {
    if (user) {
      let phone = getPhone(user);

      // If user is STAFF and has no phone, use branch phone
      if (isStaff && !phone && staffBranchData?.phone) {
        phone = staffBranchData.phone;
      }

      setProfileForm({
        fullName: getFullName(user),
        phone: phone,
      });
    }
  }, [user, isStaff, staffBranchData]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setProfileForm({
        fullName: getFullName(user),
        phone: getPhone(user),
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = () => {
    if (!profileForm.fullName.trim()) {
      setErrorMessage('Họ và tên không được để trống');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Validate phone number
    if (profileForm.phone && !/^[0-9]{10,11}$/.test(profileForm.phone)) {
      setErrorMessage('Số điện thoại không hợp lệ (10-11 chữ số)');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Get userId from current user data
    const userId = user && 'userId' in user ? user.userId : user?.user_id;

    if (!userId) {
      setErrorMessage('Không tìm thấy thông tin người dùng');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // If STAFF, update branch phone instead of user phone
    if (isStaff && staffBranchData) {
      updateStaffBranchMutation.mutate({
        branchId: staffBranchData.id,
        phone: profileForm.phone,
      });
    } else {
      // Normal user update
      updateProfileMutation.mutate({
        userId,
        data: {
          fullName: profileForm.fullName,
          numberPhone: profileForm.phone,
        },
      });
    }
  };

  const handleChangePassword = () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Mật khẩu mới không khớp');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const passwordData: ChangePasswordRequest = {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    };

    changePasswordMutation.mutate(passwordData);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                mr: 3,
              }}
            >
              {getFullName(user)?.[0] || user?.email[0].toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" gutterBottom>
                Hồ sơ cá nhân
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={
                    getRoleName(user) === 'admin' ? (
                      <AdminPanelSettings />
                    ) : getRoleName(user) === 'staff' ? (
                      <AdminPanelSettings />
                    ) : (
                      <Person />
                    )
                  }
                  label={
                    getRoleName(user) === 'admin'
                      ? 'Quản trị viên'
                      : getRoleName(user) === 'staff'
                        ? 'Nhân viên chi nhánh'
                        : 'Khách hàng'
                  }
                  color={
                    getRoleName(user) === 'admin'
                      ? 'error'
                      : getRoleName(user) === 'staff'
                        ? 'warning'
                        : 'primary'
                  }
                  size="small"
                />
              </Box>
            </Box>
            {!isEditing && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEditToggle}
                sx={{ ml: 2 }}
              >
                Chỉnh sửa
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Staff Branch Info */}
          {isStaff && staffBranchData && (
            <>
              <Box sx={{ bgcolor: 'warning.50', p: 2, borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  📍 Thông tin chi nhánh
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Chi nhánh:</strong> {staffBranchData.branchName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Địa chỉ:</strong> {staffBranchData.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Trạng thái:</strong>{' '}
                  <Chip
                    label={staffBranchData.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    size="small"
                    color={staffBranchData.isActive ? 'success' : 'error'}
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
              </Box>
              <TextField
                fullWidth
                value={user?.email || ''}
                disabled
                variant="outlined"
                helperText="Email không thể chỉnh sửa"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Họ và tên
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="fullName"
                  value={profileForm.fullName}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                  variant="outlined"
                  placeholder="Nhập họ và tên"
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                    {isStaff && staffBranchData && ' (từ chi nhánh)'}
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                  variant="outlined"
                  placeholder="Nhập số điện thoại"
                  helperText={isStaff ? 'Số điện thoại của chi nhánh, có thể chỉnh sửa' : undefined}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AdminPanelSettings sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Vai trò
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={
                    getRoleName(user) === 'admin'
                      ? 'Quản trị viên'
                      : getRoleName(user) === 'staff'
                        ? 'Nhân viên chi nhánh'
                        : 'Khách hàng'
                  }
                  disabled
                  variant="outlined"
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={getIsActive(user) ? 'Đang hoạt động' : 'Không hoạt động'}
                  disabled
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          {isEditing && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleEditToggle}
                disabled={updateProfileMutation.isPending || updateStaffBranchMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending || updateStaffBranchMutation.isPending}
              >
                {updateProfileMutation.isPending || updateStaffBranchMutation.isPending
                  ? 'Đang lưu...'
                  : 'Lưu thay đổi'}
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Lock />}
              onClick={() => setOpenPasswordDialog(true)}
              fullWidth
            >
              Đổi mật khẩu
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Lock sx={{ mr: 1 }} />
            Đổi mật khẩu
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Mật khẩu hiện tại"
              name="oldPassword"
              value={passwordForm.oldPassword}
              onChange={handlePasswordInputChange}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              type="password"
              label="Mật khẩu mới"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordInputChange}
              margin="normal"
              variant="outlined"
              helperText="Mật khẩu phải có ít nhất 6 ký tự"
            />
            <TextField
              fullWidth
              type="password"
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordInputChange}
              margin="normal"
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenPasswordDialog(false);
              setPasswordForm({
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
            }}
            disabled={changePasswordMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            color="primary"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
