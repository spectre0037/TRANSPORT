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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clay-text">Dashboard</h1>
        <p className="text-clay-muted text-sm">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Bus, label: 'Available Routes', value: stats.departures, color: 'text-clay-primary' },
          { icon: Ticket, label: 'My Bookings', value: stats.bookings, color: 'text-clay-accent' },
          { icon: Wallet, label: 'Wallet Balance', value: `PKR ${stats.balance}`, color: 'text-clay-success' },
          { icon: TrendingUp, label: 'Active', value: 'Yes', color: 'text-clay-info' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="clay-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-clay bg-clay-bg flex items-center justify-center ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-clay-text">{s.value}</p>
              <p className="text-xs text-clay-muted">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/departures" className="clay-card hover:shadow-clay-lg transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <Bus className="text-clay-primary" size={20} />
            <span className="font-semibold text-clay-text">Browse Departures</span>
          </div>
          <ArrowRight className="text-clay-muted group-hover:text-clay-primary transition-colors" size={18} />
        </Link>
        <Link to="/wallet" className="clay-card hover:shadow-clay-lg transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <Wallet className="text-clay-success" size={20} />
            <span className="font-semibold text-clay-text">View Wallet</span>
          </div>
          <ArrowRight className="text-clay-muted group-hover:text-clay-primary transition-colors" size={18} />
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="clay-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-clay-text">Recent Bookings</h2>
          <Link to="/bookings" className="text-sm text-clay-primary hover:underline">View All</Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-clay-muted text-sm py-4 text-center">No bookings yet. Browse departures to get started!</p>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-clay bg-clay-bg/50">
                <div className="flex items-center gap-3">
                  <Bus className="text-clay-primary" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-clay-text">{b.departure?.route}</p>
                    <p className="text-xs text-clay-muted flex items-center gap-1">
                      <Calendar size={12} />
                      {b.departure?.departureTime} • Seat {b.seat?.seatNumber}
                    </p>
                  </div>
                </div>
                <span className={`clay-badge ${statusColor(b.status)}`}>{b.status?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
