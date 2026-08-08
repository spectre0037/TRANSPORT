import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bus, Ticket, Wallet, LogOut, Menu, X, Bell, Car } from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../stores/authStore';
import api from '../lib/api';
import logoImage from '../assets/hiace (1).png';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/departures', icon: Bus, label: 'Departures' },
  { to: '/bookings', icon: Ticket, label: 'My Bookings' },
  { to: '/private-booking', icon: Car, label: 'Private Booking' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    api.get('/api/notifications')
      .then((r) => setNotificationCount(r.data.length))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-clay-bg">
      {/* Sidebar */}
      <aside className={`clay-sidebar transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-clay-border">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-clay-border bg-white shadow-clay">
              <img src={logoImage} alt="TaleemXpress logo" className="h-full w-full object-cover" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-clay-primary">TaleemXpress</h1>
              <p className="text-xs text-clay-muted mt-1">Student Portal</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-clay text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-clay-primary text-white shadow-clay'
                    : 'text-clay-text hover:bg-clay-bg'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-clay-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-clay text-sm font-medium text-clay-danger hover:bg-red-50 w-full transition-all">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-clay-border px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-clay-text">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <NavLink to="/notifications" className="relative text-clay-muted hover:text-clay-primary transition-colors">
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-clay-danger rounded-full"></span>
              )}
            </NavLink>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-clay-primary flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-clay-text">{user?.fullName}</p>
                <p className="text-xs text-clay-muted">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
