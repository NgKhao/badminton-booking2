import { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Avatar,
  Container,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Phone,
  Email,
  LocationOn,
  Cake,
  VerifiedUser,
  Security,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleEdit = () => {
    setEditing(true);
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update user in store (in real app, this would be an API call)
      updateUser({
        ...user!,
        full_name: formData.full_name,
        phone: formData.phone,
      });

      setSuccessMessage('Thông tin đã được cập nhật thành công!');
      setEditing(false);
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.[0].toUpperCase() || 'U';
  };

  return (
    <Container maxWidth="md">
      <div className="py-8">
        <Typography variant="h4" gutterBottom className="text-gray-900 font-bold">
          Thông tin cá nhân
        </Typography>

        {successMessage && (
          <Alert severity="success" className="mb-6">
            {successMessage}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-4">
            <Card className="shadow-lg">
              <CardContent className="text-center py-8">
                <Avatar className="w-25 h-25 mx-auto mb-4 bg-emerald-500 text-white text-2xl">
                  {getInitials(user?.full_name, user?.email)}
                </Avatar>

                <Typography variant="h6" gutterBottom className="text-gray-900 font-semibold">
                  {user?.full_name || 'Chưa cập nhật tên'}
                </Typography>

                <Typography variant="body2" className="text-gray-600 mb-4">
                  {user?.email}
                </Typography>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <VerifiedUser className="text-green-500 text-sm" />
                  <Typography variant="body2" className="text-gray-600">
                    Tài khoản đã xác thực
                  </Typography>
                </div>

                <Typography variant="caption" className="text-gray-500">
                  Thành viên từ {new Date(user?.created_at || '').toLocaleDateString('vi-VN')}
                </Typography>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4 shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" gutterBottom className="text-gray-900 font-semibold">
                  Thống kê nhanh
                </Typography>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" className="text-gray-600">
                      Tổng lượt đặt sân:
                    </Typography>
                    <Typography variant="body2" className="font-bold text-gray-900">
                      12
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" className="text-gray-600">
                      Đặt sân tháng này:
                    </Typography>
                    <Typography variant="body2" className="font-bold text-gray-900">
                      3
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" className="text-gray-600">
                      Điểm tích lũy:
                    </Typography>
                    <Typography variant="body2" className="font-bold text-emerald-600">
                      250 điểm
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Information Card */}
          <div className="md:col-span-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <Typography variant="h6" className="text-gray-900 font-semibold">
                    Thông tin chi tiết
                  </Typography>
                  {!editing && (
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={handleEdit}
                      className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                </div>

                <form noValidate>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <div className="flex items-center mb-2">
                        <Person className="mr-2 text-gray-500" />
                        <Typography variant="subtitle2" className="text-gray-600">
                          Họ và tên
                        </Typography>
                      </div>
                      <TextField
                        fullWidth
                        value={formData.full_name}
                        onChange={handleChange('full_name')}
                        disabled={!editing}
                        placeholder="Nhập họ và tên"
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Email className="mr-2 text-gray-500" />
                        <Typography variant="subtitle2" className="text-gray-600">
                          Email
                        </Typography>
                      </div>
                      <TextField
                        fullWidth
                        value={formData.email}
                        disabled
                        helperText="Email không thể thay đổi"
                        className="bg-gray-100"
                      />
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Phone className="mr-2 text-gray-500" />
                        <Typography variant="subtitle2" className="text-gray-600">
                          Số điện thoại
                        </Typography>
                      </div>
                      <TextField
                        fullWidth
                        value={formData.phone}
                        onChange={handleChange('phone')}
                        disabled={!editing}
                        placeholder="Nhập số điện thoại"
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Cake className="mr-2 text-gray-500" />
                        <Typography variant="subtitle2" className="text-gray-600">
                          Ngày sinh
                        </Typography>
                      </div>
                      <TextField
                        fullWidth
                        type="date"
                        disabled={!editing}
                        InputLabelProps={{ shrink: true }}
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <LocationOn className="mr-2 text-gray-500" />
                        <Typography variant="subtitle2" className="text-gray-600">
                          Địa chỉ
                        </Typography>
                      </div>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        disabled={!editing}
                        placeholder="Nhập địa chỉ"
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  {editing && (
                    <div className="flex gap-4 mt-6">
                      <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        disabled={loading}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        Hủy
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="mt-6 shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" gutterBottom className="text-gray-900 font-semibold">
                  <Security className="mr-2 align-middle" />
                  Bảo mật tài khoản
                </Typography>
                <Divider className="mb-4" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        Đổi mật khẩu
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Thay đổi mật khẩu để bảo vệ tài khoản
                      </Typography>
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    >
                      Đổi mật khẩu
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        Xác thực 2 lớp
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Tăng cường bảo mật với xác thực 2 lớp
                      </Typography>
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    >
                      Thiết lập
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        Lịch sử đăng nhập
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Xem các phiên đăng nhập gần đây
                      </Typography>
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    >
                      Xem lịch sử
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
};
