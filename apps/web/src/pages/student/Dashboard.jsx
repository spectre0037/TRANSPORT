import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, Ticket, Wallet, Calendar, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import api from '../../lib/api';

export default function StudentDashboard() {
  const [stats, setStats] = useState({ departures: 0, bookings: 0, balance: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [depRes, bookRes, walletRes] = await Promise.all([
          api.get('/api/departures'),
          api.get('/api/bookings/my'),
          api.get('/api/wallet/balance'),
        ]);
        setStats({
          departures: depRes.data.length,
          bookings: bookRes.data.length,
          balance: walletRes.data.balance,
        });
        setRecentBookings(bookRes.data.slice(0, 5));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;

  const statusColor = (s) => {
    switch (s) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-5 px-3 pb-24 sm:space-y-6 sm:px-0 sm:pb-6">
      <div className="pt-1 px-1 sm:px-0">
        <h1 className="text-lg font-bold text-clay-text sm:text-2xl md:text-3xl">Dashboard</h1>
        <p className="text-clay-muted text-xs sm:text-sm">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {[
          { icon: Bus, label: 'Available Routes', value: stats.departures, color: 'text-clay-primary' },
          { icon: Ticket, label: 'My Bookings', value: stats.bookings, color: 'text-clay-accent' },
          { icon: Wallet, label: 'Wallet Balance', value: `PKR ${stats.balance}`, color: 'text-clay-success' },
          { icon: TrendingUp, label: 'Active', value: 'Yes', color: 'text-clay-info' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="clay-card flex items-center gap-2.5 p-3 sm:gap-4 sm:p-4">
            <div className={`w-9 h-9 flex-shrink-0 rounded-clay bg-clay-bg flex items-center justify-center sm:w-12 sm:h-12 ${s.color}`}>
              <s.icon size={17} className="sm:hidden" />
              <s.icon size={22} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-clay-text truncate sm:text-2xl">{s.value}</p>
              <p className="text-[10px] text-clay-muted leading-tight sm:text-xs">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions — side by side always */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <Link to="/departures" className="clay-card hover:shadow-clay-lg transition-all flex items-center justify-between gap-2 p-3 group sm:p-4">
          <div className="flex items-center gap-2 min-w-0 sm:gap-3">
            <Bus className="text-clay-primary flex-shrink-0" size={17} />
            <span className="font-semibold text-clay-text text-xs truncate sm:text-base">Browse Departures</span>
          </div>
          <ArrowRight className="text-clay-muted group-hover:text-clay-primary transition-colors flex-shrink-0" size={15} />
        </Link>
        <Link to="/wallet" className="clay-card hover:shadow-clay-lg transition-all flex items-center justify-between gap-2 p-3 group sm:p-4">
          <div className="flex items-center gap-2 min-w-0 sm:gap-3">
            <Wallet className="text-clay-success flex-shrink-0" size={17} />
            <span className="font-semibold text-clay-text text-xs truncate sm:text-base">View Wallet</span>
          </div>
          <ArrowRight className="text-clay-muted group-hover:text-clay-primary transition-colors flex-shrink-0" size={15} />
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="clay-card p-3.5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
          <h2 className="font-bold text-clay-text text-sm sm:text-base">Recent Bookings</h2>
          <Link to="/bookings" className="text-xs text-clay-primary hover:underline sm:text-sm">View All</Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-clay-muted text-xs py-4 text-center sm:text-sm">No bookings yet. Browse departures to get started!</p>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-2 rounded-clay bg-clay-bg/50 p-2.5 sm:gap-3 sm:p-3">
                <div className="flex items-center gap-2 min-w-0 sm:gap-3">
                  <Bus className="text-clay-primary flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-clay-text truncate sm:text-sm">{b.departure?.route}</p>
                    <p className="text-[10px] text-clay-muted flex items-center gap-1 truncate sm:text-xs">
                      <Calendar size={11} className="flex-shrink-0" />
                      {b.departure?.departureTime} • Seat {b.seat?.seatNumber}
                    </p>
                  </div>
                </div>
                <span className={`clay-badge flex-shrink-0 text-[9px] sm:text-[10px] ${statusColor(b.status)}`}>{b.status?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}