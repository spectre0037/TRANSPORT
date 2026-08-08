import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, Calendar, Clock, Ticket, X, Download } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';
import TicketCard from '../../components/TicketCard';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [historyBookings, setHistoryBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketBooking, setTicketBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'history'

  useEffect(() => {
    // Fetch upcoming bookings
    api.get('/api/bookings/my')
      .then((r) => setBookings(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch booking history
    api.get('/api/bookings/my/history')
      .then((r) => setHistoryBookings(r.data))
      .catch(console.error);
  }, []);

  const cancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.post(`/api/bookings/${id}/cancel`);
      toast.success('Booking cancelled, refund credited!');
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cancel failed');
    }
  };

  const statusColor = (s) => {
    switch (s) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const departureStatusColor = (s) => {
    switch (s) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'valid': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'dropped': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const genderBadge = (g) => {
    if (g === 'male') return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">👨 Male</span>;
    if (g === 'female') return <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-medium">👩 Female</span>;
    return null;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;

  const currentBookings = activeTab === 'upcoming' ? bookings : historyBookings;

  return (
    <><div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clay-text sm:text-3xl">My Bookings</h1>
        <p className="text-clay-muted text-sm">Manage your transport bookings</p>
      </div>

      {/* Tab Navigation */}
      <div className="clay-card p-1 flex flex-col gap-1 sm:flex-row">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 px-4 py-2 rounded-clay font-medium transition-all ${
            activeTab === 'upcoming'
              ? 'bg-clay-primary text-white shadow-clay'
              : 'text-clay-muted hover:text-clay-text'
          }`}
        >
          Upcoming Bookings {bookings.length > 0 && `(${bookings.length})`}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2 rounded-clay font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-clay-primary text-white shadow-clay'
              : 'text-clay-muted hover:text-clay-text'
          }`}
        >
          Booking History {historyBookings.length > 0 && `(${historyBookings.length})`}
        </button>
      </div>

      {currentBookings.length === 0 ? (
        <div className="clay-card text-center py-12">
          <Ticket className="mx-auto text-clay-muted mb-3" size={40} />
          <p className="text-clay-muted">
            {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No booking history yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentBookings.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="clay-card relative overflow-hidden">
              {b.gender === 'male' && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>}
              {b.gender === 'female' && <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500"></div>}
              <div className="flex flex-col gap-4 pl-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                  <div className="w-12 h-12 bg-clay-primary/10 rounded-clay flex items-center justify-center">
                    <Bus className="text-clay-primary" size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-clay-text">{b.departure?.route}</h3>
                      {b.status === 'approved' && b.departure?.status && (
                        <span className={`clay-badge text-[10px] ${departureStatusColor(b.departure.status)}`}>
                          {b.departure.status}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-clay-muted">
                      <span className="flex items-center gap-1"><Calendar size={12} />{b.departure?.departureDate ? new Date(b.departure.departureDate).toLocaleDateString() : ''}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{b.departure?.departureTime}</span>
                      <span>Seat {b.seat?.seatNumber}</span>
                      {genderBadge(b.gender)}
                      <span className="font-semibold text-clay-text">Ref: {b.bookingReference}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`clay-badge ${statusColor(b.status)}`}>{b.status?.replace('_', ' ')}</span>
                  <span className="font-bold text-clay-primary">PKR {b.totalAmount}</span>
                </div>
              </div>
              {activeTab === 'upcoming' && b.status === 'pending_approval' && (
                <div className="mt-4 pt-4 border-t border-clay-border flex flex-col gap-2 sm:flex-row">
                  <button onClick={() => cancelBooking(b.id)}
                    className="clay-btn-danger clay-btn-sm flex items-center gap-1">
                    <X size={14} /> Cancel Booking
                  </button>
                </div>
              )}
              {b.status === 'approved' && b.departure?.status === 'confirmed' && (
                <div className="mt-4 pt-4 border-t border-clay-border">
                  <button onClick={() => setTicketBooking(b)}
                    className="clay-btn-primary clay-btn-sm flex items-center gap-1">
                    <Download size={14} /> Download Ticket
                  </button>
                </div>
              )}
              {b.status === 'rejected' && b.notes && (
                <div className="mt-2 pt-2 border-t border-clay-border">
                  <p className="text-xs text-clay-danger"><strong>Reason:</strong> {b.notes}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
</div>

      {/* Ticket Modal */}
      {ticketBooking && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 overflow-y-auto"
             onClick={() => setTicketBooking(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md py-8">
            <TicketCard
              booking={ticketBooking}
              passengerName={useAuthStore.getState().user?.fullName}
              onClose={() => setTicketBooking(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
