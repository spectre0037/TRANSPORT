import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, Users, Bus, Route, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../../lib/api';

const CHART_COLORS = ['#7C1648', '#E85D75', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function RouteAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics/routes')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const totalRoutes = data.length;
  const totalBookings = data.reduce((s, r) => s + r.totalBookings, 0);
  const totalRevenue = data.reduce((s, r) => s + r.totalRevenue, 0);
  const avgOccupancy = data.length > 0
    ? Math.round(data.reduce((s, r) => s + r.occupancyRate, 0) / data.length)
    : 0;

  const statCards = [
    { icon: Route, label: 'Total Routes', value: totalRoutes, color: 'text-clay-primary' },
    { icon: Users, label: 'Total Bookings', value: totalBookings, color: 'text-clay-accent' },
    { icon: DollarSign, label: 'Total Revenue', value: `PKR ${totalRevenue.toLocaleString()}`, color: 'text-clay-success' },
    { icon: TrendingUp, label: 'Avg Occupancy', value: `${avgOccupancy}%`, color: 'text-clay-info' },
  ];

  const occupancyColor = (r) => r >= 75 ? 'text-clay-success' : r >= 50 ? 'text-clay-warning' : 'text-clay-danger';
  const occupancyBar = (r) => r >= 75 ? 'bg-clay-success' : r >= 50 ? 'bg-clay-warning' : 'bg-clay-danger';

  return (
    <div className="space-y-5 px-3 pb-24 sm:space-y-6 sm:px-0 sm:pb-6">
      <div className="pt-1 px-1 sm:px-0">
        <h1 className="text-lg font-bold text-clay-text sm:text-2xl">Route Analytics</h1>
        <p className="text-clay-muted text-xs sm:text-sm">Comprehensive analytics across all routes</p>
      </div>

      {/* Stats Cards — 2 cols mobile, 4 desktop */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
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
        {/* Bookings per Route */}
        <div className="clay-card p-3.5 sm:p-6">
          <h2 className="font-bold text-clay-text mb-3 text-sm sm:mb-4 sm:text-base">Bookings per Route</h2>
          {data.length === 0 ? (
            <p className="text-clay-muted text-xs text-center py-8 sm:text-sm">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={240} className="sm:!h-[300px]">
              <BarChart data={data.map((d) => ({ route: d.route, bookings: d.totalBookings, approved: d.approvedBookings }))} margin={{ left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={55} interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="approved" name="Approved" fill="#7C1648" radius={[6, 6, 0, 0]} />
                <Bar dataKey="bookings" name="Total" fill="#E85D75" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue per Route */}
        <div className="clay-card p-3.5 sm:p-6">
          <h2 className="font-bold text-clay-text mb-3 text-sm sm:mb-4 sm:text-base">Revenue Distribution</h2>
          {data.length === 0 ? (
            <p className="text-clay-muted text-xs text-center py-8 sm:text-sm">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={240} className="sm:!h-[300px]">
              <PieChart>
                <Pie
                  data={data.filter((d) => d.totalRevenue > 0).map((d) => ({ name: d.route, value: d.totalRevenue }))}
                  cx="50%" cy="50%" outerRadius={75}
                  label={({ value }) => `${(value / 1000).toFixed(0)}k`}
                  labelLine={false}
                >
                  {data.filter((d) => d.totalRevenue > 0).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`PKR ${value.toLocaleString()}`, 'Revenue']} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detail Table */}
      <div className="clay-card p-3.5 sm:p-6">
        <h2 className="font-bold text-clay-text mb-3 text-sm sm:mb-4 sm:text-base">Per-Route Breakdown</h2>
        {data.length === 0 ? (
          <p className="text-clay-muted text-xs text-center py-8 sm:text-sm">No route data available yet</p>
        ) : (
          <>
          {/* Mobile: compact cards, 4-across stat row */}
          <div className="space-y-2.5 md:hidden">
            {data.map((r) => (
              <div key={r.route} className="rounded-clay bg-clay-bg/50 p-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-clay-text text-sm truncate">{r.route}</p>
                    <p className="text-[11px] text-clay-muted truncate">{r.fromCity} → {r.toCity}</p>
                  </div>
                  <span className={`text-xs font-semibold flex-shrink-0 ${occupancyColor(r.occupancyRate)}`}>{r.occupancyRate}%</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  <div><p className="text-[9px] text-clay-muted">Departs</p><p className="text-[11px] font-medium">{r.totalDepartures}</p></div>
                  <div><p className="text-[9px] text-clay-muted">Seats</p><p className="text-[11px] font-medium">{r.totalSeats}</p></div>
                  <div><p className="text-[9px] text-clay-muted">Bookings</p><p className="text-[11px] font-medium">{r.totalBookings}</p></div>
                  <div className="min-w-0"><p className="text-[9px] text-clay-muted">Revenue</p><p className="text-[11px] font-bold text-clay-primary truncate">PKR {r.totalRevenue.toLocaleString()}</p></div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="clay-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>From → To</th>
                  <th>Departures</th>
                  <th>Total Seats</th>
                  <th>Total Bookings</th>
                  <th>Approved</th>
                  <th>Revenue</th>
                  <th>Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i}>
                    <td className="font-semibold">{r.route}</td>
                    <td className="text-sm">{r.fromCity} → {r.toCity}</td>
                    <td>{r.totalDepartures}</td>
                    <td>{r.totalSeats}</td>
                    <td>{r.totalBookings}</td>
                    <td>
                      <span className="font-semibold text-clay-success">{r.approvedBookings}</span>
                    </td>
                    <td className="font-bold text-clay-primary">PKR {r.totalRevenue.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${occupancyBar(r.occupancyRate)}`} style={{ width: `${r.occupancyRate}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${occupancyColor(r.occupancyRate)}`}>{r.occupancyRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </div>
  );
}