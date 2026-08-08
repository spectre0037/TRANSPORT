import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Wallet, Send, Car, Loader, Phone, History, Eye } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const VEHICLE_OPTIONS = [
  { value: 'car', label: '🚗 Car (5-seater)', seats: 5 },
  { value: 'hiace', label: '🚐 Hiace (17-seater)', seats: 17 },
  { value: 'coaster', label: '🚌 Coaster (32-seater)', seats: 32 },
  { value: 'bus', label: '🚌 Bus (45-seater)', seats: 45 },
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
      // Reset form but keep name/phone
      setForm((p) => ({ ...p, vehicleType: '', departureLocation: '', arrivalLocation: '', date: '', time: '', tripType: 'one-way', duration: '', budget: '' }));
      // Refresh requests
      const res = await api.get('/api/private-bookings/my');
      setMyRequests(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-0 sm:px-0">
      <div>
        <h1 className="text-2xl font-bold text-clay-text sm:text-3xl">Private Booking</h1>
        <p className="text-clay-muted text-sm">Request a custom vehicle for your trip</p>
      </div>

      {/* Form */}
      <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="clay-card space-y-5">

        {/* Name */}
        <div>
          <label className="text-sm font-semibold text-clay-text mb-1 block">Your Name *</label>
          <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
            className="clay-input" placeholder="Enter your name" required />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-semibold text-clay-text mb-1 block">Phone Number *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
            <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
              className="clay-input pl-10" placeholder="+923001234567" required />
          </div>
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="text-sm font-semibold text-clay-text mb-1 block">Vehicle Type *</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {VEHICLE_OPTIONS.map((v) => (
              <button key={v.value} type="button" onClick={() => update('vehicleType', v.value)}
                className={`p-4 rounded-clay-lg border-2 text-left transition-all ${
                  form.vehicleType === v.value
                    ? 'border-clay-primary bg-clay-primary/5 shadow-clay'
                    : 'border-clay-border bg-white hover:border-clay-primary/50'
                }`}>
                <p className="font-bold text-clay-text text-sm">{v.label}</p>
                <p className="text-xs text-clay-muted mt-0.5">{v.seats} seats</p>
              </button>
            ))}
          </div>
        </div>

        {/* Departure & Arrival */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-clay-text mb-1 block">Departure Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
              <input type="text" value={form.departureLocation} onChange={(e) => update('departureLocation', e.target.value)}
                className="clay-input pl-10" placeholder="e.g., GIKI, Swabi" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-clay-text mb-1 block">Arrival Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
              <input type="text" value={form.arrivalLocation} onChange={(e) => update('arrivalLocation', e.target.value)}
                className="clay-input pl-10" placeholder="e.g., Lahore" required />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-clay-text mb-1 block">Date *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
              <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)}
                className="clay-input pl-10" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-clay-text mb-1 block">Time *</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
              <input type="time" value={form.time} onChange={(e) => update('time', e.target.value)}
                className="clay-input pl-10" required />
            </div>
          </div>
        </div>

        {/* Trip Type */}
        <div>
          <label className="text-sm font-semibold text-clay-text mb-1 block">Trip Type *</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => { update('tripType', 'one-way'); update('duration', ''); }}
              className={`flex-1 py-3 rounded-clay font-bold text-sm transition-all ${
                form.tripType === 'one-way'
                  ? 'bg-clay-primary text-white shadow-clay'
                  : 'bg-white border-2 border-clay-border text-clay-text hover:border-clay-primary'
              }`}>
              ➡️ One-way
            </button>
            <button type="button" onClick={() => update('tripType', 'return')}
              className={`flex-1 py-3 rounded-clay font-bold text-sm transition-all ${
                form.tripType === 'return'
                  ? 'bg-clay-primary text-white shadow-clay'
                  : 'bg-white border-2 border-clay-border text-clay-text hover:border-clay-primary'
              }`}>
              🔄 Return
            </button>
          </div>
        </div>

        {/* Duration (shown only for return) */}
        {form.tripType === 'return' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <label className="text-sm font-semibold text-clay-text mb-1 block">Duration of Stay *</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
              <input type="text" value={form.duration} onChange={(e) => update('duration', e.target.value)}
                className="clay-input pl-10" placeholder="e.g., 3 days, 1 week" />
            </div>
          </motion.div>
        )}

        {/* Budget */}
        <div>
          <label className="text-sm font-semibold text-clay-text mb-1 block">Desired Budget (PKR) *</label>
          <div className="relative">
            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
            <input type="number" value={form.budget} onChange={(e) => update('budget', e.target.value)}
              className="clay-input pl-10" placeholder="e.g., 15000" min={1} required />
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="clay-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
          {submitting ? <><Loader size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Private Booking Request</>}
        </button>
      </motion.form>

      {/* My Previous Requests */}
      <div className="clay-card">
        <h2 className="font-bold text-clay-text mb-4 flex items-center gap-2">
          <History size={18} /> My Previous Requests
        </h2>
        {loadingRequests ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin w-6 h-6 border-4 border-clay-primary border-t-transparent rounded-full"></div>
          </div>
        ) : myRequests.length === 0 ? (
          <p className="text-clay-muted text-sm text-center py-4">You haven't made any private booking requests yet.</p>
        ) : (
          <div className="space-y-3">
            {myRequests.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between p-3 rounded-clay bg-clay-bg/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-clay-text text-sm">{VEHICLE_LABELS[r.vehicleType] || r.vehicleType}</span>
                    <span className={`clay-badge text-[10px] ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-clay-muted">
                    {r.departureLocation} → {r.arrivalLocation} • {new Date(r.date).toLocaleDateString()} • {r.time}
                  </p>
                  {r.adminNotes && (
                    <p className="text-xs text-clay-muted italic mt-0.5">Admin note: {r.adminNotes}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-bold text-clay-primary">PKR {parseFloat(r.budget).toLocaleString()}</p>
                  <p className="text-[10px] text-clay-muted">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
