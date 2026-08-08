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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clay-text">Route Analytics</h1>
        <p className="text-clay-muted text-sm">Comprehensive analytics across all routes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        {/* Bookings per Route */}
        <div className="clay-card">
          <h2 className="font-bold text-clay-text mb-4">Bookings per Route</h2>
          {data.length === 0 ? (
            <p className="text-clay-muted text-sm text-center py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.map((d) => ({ route: d.route, bookings: d.totalBookings, approved: d.approvedBookings }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="approved" name="Approved" fill="#7C1648" radius={[6, 6, 0, 0]} />
                <Bar dataKey="bookings" name="Total" fill="#E85D75" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue per Route */}
        <div className="clay-card">
          <h2 className="font-bold text-clay-text mb-4">Revenue Distribution</h2>
          {data.length === 0 ? (
            <p className="text-clay-muted text-sm text-center py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.filter((d) => d.totalRevenue > 0).map((d) => ({ name: d.route, value: d.totalRevenue }))}
                  cx="50%" cy="50%" outerRadius={100}
                  label={({ name, value }) => `${name}: PKR ${value.toLocaleString()}`}
                >
                  {data.filter((d) => d.totalRevenue > 0).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`PKR ${value.toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detail Table */}
      <div className="clay-card">
        <h2 className="font-bold text-clay-text mb-4">Per-Route Breakdown</h2>
        {data.length === 0 ? (
          <p className="text-clay-muted text-sm text-center py-8">No route data available yet</p>
        ) : (
          <div className="overflow-x-auto">
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
                          <div
                            className={`h-full rounded-full ${
                              r.occupancyRate >= 75 ? 'bg-clay-success' :
                              r.occupancyRate >= 50 ? 'bg-clay-warning' :
                              'bg-clay-danger'
                            }`}
                            style={{ width: `${r.occupancyRate}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${
                          r.occupancyRate >= 75 ? 'text-clay-success' :
                          r.occupancyRate >= 50 ? 'text-clay-warning' :
                          'text-clay-danger'
                        }`}>{r.occupancyRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
