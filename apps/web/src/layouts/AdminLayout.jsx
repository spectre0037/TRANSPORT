import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bus, Ticket, Users, RotateCcw, Wallet, LogOut, Menu, X, History, BarChart3, Bell, Car } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../stores/authStore';
import logoImage from '../assets/hiace (1).png';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/departures', icon: Bus, label: 'Departures' },
  { to: '/admin/bookings', icon: Ticket, label: 'Bookings' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/refunds', icon: RotateCcw, label: 'Refunds' },
  { to: '/admin/topups', icon: Wallet, label: 'Top-ups' },
  { to: '/admin/history', icon: History, label: 'Route History' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Route Analytics' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/private-bookings', icon: Car, label: 'Private Bookings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-clay-bg overflow-x-hidden">
      <aside className={`clay-sidebar transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-5 border-b border-clay-border sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-clay-border bg-white shadow-clay sm:h-12 sm:w-12">
              <img src={logoImage} alt="TaleemXpress logo" className="h-full w-full object-cover" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-clay-primary sm:text-xl">TaleemXpress</h1>
              <p className="text-xs text-clay-muted mt-1">Admin Portal</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
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

      {mobileOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="md:ml-64">
        <header className="bg-white/80 backdrop-blur-sm border-b border-clay-border px-4 py-4 flex items-center justify-between sticky top-0 z-20 sm:px-6">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-clay-text">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="hidden md:block">
            <h2 className="text-lg font-bold text-clay-text">Admin Panel</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-clay-secondary flex items-center justify-center text-white text-sm font-bold">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-clay-text">{user?.fullName}</p>
              <p className="text-xs text-clay-muted">Administrator</p>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
