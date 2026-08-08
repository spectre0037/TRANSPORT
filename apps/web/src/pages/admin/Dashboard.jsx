import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Bus, Ticket, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../lib/api';

const COLORS = ['#7C1648', '#E85D75', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;
  if (!data) return null;

  const statCards = [
    { icon: Users, label: 'Total Users', value: data.stats.totalUsers, color: 'text-clay-primary' },
    { icon: Bus, label: 'Departures', value: data.stats.totalDepartures, color: 'text-clay-accent' },
    { icon: Ticket, label: 'Total Bookings', value: data.stats.totalBookings, color: 'text-clay-info' },
    { icon: DollarSign, label: 'Revenue', value: `PKR ${data.stats.totalRevenue.toLocaleString()}`, color: 'text-clay-success' },
    { icon: Clock, label: 'Pending Bookings', value: data.stats.pendingBookings, color: 'text-clay-warning' },
    { icon: AlertTriangle, label: 'Pending Refunds', value: data.stats.pendingRefunds, color: 'text-clay-danger' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clay-text">Admin Dashboard</h1>
        <p className="text-clay-muted text-sm">Overview of TaleemXpress operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by Status */}
        <div className="clay-card">
          <h2 className="font-bold text-clay-text mb-4">Bookings by Status</h2>
          {data.bookingsByStatus.length === 0 ? (
            <p className="text-clay-muted text-sm text-center py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.bookingsByStatus.map((d) => ({ name: d.status, value: parseInt(d.count) }))}
                  cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {data.bookingsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Departures by Route */}
        <div className="clay-card">
          <h2 className="font-bold text-clay-text mb-4">Departures by Route</h2>
          {data.departuresByRoute.length === 0 ? (
            <p className="text-clay-muted text-sm text-center py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.departuresByRoute.map((d) => ({ route: d.route, count: parseInt(d.count) }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#7C1648" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="clay-card">
        <h2 className="font-bold text-clay-text mb-4">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="clay-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Student</th>
                <th>Route</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentBookings.map((b) => (
                <tr key={b.id}>
                  <td className="font-mono text-xs">{b.bookingReference}</td>
                  <td>{b.user?.fullName}</td>
                  <td>{b.departure?.route}</td>
                  <td className="font-bold">PKR {b.totalAmount}</td>
                  <td>
                    <span className={`clay-badge ${
                      b.status === 'approved' ? 'bg-green-100 text-green-700' :
                      b.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
