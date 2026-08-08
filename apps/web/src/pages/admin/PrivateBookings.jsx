import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, MapPin, Calendar, Clock, Wallet, Trash2, Car, ArrowLeftRight, Phone, Eye, X, Check, Loader } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const VEHICLE_LABELS = {
  car: '🚗 Car (5-seater)', hiace: '🚐 Hiace (17-seater)',
  coaster: '🚌 Coaster (32-seater)', bus: '🚌 Bus (45-seater)',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminPrivateBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    api.get('/api/private-bookings')
      .then((r) => setBookings(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this private booking request?')) return;
    try {
      await api.delete(`/api/private-bookings/${id}`);
      toast.success('Deleted');
      setBookings((p) => p.filter((b) => b.id !== id));
      if (viewingBooking?.id === id) setViewingBooking(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleStatusUpdate = async (status) => {
    setUpdatingStatus(true);
    try {
      const notes = status === 'rejected' ? (prompt('Rejection reason (optional):') || '') : '';
      const { data } = await api.put(`/api/private-bookings/${viewingBooking.id}/status`, { status, adminNotes: notes });
      toast.success(`Request ${status}`);
      setViewingBooking(data);
      setBookings((p) => p.map((b) => b.id === data.id ? data : b));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
    setUpdatingStatus(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clay-text sm:text-3xl">Private Bookings</h1>
        <p className="text-clay-muted text-sm">Custom vehicle booking requests from students</p>
      </div>

      {bookings.length === 0 ? (
        <div className="clay-card text-center py-12">
          <Car className="mx-auto text-clay-muted mb-3" size={40} />
          <p className="text-clay-muted">No private booking requests yet</p>
        </div>
      ) : (
        <>
        <div className="space-y-3 md:hidden">
          {bookings.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="clay-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-clay-text">{b.name}</p>
                  <p className="text-xs text-clay-muted">{b.departureLocation} → {b.arrivalLocation}</p>
                </div>
                <span className={`clay-badge ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>{b.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-clay-muted">Vehicle</p><p>{VEHICLE_LABELS[b.vehicleType] || b.vehicleType}</p></div>
                <div><p className="text-xs text-clay-muted">Trip</p><p>{b.tripType === 'return' ? 'Return' : 'One-way'}</p></div>
                <div><p className="text-xs text-clay-muted">Date</p><p>{new Date(b.date).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-clay-muted">Time</p><p>{b.time}</p></div>
                <div><p className="text-xs text-clay-muted">Budget</p><p className="font-bold text-clay-primary">PKR {parseFloat(b.budget).toLocaleString()}</p></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setViewingBooking(b)} className="clay-btn-outline clay-btn-sm flex-1 text-xs">View</button>
                <button onClick={() => handleDelete(b.id)} className="clay-btn-danger clay-btn-sm flex-1 text-xs">Delete</button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="clay-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Vehicle</th>
                <th>From → To</th>
                <th>Date</th>
                <th>Time</th>
                <th>Trip</th>
                <th>Budget</th>
                <th>Status</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td className="font-semibold">{b.name}</td>
                  <td>
                    <span className="clay-badge text-xs bg-purple-100 text-purple-700">
                      {VEHICLE_LABELS[b.vehicleType] || b.vehicleType}
                    </span>
                  </td>
                  <td>
                    <span className="flex items-center gap-1 text-sm">
                      {b.departureLocation} <ArrowLeftRight size={12} className="text-clay-muted" /> {b.arrivalLocation}
                    </span>
                  </td>
                  <td className="text-sm">{new Date(b.date).toLocaleDateString()}</td>
                  <td className="text-sm">{b.time}</td>
                  <td>
                    <span className={`clay-badge text-xs ${b.tripType === 'return' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {b.tripType === 'return' ? '🔄 Return' : '➡️ One-way'}
                    </span>
                  </td>
                  <td className="font-bold text-clay-primary">PKR {parseFloat(b.budget).toLocaleString()}</td>
                  <td>
                    <span className={`clay-badge ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setViewingBooking(b)}
                        className="text-clay-info hover:bg-blue-50 p-1.5 rounded transition-colors" title="View details">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleDelete(b.id)}
                        className="text-clay-danger hover:bg-red-50 p-1.5 rounded transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Detail Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
             onClick={() => setViewingBooking(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="clay-card w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-clay-text">Request Details</h2>
              <button onClick={() => setViewingBooking(null)} className="text-clay-muted hover:text-clay-text">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`clay-badge text-sm ${statusColors[viewingBooking.status] || 'bg-gray-100 text-gray-700'}`}>
                  {viewingBooking.status.charAt(0).toUpperCase() + viewingBooking.status.slice(1)}
                </span>
                <span className="text-xs text-clay-muted">{new Date(viewingBooking.createdAt).toLocaleString()}</span>
              </div>

              <div className="border-t border-clay-border pt-4 space-y-3">
                <DetailRow icon={<Phone size={16} />} label="Name" value={viewingBooking.name} />
                <DetailRow icon={<Phone size={16} />} label="Phone" value={viewingBooking.phone || '—'} />
                <DetailRow icon={<Car size={16} />} label="Vehicle" value={VEHICLE_LABELS[viewingBooking.vehicleType] || viewingBooking.vehicleType} />
                <DetailRow icon={<MapPin size={16} />} label="From" value={viewingBooking.departureLocation} />
                <DetailRow icon={<MapPin size={16} />} label="To" value={viewingBooking.arrivalLocation} />
                <DetailRow icon={<Calendar size={16} />} label="Date" value={new Date(viewingBooking.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} />
                <DetailRow icon={<Clock size={16} />} label="Time" value={viewingBooking.time} />
                <DetailRow icon={<ArrowLeftRight size={16} />} label="Trip Type" value={viewingBooking.tripType === 'return' ? '🔄 Return' : '➡️ One-way'} />
                {viewingBooking.duration && (
                  <DetailRow icon={<Clock size={16} />} label="Stay Duration" value={viewingBooking.duration} />
                )}
                <DetailRow icon={<Wallet size={16} />} label="Budget" value={`PKR ${parseFloat(viewingBooking.budget).toLocaleString()}`} />
              </div>

              {/* Admin Notes */}
              {viewingBooking.adminNotes && (
                <div className="bg-clay-bg rounded-clay p-3">
                  <p className="text-xs font-semibold text-clay-muted mb-1">Admin Notes</p>
                  <p className="text-sm text-clay-text">{viewingBooking.adminNotes}</p>
                </div>
              )}

              {/* Status Actions */}
              {viewingBooking.status === 'pending' && (
                <div className="border-t border-clay-border pt-4 space-y-3">
                  <p className="text-sm font-semibold text-clay-text">Update Status</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleStatusUpdate('approved')} disabled={updatingStatus}
                      className="clay-btn-success flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                      {updatingStatus ? <Loader size={14} className="animate-spin" /> : <Check size={16} />}
                      Approve
                    </button>
                    <button onClick={() => handleStatusUpdate('rejected')} disabled={updatingStatus}
                      className="clay-btn-danger flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                      {updatingStatus ? <Loader size={14} className="animate-spin" /> : <X size={16} />}
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-clay-bg flex items-center justify-center text-clay-muted flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-clay-muted">{label}</p>
        <p className="text-sm font-semibold text-clay-text">{value}</p>
      </div>
    </div>
  );
}
