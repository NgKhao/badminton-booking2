import { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Divider,
  Link,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  SportsBasketball,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  useLoginMutation,
  useRegisterMutation,
  type LoginRequest,
  type RegisterRequest,
} from '../../hooks/useApi';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types';

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone: string;
}

export const AuthPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Helper function để check if user is admin
  const isAdmin = (role?: string): boolean => {
    return role === 'ADMIN' || role === 'admin';
  };

  // Helper function để map user data
  const mapUserData = (userInfo: {
    id?: number;
    email: string;
    fullName?: string;
    full_name?: string;
    phone?: string;
    role: string;
  }): User => {
    return {
      user_id: userInfo.id || 0,
      email: userInfo.email,
      full_name: userInfo.fullName || userInfo.full_name || '',
      phone: userInfo.phone,
      role: isAdmin(userInfo.role) ? 'admin' : 'customer',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  // Login mutation
  const loginMutation = useLoginMutation({
    onSuccess: (data) => {
      console.log('Login response:', data);

      // Tạo user object từ API response
      const user = mapUserData(data.detail.userInfo);

      // Lưu tokens và user info vào store
      login(user, undefined, {
        accessToken: data.detail.token.accessToken,
        refreshToken: data.detail.token.refreshToken,
      });

      // Chuyển hướng đến trang courts sau khi đăng nhập thành công
      navigate('/courts');
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  // Register mutation
  const registerMutation = useRegisterMutation({
    onSuccess: (data) => {
      console.log('Register response:', data);

      if (data.status === 200 && data.detail.userInfo) {
        // Map server user to app User type
        const user = mapUserData(data.detail.userInfo);

        // Nếu có token trong response thì tự động login
        if (data.detail.token) {
          login(user, undefined, {
            accessToken: data.detail.token.accessToken,
            refreshToken: data.detail.token.refreshToken,
          });

          // Chuyển hướng đến trang courts
          navigate('/courts');
        } else {
          // Nếu không có token, chuyển về tab login với thông báo
          setTabValue(0);
          // Có thể thêm toast notification ở đây
          console.log('Đăng ký thành công! Vui lòng đăng nhập.');
        }
      }
    },
    onError: (error) => {
      console.error('Register error:', error);
    },
  });

  // Combined loading state
  const loading = loginMutation.isPending || registerMutation.isPending;

  // Error state
  const loginError = loginMutation.error;
  const registerError = registerMutation.error;

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    watch,
  } = useForm<RegisterFormData>();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Clear error khi chuyển tab
    loginMutation.reset();
    registerMutation.reset();
  };

  const onLoginSubmit = (data: LoginFormData) => {
    // Gọi API login thông qua mutation
    loginMutation.mutate(data as LoginRequest);
  };

  const onSignupSubmit = (data: RegisterFormData) => {
    // Loại bỏ confirmPassword và gọi API register thông qua mutation
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData as RegisterRequest);
  };

  return (
    <Box className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
      <Container maxWidth="sm">
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            {/* Header */}
            <Box className="text-center mb-8">
              <Box className="flex justify-center items-center mb-4">
                <SportsBasketball className="text-emerald-500 mr-2" fontSize="large" />
                <Typography variant="h4" className="font-bold text-gray-900">
                  BadmintonHub
                </Typography>
              </Box>
              <Typography variant="body1" className="text-gray-600">
                Đăng nhập để đặt sân cầu lông
              </Typography>
            </Box>

            {/* Tabs */}
            <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" className="mb-6">
              <Tab label="Đăng nhập" />
              <Tab label="Đăng ký" />
            </Tabs>

            {/* Error Display */}
            {(loginError || registerError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginError?.response?.data?.messenger ||
                  registerError?.response?.data?.messenger ||
                  loginError?.message ||
                  registerError?.message ||
                  'Có lỗi xảy ra'}
              </Alert>
            )}

            {/* Login Form */}
            {tabValue === 0 && (
              <Box component="form" onSubmit={handleLoginSubmit(onLoginSubmit)}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  {...registerLogin('email', {
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ',
                    },
                  })}
                  error={!!loginErrors.email}
                  helperText={loginErrors.email?.message}
                />

                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...registerLogin('password', {
                    required: 'Mật khẩu là bắt buộc',
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu phải có ít nhất 6 ký tự',
                    },
                  })}
                  error={!!loginErrors.password}
                  helperText={loginErrors.password?.message}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  className="mt-6 mb-4 bg-emerald-500 hover:bg-emerald-600 py-3"
                  disabled={loading}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>

                <Box className="text-center">
                  <Link href="#" className="text-emerald-600 hover:text-emerald-700">
                    Quên mật khẩu?
                  </Link>
                </Box>
              </Box>
            )}

            {/* Register Form */}
            {tabValue === 1 && (
              <Box component="form" onSubmit={handleSignupSubmit(onSignupSubmit)}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  {...registerSignup('full_name', {
                    required: 'Họ và tên là bắt buộc',
                    minLength: {
                      value: 2,
                      message: 'Họ và tên phải có ít nhất 2 ký tự',
                    },
                  })}
                  error={!!signupErrors.full_name}
                  helperText={signupErrors.full_name?.message}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  {...registerSignup('email', {
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ',
                    },
                  })}
                  error={!!signupErrors.email}
                  helperText={signupErrors.email?.message}
                />

                <TextField
                  fullWidth
                  label="Số điện thoại"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  {...registerSignup('phone', {
                    required: 'Số điện thoại là bắt buộc',
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: 'Số điện thoại không hợp lệ',
                    },
                  })}
                  error={!!signupErrors.phone}
                  helperText={signupErrors.phone?.message}
                />

                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...registerSignup('password', {
                    required: 'Mật khẩu là bắt buộc',
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu phải có ít nhất 6 ký tự',
                    },
                  })}
                  error={!!signupErrors.password}
                  helperText={signupErrors.password?.message}
                />

                <TextField
                  fullWidth
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? 'text' : 'password'}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...registerSignup('confirmPassword', {
                    required: 'Xác nhận mật khẩu là bắt buộc',
                    validate: (value) => value === watch('password') || 'Mật khẩu không khớp',
                  })}
                  error={!!signupErrors.confirmPassword}
                  helperText={signupErrors.confirmPassword?.message}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  className="mt-6 mb-4 bg-emerald-500 hover:bg-emerald-600 py-3"
                  disabled={loading}
                >
                  {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </Button>
              </Box>
            )}

            <Divider className="my-6" />

            <Typography variant="body2" className="text-center text-gray-600">
              Bằng cách đăng nhập, bạn đồng ý với{' '}
              <Link href="#" className="text-emerald-600">
                Điều khoản dịch vụ
              </Link>{' '}
              và{' '}
              <Link href="#" className="text-emerald-600">
                Chính sách bảo mật
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
