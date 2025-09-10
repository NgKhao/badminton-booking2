import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  Container,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  SportsTennis,
  EventNote,
  People,
  Analytics,
  Settings,
  Notifications,
  AccountCircle,
  ExitToApp,
  Home,
  NavigateNext,
} from '@mui/icons-material';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLogoutMutation } from '../../hooks/useApi';

const drawerWidth = 280;

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const menuItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/admin',
    description: 'Tổng quan hệ thống',
  },
  {
    text: 'Quản lý sân',
    icon: <SportsTennis />,
    path: '/admin/courts',
    description: 'Quản lý thông tin sân',
  },
  {
    text: 'Quản lý đặt sân',
    icon: <EventNote />,
    path: '/admin/bookings',
    description: 'Xử lý đặt sân',
  },
  {
    text: 'Quản lý khách hàng',
    icon: <People />,
    path: '/admin/customers',
    description: 'Thông tin khách hàng',
  },
  {
    text: 'Báo cáo & Thống kê',
    icon: <Analytics />,
    path: '/admin/analytics',
    description: 'Phân tích doanh thu',
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // React Query logout mutation
  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      logout();
      navigate('/');
    },
    onError: (error) => {
      console.error('Logout API failed:', error);
      // Fallback to local logout
      logout();
      navigate('/');
    },
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
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
      navigate('/');
    }
    handleProfileMenuClose();
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs = [
      <Link
        key="home"
        color="inherit"
        href="/"
        onClick={(e) => {
          e.preventDefault();
          navigate('/');
        }}
        sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
      >
        <Home sx={{ mr: 0.5 }} fontSize="inherit" />
        Trang chủ
      </Link>,
    ];

    pathnames.forEach((pathname, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;

      let displayName = pathname;
      if (pathname === 'admin') displayName = 'Quản trị';
      else if (pathname === 'courts') displayName = 'Quản lý sân';
      else if (pathname === 'bookings') displayName = 'Quản lý đặt sân';
      else if (pathname === 'customers') displayName = 'Quản lý khách hàng';
      else if (pathname === 'analytics') displayName = 'Báo cáo & Thống kê';

      if (isLast) {
        breadcrumbs.push(
          <Typography key={routeTo} color="text.primary" sx={{ fontWeight: 'medium' }}>
            {displayName}
          </Typography>
        );
      } else {
        breadcrumbs.push(
          <Link
            key={routeTo}
            color="inherit"
            onClick={(e) => {
              e.preventDefault();
              navigate(routeTo);
            }}
            sx={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            {displayName}
          </Link>
        );
      }
    });

    return breadcrumbs;
  };

  const drawer = (
    <Box>
      {/* Logo và Header */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SportsTennis sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            BadmintonHub
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Quản trị viên
        </Typography>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenuItemClick(item.path)}
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  ...(isActive && {
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  }),
                  ...(!isActive && {
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    },
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 'medium' : 'normal',
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    ...(isActive && { color: 'rgba(255,255,255,0.7)' }),
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Breadcrumbs */}
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ flexGrow: 1 }}>
            {generateBreadcrumbs()}
          </Breadcrumbs>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton onClick={handleProfileMenuOpen} color="inherit">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.875rem',
                }}
              >
                {user?.full_name?.charAt(0).toUpperCase() || 'A'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
            {user?.full_name || 'Admin User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Hồ sơ cá nhân
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Cài đặt
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children || <Outlet />}
        </Container>
      </Box>
    </Box>
  );
};
