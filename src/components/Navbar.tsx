import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Container,
} from '@mui/material';
import {
  SportsBasketball as BadmintonIcon,
  ExitToApp,
  Person,
  History,
  Home,
  EventNote,
  SportsTennis,
  Settings,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLogoutMutation } from '../hooks/useApi';

interface NavbarProps {
  onOpenChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const location = useLocation();

  // React Query logout mutation
  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      // Clear auth store after successful API call
      logout();
    },
    onError: (error) => {
      console.error('Logout API failed:', error);
      // Fallback to local logout even if API fails
      logout();
    },
  });

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      // Call logout API với React Query
      logoutMutation.mutate();
    } else {
      // Không có refresh token, logout local
      logout();
    }
    handleClose();
  };

  const navItems = [
    { label: 'Trang chủ', path: '/', icon: Home },
    { label: 'Xem sân', path: '/courts', icon: SportsTennis },
  ];

  const authenticatedNavItems = [
    { label: 'Trang chủ', path: '/', icon: Home },
    { label: 'Xem sân', path: '/courts', icon: SportsTennis },
    { label: 'Đặt sân', path: '/booking', icon: EventNote },
  ];

  const adminNavItems = [
    { label: 'Admin Panel', path: '/admin', icon: Settings },
    { label: 'Xem sân', path: '/courts', icon: SportsTennis },
  ];

  // Choose navigation items based on user role
  const getNavItems = () => {
    if (!isAuthenticated) return navItems;
    if (user?.role === 'admin') return adminNavItems;
    return authenticatedNavItems;
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'background.paper', boxShadow: 1 }} elevation={0}>
      <Container maxWidth="lg">
        <Toolbar sx={{ px: 0 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BadmintonIcon sx={{ color: 'primary.main', mr: 1 }} fontSize="large" />
            <Typography
              variant="h5"
              component="div"
              sx={{ fontWeight: 'bold', color: 'text.primary' }}
            >
              BadmintonHub
            </Typography>
          </Box>

          {/* Navigation Menu - Show different items based on authentication */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mx: 4, flex: 1 }}>
            {getNavItems().map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                startIcon={<item.icon />}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                  ...(location.pathname === item.path && {
                    color: 'primary.main',
                    bgcolor: 'primary.50',
                  }),
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Navigation Actions */}
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* User Menu */}
              <IconButton onClick={handleMenu} sx={{ ml: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  {user?.full_name?.[0] || user?.email[0].toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{ mt: 1 }}
              >
                <MenuItem
                  onClick={handleLogout}
                  sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}
                >
                  <ExitToApp sx={{ mr: 1 }} fontSize="small" />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button color="inherit" component={Link} to="/auth" sx={{ color: 'text.secondary' }}>
                Đăng nhập
              </Button>
              <Button variant="contained" color="primary" component={Link} to="/auth">
                Đăng ký
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};
