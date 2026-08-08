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
    <div className="space-y-5 px-3 pb-24 sm:space-y-6 sm:px-0 sm:pb-6">
      <div className="flex flex-col gap-3 pt-1 px-1 sm:flex-row sm:items-center sm:justify-between sm:px-0">
        <div>
          <h1 className="text-lg font-bold text-clay-text sm:text-2xl md:text-3xl">Departures</h1>
          <p className="text-clay-muted text-xs sm:text-sm">Manage transport routes and set status</p>
        </div>
        <button onClick={() => setShowModal(true)} className="clay-btn-primary flex items-center justify-center gap-2 w-full min-h-[44px] text-sm sm:w-auto sm:text-base">
          <Plus size={17} /> Create Departure
        </button>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2.5 md:hidden">
        {departures.length === 0 ? (
          <div className="clay-card text-center py-8 text-clay-muted text-sm">No departures yet</div>
        ) : departures.map((d) => (
          <div key={d.id} className="clay-card space-y-2.5 p-3.5">
            <div className="flex items-center justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-clay-text text-sm truncate">{d.route}</p>
                <p className="text-[11px] text-clay-muted truncate">{d.fromCity} → {d.toCity}</p>
              </div>
              <span className={`clay-badge text-[10px] flex-shrink-0 ${(d.busType||'bus') === 'hiace' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                {(d.busType||'bus') === 'hiace' ? '🚐 Hiace' : '🚌 Bus'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              <div><p className="text-[9px] text-clay-muted">Date</p><p className="font-medium text-[11px] truncate">{new Date(d.departureDate).toLocaleDateString()}</p></div>
              <div><p className="text-[9px] text-clay-muted">Time</p><p className="font-medium text-[11px]">{d.departureTime}</p></div>
              <div><p className="text-[9px] text-clay-muted">Seats</p><p className="font-medium text-[11px]">{d.totalSeats}</p></div>
              <div><p className="text-[9px] text-clay-muted">Price</p><p className="font-bold text-clay-primary text-[11px]">PKR {d.pricePerSeat}</p></div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <select value={d.status} onChange={(e) => updateStatus(d.id, e.target.value)} className={`clay-badge text-[11px] cursor-pointer border-0 ${statusColors[d.status] || 'bg-gray-100 text-gray-700'}`}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => del(d.id)} className="text-clay-danger hover:bg-red-50 p-2 rounded flex-shrink-0"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
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

      <p className="text-[11px] text-clay-muted px-1 sm:text-xs sm:px-0">
        💡 Changing departure status automatically emails all approved passengers on that route.
      </p>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-3 sm:p-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()} className="clay-card w-full max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6">
            <h2 className="text-base font-bold text-clay-text mb-3.5 sm:text-lg sm:mb-4">Create Departure</h2>
            <form onSubmit={create} className="space-y-2.5 sm:space-y-3">
              <input className="clay-input w-full text-sm py-2 px-2.5 sm:text-base sm:py-2.5 sm:px-3" placeholder="Route (e.g., GIKI → Islamabad)" value={form.route} onChange={(e) => update('route', e.target.value)} required />

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <input className="clay-input w-full text-sm py-2 px-2.5 sm:text-base sm:py-2.5 sm:px-3" placeholder="From City" value={form.fromCity} onChange={(e) => update('fromCity', e.target.value)} required />
                <input className="clay-input w-full text-sm py-2 px-2.5 sm:text-base sm:py-2.5 sm:px-3" placeholder="To City" value={form.toCity} onChange={(e) => update('toCity', e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <input type="date" className="clay-input w-full text-sm py-2 px-2 sm:text-base sm:py-2.5 sm:px-3" value={form.departureDate} onChange={(e) => update('departureDate', e.target.value)} required />
                <input type="time" className="clay-input w-full text-sm py-2 px-2 sm:text-base sm:py-2.5 sm:px-3" value={form.departureTime} onChange={(e) => update('departureTime', e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <input type="number" className="clay-input w-full text-sm py-2 px-2.5 sm:text-base sm:py-2.5 sm:px-3" placeholder="Price (PKR)" value={form.pricePerSeat} onChange={(e) => update('pricePerSeat', e.target.value)} required />
                <select className="clay-input w-full text-sm py-2 px-2.5 sm:text-base sm:py-2.5 sm:px-3" value={form.vehicleType} onChange={(e) => update('vehicleType', e.target.value)}>
                  <option value="bus">🚌 Bus (45 seats)</option>
                  <option value="hiace">🚐 Hiace (custom seats)</option>
                </select>
              </div>

              {form.vehicleType === 'hiace' && (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <input type="number" className="clay-input w-full text-sm py-2 px-2.5 sm:text-base sm:py-2.5 sm:px-3" placeholder="Number of seats" value={form.seatCount} onChange={(e) => update('seatCount', parseInt(e.target.value) || 10)} min={5} max={30} />
                  <select className="clay-input w-full text-sm py-2 px-2.5 sm:text-base sm:py-2.5 sm:px-3" value={form.busType} onChange={(e) => update('busType', e.target.value)}>
                    <option value="standard">Standard</option>
                    <option value="ac">AC</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              )}
              {form.vehicleType === 'bus' && (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <input className="clay-input w-full text-sm py-2 px-2.5 text-clay-muted sm:text-base sm:py-2.5 sm:px-3" placeholder="45 seats (fixed)" value="45" disabled />
                  <select className="clay-input w-full text-sm py-2 px-2.5 sm:text-base sm:py-2.5 sm:px-3" value={form.busType} onChange={(e) => update('busType', e.target.value)}>
                    <option value="standard">Standard</option>
                    <option value="ac">AC</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2.5 pt-2 sm:gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="clay-btn-outline flex-1 min-h-[44px] text-sm sm:text-base">Cancel</button>
                <button type="submit" className="clay-btn-primary flex-1 min-h-[44px] text-sm sm:text-base">Create</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}