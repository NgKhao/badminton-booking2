import React, { useState } from 'react';
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
import { useAuthStore } from '../store/authStore';

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
  const { login, setLoading, loading } = useAuthStore();

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
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      // TODO: Call API để đăng nhập
      console.log('Login data:', data);

      // Mock response - thay thế bằng API call thực tế
      setTimeout(() => {
        const mockUser = {
          user_id: 1,
          email: data.email,
          full_name: 'Nguyễn Văn A',
          phone: '0123456789',
          role: 'customer' as const,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const mockCustomer = {
          customer_id: 1,
          user_id: 1,
          phone: '0123456789',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        login(mockUser, mockCustomer);
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  const onSignupSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      // TODO: Call API để đăng ký
      console.log('Signup data:', data);

      // Mock response - thay thế bằng API call thực tế
      setTimeout(() => {
        const mockUser = {
          user_id: 1,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          role: 'customer' as const,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const mockCustomer = {
          customer_id: 1,
          user_id: 1,
          phone: data.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        login(mockUser, mockCustomer);
      }, 1000);
    } catch (error) {
      console.error('Signup error:', error);
      setLoading(false);
    }
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
