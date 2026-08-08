import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Bus, Calendar, Clock, MapPin, Trash2, Truck } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'valid', 'confirmed', 'dropped'];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  valid: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  dropped: 'bg-red-100 text-red-700',
};

export default function AdminDepartures() {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ route: '', fromCity: '', toCity: '', departureDate: '', departureTime: '', pricePerSeat: '', busType: 'standard', vehicleType: 'bus', seatCount: 15 });

  const load = () => {
    api.get('/api/departures').then((r) => setDepartures(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/departures', form);
      toast.success('Departure created!');
      setShowModal(false);
      setForm({ route: '', fromCity: '', toCity: '', departureDate: '', departureTime: '', pricePerSeat: '', busType: 'standard', vehicleType: 'bus', seatCount: 15 });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/departures/${id}`, { status });
      toast.success(`Status changed to ${status}`);
      setDepartures((p) => p.map((d) => d.id === id ? { ...d, status } : d));
    } catch { toast.error('Failed to update status'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this departure?')) return;
    try {
      await api.delete(`/api/departures/${id}`);
      toast.success('Deleted');
      setDepartures((p) => p.filter((d) => d.id !== id));
    } catch { toast.error('Failed'); }
  };

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-clay-text">Departures</h1>
          <p className="text-clay-muted text-sm">Manage transport routes and set status</p>
        </div>
        <button onClick={() => setShowModal(true)} className="clay-btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Departure
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="clay-table">
          <thead>
            <tr><th>Route</th><th>Type</th><th>From → To</th><th>Date</th><th>Time</th><th>Seats</th><th>Price</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {departures.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-clay-muted">No departures yet</td></tr>
            ) : departures.map((d) => (
              <tr key={d.id}>
                <td className="font-semibold">{d.route}</td>
                <td>
                  <span className={`clay-badge text-xs ${(d.busType||'bus') === 'hiace' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                    {(d.busType||'bus') === 'hiace' ? '🚐 Hiace' : '🚌 Bus'}
                  </span>
                </td>
                <td><span className="flex items-center gap-1"><MapPin size={12} />{d.fromCity} → {d.toCity}</span></td>
                <td><span className="flex items-center gap-1"><Calendar size={12} />{new Date(d.departureDate).toLocaleDateString()}</span></td>
                <td><span className="flex items-center gap-1"><Clock size={12} />{d.departureTime}</span></td>
                <td>{d.totalSeats}</td>
                <td className="font-bold">PKR {d.pricePerSeat}</td>
                <td>
                  <select
                    value={d.status}
                    onChange={(e) => updateStatus(d.id, e.target.value)}
                    className={`clay-badge text-xs cursor-pointer border-0 ${statusColors[d.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button onClick={() => del(d.id)} className="text-clay-danger hover:bg-red-50 p-1 rounded">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-clay-muted">
        💡 Changing departure status automatically emails all approved passengers on that route.
      </p>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()} className="clay-card w-full max-w-lg">
            <h2 className="text-lg font-bold text-clay-text mb-4">Create Departure</h2>
            <form onSubmit={create} className="space-y-3">
              <input className="clay-input" placeholder="Route (e.g., GIKI → Islamabad)" value={form.route} onChange={(e) => update('route', e.target.value)} required />
              <div className="grid grid-cols-2 gap-3">
                <input className="clay-input" placeholder="From City" value={form.fromCity} onChange={(e) => update('fromCity', e.target.value)} required />
                <input className="clay-input" placeholder="To City" value={form.toCity} onChange={(e) => update('toCity', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="clay-input" value={form.departureDate} onChange={(e) => update('departureDate', e.target.value)} required />
                <input type="time" className="clay-input" value={form.departureTime} onChange={(e) => update('departureTime', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="clay-input" placeholder="Price (PKR)" value={form.pricePerSeat} onChange={(e) => update('pricePerSeat', e.target.value)} required />
                <select className="clay-input" value={form.vehicleType} onChange={(e) => update('vehicleType', e.target.value)}>
                  <option value="bus">🚌 Bus (45 seats)</option>
                  <option value="hiace">🚐 Hiace (custom seats)</option>
                </select>
              </div>
              {form.vehicleType === 'hiace' && (
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" className="clay-input" placeholder="Number of seats" value={form.seatCount} onChange={(e) => update('seatCount', parseInt(e.target.value) || 10)} min={5} max={30} />
                  <select className="clay-input" value={form.busType} onChange={(e) => update('busType', e.target.value)}>
                    <option value="standard">Standard</option>
                    <option value="ac">AC</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              )}
              {form.vehicleType === 'bus' && (
                <div className="grid grid-cols-2 gap-3">
                  <input className="clay-input" placeholder="45 seats (fixed)" value="45" disabled />
                  <select className="clay-input" value={form.busType} onChange={(e) => update('busType', e.target.value)}>
                    <option value="standard">Standard</option>
                    <option value="ac">AC</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="clay-btn-outline flex-1">Cancel</button>
                <button type="submit" className="clay-btn-primary flex-1">Create</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
