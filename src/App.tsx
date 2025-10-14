import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Theme and Components
import { theme } from './utils/theme';
import { Navbar } from './components/Navbar';

// Pages
import { HomePage } from './pages/user/HomePage';
import { AuthPage } from './pages/user/AuthPage';
import { BookingPage } from './pages/user/BookingPage';
import { CourtsPage } from './pages/user/CourtsPage';
import { ProfilePage } from './pages/user/ProfilePage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminCourtsPage } from './pages/admin/AdminCourtsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

// Components
import { ChatFAB } from './components/AIChat';

// Store
import { useAuthStore } from './store/authStore';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to home if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/courts" replace />;
};

function App() {
  // TODO: Uncomment when implementing AI Chat
  // const [isChatOpen, setIsChatOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleOpenChat = () => {
    // TODO: Implement chat functionality
    console.log('Open chat');
    // setIsChatOpen(true);
  };

  // TODO: Implement when adding chat
  // const handleCloseChat = () => {
  //   setIsChatOpen(false);
  // };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box className="min-h-screen bg-gray-50">
            {/* Navigation - always show but with different items based on authentication */}
            <Navbar onOpenChat={handleOpenChat} />

            {/* Main Content */}
            <Box component="main">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/auth"
                  element={
                    <PublicRoute>
                      <AuthPage />
                    </PublicRoute>
                  }
                />

                {/* Courts page - accessible to everyone */}
                <Route path="/courts" element={<CourtsPage />} />

                {/* Protected Routes */}
                <Route
                  path="/booking"
                  element={
                    <ProtectedRoute>
                      <BookingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Login Route */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminCourtsPage />} />
                  <Route path="courts" element={<AdminCourtsPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="bookings" element={<AdminBookingsPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  {/* Add more admin routes here later */}
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>

            {/* AI Chat Component */}
            {isAuthenticated && <ChatFAB />}
          </Box>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
