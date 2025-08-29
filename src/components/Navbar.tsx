import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Container,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  SportsBasketball as BadmintonIcon,
  ExitToApp,
  Person,
  History,
  Chat,
  Home,
  EventNote,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface NavbarProps {
  onOpenChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenChat }) => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const location = useLocation();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const navItems = [
    { label: 'Trang chủ', path: '/dashboard', icon: Home },
    { label: 'Đặt sân', path: '/booking', icon: EventNote },
    { label: 'Lịch sử', path: '/bookings', icon: History },
  ];

  return (
    <AppBar position="sticky" className="bg-white shadow-sm" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar className="px-0">
          {/* Logo */}
          <Box className="flex items-center">
            <BadmintonIcon className="text-emerald-500 mr-2" fontSize="large" />
            <Typography variant="h5" component="div" className="font-bold text-gray-900">
              BadmintonHub
            </Typography>
          </Box>

          {/* Navigation Menu - Only show when authenticated */}
          {isAuthenticated && (
            <Box className="flex items-center space-x-1 mx-8 flex-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={<item.icon />}
                  className={`text-gray-600 hover:text-emerald-500 ${
                    location.pathname === item.path ? 'text-emerald-500 bg-emerald-50' : ''
                  }`}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Navigation Actions */}
          {isAuthenticated ? (
            <Box className="flex items-center space-x-2">
              {/* AI Chat Button */}
              <IconButton onClick={onOpenChat} className="text-gray-600 hover:text-emerald-500">
                <Chat />
              </IconButton>

              {/* Notifications */}
              <IconButton className="text-gray-600 hover:text-emerald-500">
                <Badge badgeContent={2} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* User Menu */}
              <IconButton onClick={handleMenu} className="ml-2">
                <Avatar className="bg-emerald-500 w-8 h-8">
                  {user?.full_name?.[0] || user?.email[0].toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                className="mt-2"
              >
                <MenuItem
                  onClick={handleClose}
                  className="flex items-center"
                  component={Link}
                  to="/profile"
                >
                  <Person className="mr-2" fontSize="small" />
                  Thông tin cá nhân
                </MenuItem>
                <MenuItem
                  onClick={handleClose}
                  className="flex items-center"
                  component={Link}
                  to="/bookings"
                >
                  <History className="mr-2" fontSize="small" />
                  Lịch sử đặt sân
                </MenuItem>
                <MenuItem onClick={handleLogout} className="flex items-center text-red-600">
                  <ExitToApp className="mr-2" fontSize="small" />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box className="flex items-center space-x-2">
              <Button color="inherit" className="text-gray-600" component={Link} to="/auth">
                Đăng nhập
              </Button>
              <Button
                variant="contained"
                className="bg-emerald-500 hover:bg-emerald-600"
                component={Link}
                to="/auth"
              >
                Đăng ký
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};
