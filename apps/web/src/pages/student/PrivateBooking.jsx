import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Wallet, Send, Car, Loader, Phone, History, Eye } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const VEHICLE_OPTIONS = [
  { value: 'car', label: '🚗 Car', sub: '5-seater', seats: 5 },
  { value: 'hiace', label: '🚐 Hiace', sub: '17-seater', seats: 17 },
  { value: 'coaster', label: '🚌 Coaster', sub: '32-seater', seats: 32 },
  { value: 'bus', label: '🚌 Bus', sub: '45-seater', seats: 45 },
];

const VEHICLE_LABELS = {
  car: '🚗 Car (5-seater)', hiace: '🚐 Hiace (17-seater)',
  coaster: '🚌 Coaster (32-seater)', bus: '🚌 Bus (45-seater)',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function PrivateBooking() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.fullName || '',
    phone: user?.phone || '',
    vehicleType: '',
    departureLocation: '',
    arrivalLocation: '',
    date: '',
    time: '',
    tripType: 'one-way',
    duration: '',
    budget: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    api.get('/api/private-bookings/my')
      .then((r) => setMyRequests(r.data))
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
  }, []);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicleType) return toast.error('Please select a vehicle type');
    if (form.tripType === 'return' && !form.duration) return toast.error('Please enter the stay duration for a return trip');
    if (parseFloat(form.budget) <= 0) return toast.error('Please enter a valid budget');
    if (!form.phone) return toast.error('Please enter your phone number');

    setSubmitting(true);
    try {
      await api.post('/api/private-bookings', form);
      toast.success('Your private booking request has been submitted! Admin will review it shortly.');
      setForm((p) => ({ ...p, vehicleType: '', departureLocation: '', arrivalLocation: '', date: '', time: '', tripType: 'one-way', duration: '', budget: '' }));
      const res = await api.get('/api/private-bookings/my');
      setMyRequests(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-3 pb-24 sm:space-y-6 sm:px-0 sm:pb-6">
      <div className="pt-1 px-1 sm:px-0">
        <h1 className="text-lg font-bold text-clay-text sm:text-2xl md:text-3xl">Private Booking</h1>
        <p className="text-clay-muted text-xs sm:text-sm">Request a custom vehicle for your trip</p>
      </div>

      {/* Form */}
      <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="clay-card space-y-4 p-3.5 sm:space-y-5 sm:p-6">

        {/* Name & Phone — side by side always */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          <div>
            <label className="text-xs font-semibold text-clay-text mb-1 block sm:text-sm">Name *</label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
              className="clay-input w-full text-sm py-2 px-2.5 sm:text-base sm:py-2.5 sm:px-3" placeholder="Your name" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-clay-text mb-1 block sm:text-sm">Phone *</label>
            <div className="relative">
              <Phone className="absolute left-2 top-1/2 -translate-y-1/2 text-clay-muted sm:left-3" size={14} />
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                className="clay-input w-full text-sm py-2 pl-7 pr-2 sm:text-base sm:py-2.5 sm:pl-10 sm:pr-3" placeholder="+92300..." required />
            </div>
          </div>
        </div>

        {/* Vehicle Type — 2x2 grid always, compact cards */}
        <div>
          <label className="text-xs font-semibold text-clay-text mb-1.5 block sm:text-sm">Vehicle Type *</label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {VEHICLE_OPTIONS.map((v) => (
              <button key={v.value} type="button" onClick={() => update('vehicleType', v.value)}
                className={`min-h-[52px] rounded-clay border-2 px-2.5 py-2 text-left transition-all active:scale-[0.97] sm:min-h-[64px] sm:rounded-clay-lg sm:p-4 ${
                  form.vehicleType === v.value
                    ? 'border-clay-primary bg-clay-primary/5 shadow-clay'
                    : 'border-clay-border bg-white hover:border-clay-primary/50'
                }`}>
                <p className="font-bold text-clay-text text-xs sm:text-sm">{v.label}</p>
                <p className="text-[10px] text-clay-muted mt-0.5 sm:text-xs">{v.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Departure & Arrival — side by side always */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          <div>
            <label className="text-xs font-semibold text-clay-text mb-1 block sm:text-sm">From *</label>
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 text-clay-muted sm:left-3" size={14} />
              <input type="text" value={form.departureLocation} onChange={(e) => update('departureLocation', e.target.value)}
                className="clay-input w-full text-sm py-2 pl-7 pr-2 sm:text-base sm:py-2.5 sm:pl-10 sm:pr-3" placeholder="GIKI, Swabi" required />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-clay-text mb-1 block sm:text-sm">To *</label>
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 text-clay-muted sm:left-3" size={14} />
              <input type="text" value={form.arrivalLocation} onChange={(e) => update('arrivalLocation', e.target.value)}
                className="clay-input w-full text-sm py-2 pl-7 pr-2 sm:text-base sm:py-2.5 sm:pl-10 sm:pr-3" placeholder="Lahore" required />
            </div>
          </div>
        </div>

        {/* Date & Time — side by side always */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          <div>
            <label className="text-xs font-semibold text-clay-text mb-1 block sm:text-sm">Date *</label>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-clay-muted sm:left-3" size={14} />
              <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)}
                className="clay-input w-full text-sm py-2 pl-7 pr-1 sm:text-base sm:py-2.5 sm:pl-10 sm:pr-3" required />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-clay-text mb-1 block sm:text-sm">Time *</label>
            <div className="relative">
              <Clock className="absolute left-2 top-1/2 -translate-y-1/2 text-clay-muted sm:left-3" size={14} />
              <input type="time" value={form.time} onChange={(e) => update('time', e.target.value)}
                className="clay-input w-full text-sm py-2 pl-7 pr-1 sm:text-base sm:py-2.5 sm:pl-10 sm:pr-3" required />
            </div>
          </div>
        </div>

        {/* Trip Type & Duration — side by side; duration slides in next to it */}
        <div className={`grid gap-2.5 sm:gap-4 ${form.tripType === 'return' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <label className="text-xs font-semibold text-clay-text mb-1.5 block sm:text-sm">Trip Type *</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button type="button" onClick={() => { update('tripType', 'one-way'); update('duration', ''); }}
                className={`min-h-[40px] rounded-clay text-xs font-bold transition-all active:scale-[0.97] sm:min-h-[48px] sm:text-sm ${
                  form.tripType === 'one-way'
                    ? 'bg-clay-primary text-white shadow-clay'
                    : 'bg-white border-2 border-clay-border text-clay-text hover:border-clay-primary'
                }`}>
                ➡️ One-way
              </button>
              <button type="button" onClick={() => update('tripType', 'return')}
                className={`min-h-[40px] rounded-clay text-xs font-bold transition-all active:scale-[0.97] sm:min-h-[48px] sm:text-sm ${
                  form.tripType === 'return'
                    ? 'bg-clay-primary text-white shadow-clay'
                    : 'bg-white border-2 border-clay-border text-clay-text hover:border-clay-primary'
                }`}>
                🔄 Return
              </button>
            </div>
          </div>

          {form.tripType === 'return' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
              <label className="text-xs font-semibold text-clay-text mb-1.5 block sm:text-sm">Duration of Stay *</label>
              <div className="relative">
                <Clock className="absolute left-2 top-1/2 -translate-y-1/2 text-clay-muted sm:left-3" size={14} />
                <input type="text" value={form.duration} onChange={(e) => update('duration', e.target.value)}
                  className="clay-input w-full text-sm py-2 pl-7 pr-2 sm:text-base sm:py-2.5 sm:pl-10 sm:pr-3" placeholder="e.g., 3 days" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Budget */}
        <div>
          <label className="text-xs font-semibold text-clay-text mb-1 block sm:text-sm">Desired Budget (PKR) *</label>
          <div className="relative">
            <Wallet className="absolute left-2 top-1/2 -translate-y-1/2 text-clay-muted sm:left-3" size={14} />
            <input type="number" value={form.budget} onChange={(e) => update('budget', e.target.value)}
              className="clay-input w-full text-sm py-2 pl-7 pr-2 sm:text-base sm:py-2.5 sm:pl-10 sm:pr-3" placeholder="e.g., 15000" min={1} required />
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="clay-btn-primary w-full min-h-[46px] flex items-center justify-center gap-2 text-sm sm:min-h-[52px] sm:text-base disabled:opacity-50">
          {submitting ? <><Loader size={15} className="animate-spin" /> Submitting...</> : <><Send size={15} /> Submit Private Booking Request</>}
        </button>
      </motion.form>

      {/* My Previous Requests */}
      <div className="clay-card p-3.5 sm:p-6">
        <h2 className="font-bold text-clay-text mb-3 flex items-center gap-2 text-sm sm:mb-4 sm:text-lg">
          <History size={16} /> My Previous Requests
        </h2>
        {loadingRequests ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin w-6 h-6 border-4 border-clay-primary border-t-transparent rounded-full"></div>
          </div>
        ) : myRequests.length === 0 ? (
          <p className="text-clay-muted text-xs text-center py-4 sm:text-sm">You haven't made any private booking requests yet.</p>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {myRequests.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between gap-2 p-2.5 rounded-clay bg-clay-bg/50 sm:gap-3 sm:p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="font-semibold text-clay-text text-xs sm:text-sm">{VEHICLE_LABELS[r.vehicleType] || r.vehicleType}</span>
                    <span className={`clay-badge text-[9px] sm:text-[10px] ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-clay-muted break-words sm:text-xs">
                    {r.departureLocation} → {r.arrivalLocation} • {new Date(r.date).toLocaleDateString()} • {r.time}
                  </p>
                  {r.adminNotes && (
                    <p className="text-[11px] text-clay-muted italic mt-0.5 break-words sm:text-xs">Note: {r.adminNotes}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-clay-primary sm:text-sm">PKR {parseFloat(r.budget).toLocaleString()}</p>
                  <p className="text-[9px] text-clay-muted sm:text-[10px]">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}