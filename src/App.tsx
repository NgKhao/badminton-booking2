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
import { UserDashboard } from './pages/user/UserDashboard';
import { BookingPage } from './pages/user/BookingPage';
import { BookingHistoryPage } from './pages/user/BookingHistoryPage';
import { ProfilePage } from './pages/user/UserProfilePage';
import { CourtsPage } from './pages/user/CourtsPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';

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

// Admin Route Component (only for admin users)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
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
                <Route
                  path="/"
                  element={
                    <PublicRoute>
                      <HomePage />
                    </PublicRoute>
                  }
                />
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
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* TODO: Add more protected routes */}
                <Route
                  path="/booking"
                  element={
                    <ProtectedRoute>
                      <BookingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <BookingHistoryPage />
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

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    // <AdminRoute>
                    <AdminLayout />
                    // </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
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
