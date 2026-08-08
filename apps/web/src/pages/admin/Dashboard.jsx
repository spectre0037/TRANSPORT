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

  const statusColor = (s) =>
    s === 'approved' ? 'bg-green-100 text-green-700' :
    s === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';

  return (
    <div className="space-y-5 px-3 pb-24 sm:space-y-6 sm:px-0 sm:pb-6">
      <div className="pt-1 px-1 sm:px-0">
        <h1 className="text-lg font-bold text-clay-text sm:text-2xl">Admin Dashboard</h1>
        <p className="text-clay-muted text-xs sm:text-sm">Overview of TaleemXpress operations</p>
      </div>

      {/* Stats Grid — 2 cols on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
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

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
        {/* Bookings by Status */}
        <div className="clay-card p-3.5 sm:p-6">
          <h2 className="font-bold text-clay-text mb-3 text-sm sm:mb-4 sm:text-base">Bookings by Status</h2>
          {data.bookingsByStatus.length === 0 ? (
            <p className="text-clay-muted text-xs text-center py-8 sm:text-sm">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220} className="sm:!h-[250px]">
              <PieChart>
                <Pie data={data.bookingsByStatus.map((d) => ({ name: d.status, value: parseInt(d.count) }))}
                  cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${value}`}>
                  {data.bookingsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Departures by Route */}
        <div className="clay-card p-3.5 sm:p-6">
          <h2 className="font-bold text-clay-text mb-3 text-sm sm:mb-4 sm:text-base">Departures by Route</h2>
          {data.departuresByRoute.length === 0 ? (
            <p className="text-clay-muted text-xs text-center py-8 sm:text-sm">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220} className="sm:!h-[250px]">
              <BarChart data={data.departuresByRoute.map((d) => ({ route: d.route, count: parseInt(d.count) }))} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#7C1648" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="clay-card p-3.5 sm:p-6">
        <h2 className="font-bold text-clay-text mb-3 text-sm sm:mb-4 sm:text-base">Recent Bookings</h2>

        {/* Mobile: compact cards, reference + student side by side with amount */}
        <div className="space-y-2.5 md:hidden">
          {data.recentBookings.map((b) => (
            <div key={b.id} className="rounded-clay bg-clay-bg/50 p-2.5 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] text-clay-muted truncate">{b.bookingReference}</p>
                  <p className="font-medium text-clay-text text-sm truncate">{b.user?.fullName}</p>
                  <p className="text-[11px] text-clay-muted truncate">{b.departure?.route}</p>
                </div>
                <span className={`clay-badge text-[9px] flex-shrink-0 ${statusColor(b.status)}`}>{b.status}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] text-clay-muted">{b.departure?.departureTime}</span>
                <span className="font-bold text-clay-primary text-sm">PKR {b.totalAmount}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
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
                    <span className={`clay-badge ${statusColor(b.status)}`}>{b.status}</span>
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