import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import PublicBookingsPage from './pages/PublicBookings';
import HowToBookPage from './pages/HowToBook';
import MapsPage from './pages/Maps';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import DeparturesPage from './pages/student/Departures';
import SeatMapPage from './pages/student/SeatMap';
import MyBookingsPage from './pages/student/MyBookings';
import WalletPage from './pages/student/Wallet';
import StudentNotifications from './pages/student/Notifications';
import PrivateBooking from './pages/student/PrivateBooking';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminDepartures from './pages/admin/Departures';
import AdminBookings from './pages/admin/Bookings';
import AdminUsers from './pages/admin/Users';
import AdminRefunds from './pages/admin/Refunds';
import AdminTopups from './pages/admin/Topups';
import AdminRouteHistory from './pages/admin/RouteHistory';
import AdminRouteAnalytics from './pages/admin/RouteAnalytics';
import AdminNotifications from './pages/admin/Notifications';
import AdminPrivateBookings from './pages/admin/PrivateBookings';

function BookingsGateway() {
  const { user } = useAuthStore();

  if (!user) return <PublicBookingsPage />;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <MyBookingsPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" />;
  // Require email verification for all protected routes
  if (!user.isEmailVerified) return <Navigate to="/verify-email" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  return children;
}

// Only checks auth, not verification — for /verify-email
function AuthRoute({ children }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  const { initialize, initialized } = useAuthStore();
  useEffect(() => { initialize(); }, [initialize]);

  if (!initialized) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-to-book" element={<HowToBookPage />} />
        <Route path="/maps" element={<MapsPage />} />
      </Route>

      <Route path="/bookings" element={<BookingsGateway />} />

      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/verify-email" element={<AuthRoute><VerifyEmailPage /></AuthRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Student */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/departures" element={<DeparturesPage />} />
        <Route path="/departures/:id" element={<SeatMapPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/notifications" element={<StudentNotifications />} />
        <Route path="/private-booking" element={<PrivateBooking />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/departures" element={<AdminDepartures />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/refunds" element={<AdminRefunds />} />
        <Route path="/admin/topups" element={<AdminTopups />} />
        <Route path="/admin/history" element={<AdminRouteHistory />} />
        <Route path="/admin/analytics" element={<AdminRouteAnalytics />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/private-bookings" element={<AdminPrivateBookings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
