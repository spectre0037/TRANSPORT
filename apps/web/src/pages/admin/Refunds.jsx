import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/refunds').then((r) => setRefunds(r.data)).finally(() => setLoading(false));
  }, []);

  const process = async (id, status) => {
    const notes = prompt('Admin notes (optional):') || '';
    try {
      await api.put(`/api/refunds/${id}/process`, { status, adminNotes: notes });
      toast.success(`Refund ${status}`);
      setRefunds((p) => p.map((r) => r.id === id ? { ...r, status } : r));
    } catch { toast.error('Failed'); }
  };

  const statusColor = (s) => {
    switch (s) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clay-text">Refund Requests</h1>
        <p className="text-clay-muted text-sm">Process refund requests from students</p>
      </div>

      <div className="overflow-x-auto">
        <table className="clay-table">
          <thead>
            <tr><th>Student</th><th>Booking Ref</th><th>Route</th><th>Amount</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {refunds.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-clay-muted py-8">No refund requests</td></tr>
            ) : refunds.map((r) => (
              <tr key={r.id}>
                <td>
                  <div>
                    <p className="font-medium">{r.user?.fullName}</p>
                    <p className="text-xs text-clay-muted">{r.user?.email}</p>
                  </div>
                </td>
                <td className="font-mono text-xs">{r.booking?.bookingReference}</td>
                <td>{r.booking?.departure?.route}</td>
                <td className="font-bold">PKR {r.amount}</td>
                <td className="text-sm max-w-[200px] truncate">{r.reason || '-'}</td>
                <td><span className={`clay-badge ${statusColor(r.status)}`}>{r.status}</span></td>
                <td>
                  {r.status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => process(r.id, 'approved')}
                        className="text-clay-success hover:bg-green-50 p-1 rounded" title="Approve">
                        <Check size={16} />
                      </button>
                      <button onClick={() => process(r.id, 'rejected')}
                        className="text-clay-danger hover:bg-red-50 p-1 rounded" title="Reject">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
