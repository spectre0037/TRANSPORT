import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const genderColors = {
  male: 'bg-blue-100 text-blue-700',
  female: 'bg-pink-100 text-pink-700',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/bookings').then((r) => setBookings(r.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status, paymentStatus = null) => {
    try {
      await api.put(`/api/bookings/${id}/status`, { status, paymentStatus, notes: status === 'approved' ? 'Payment verified by admin' : 'Payment screenshot not clear or invalid' });
      toast.success(`Booking ${status}`);
      setBookings((p) => p.map((b) => b.id === id ? { ...b, status } : b));
    } catch { toast.error('Failed'); }
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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clay-text">Bookings Management</h1>
        <p className="text-clay-muted text-sm">Review payment screenshots and approve/reject bookings</p>
      </div>

      <div className="overflow-x-auto">
        <table className="clay-table">
          <thead>
            <tr><th>Reference</th><th>Student</th><th>Route</th><th>Seat</th><th>Gender</th><th>Amount</th><th>Screenshot</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-clay-muted">No bookings yet</td></tr>
            ) : bookings.map((b) => (
              <tr key={b.id} className={b.status === 'pending_approval' ? 'bg-yellow-50/50' : ''}>
                <td className="font-mono text-xs">{b.bookingReference}</td>
                <td>
                  <div>
                    <p className="font-medium">{b.user?.fullName}</p>
                    <p className="text-xs text-clay-muted">{b.user?.email}</p>
                  </div>
                </td>
                <td>{b.departure?.route}</td>
                <td>{b.seat?.seatNumber}</td>
                <td>
                  <span className={`clay-badge ${genderColors[b.gender] || 'bg-gray-100 text-gray-700'}`}>
                    {b.gender === 'male' ? '👨 Male' : b.gender === 'female' ? '👩 Female' : '-'}
                  </span>
                </td>
                <td className="font-bold">PKR {b.totalAmount}</td>
                <td>
                  {b.paymentScreenshotUrl ? (
                    <a href={b.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer"
                      className="clay-btn-outline clay-btn-sm text-xs inline-flex items-center gap-1">
                      <Eye size={14} /> View
                    </a>
                  ) : b.status === 'approved' ? (
                    <span className="text-xs text-clay-success">Wallet</span>
                  ) : (
                    <span className="text-xs text-clay-muted">—</span>
                  )}
                </td>
                <td><span className={`clay-badge ${statusColor(b.status)}`}>{b.status?.replace('_', ' ')}</span></td>
                <td>
                  {b.status === 'pending_approval' && (
                    <div className="flex gap-1">
                      <button onClick={() => updateStatus(b.id, 'approved', 'verified')}
                        className="p-1.5 rounded text-green-600 hover:bg-green-50 border border-green-200" title="Approve">
                        <Check size={18} />
                      </button>
                      <button onClick={() => updateStatus(b.id, 'rejected')}
                        className="p-1.5 rounded text-red-600 hover:bg-red-50 border border-red-200" title="Reject">
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bookings.filter(b => b.status === 'pending_approval').length > 0 && (
        <p className="text-xs text-clay-muted">
          ⚡ {bookings.filter(b => b.status === 'pending_approval').length} booking(s) pending review. Click <strong>View</strong> to see the payment screenshot.
        </p>
      )}
    </div>
  );
}
