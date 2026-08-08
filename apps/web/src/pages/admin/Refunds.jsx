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
        <h1 className="text-2xl font-bold text-clay-text sm:text-3xl">Refund Requests</h1>
        <p className="text-clay-muted text-sm">Process refund requests from students</p>
      </div>

      <div className="space-y-3 md:hidden">
        {refunds.length === 0 ? (
          <div className="clay-card text-center py-8 text-clay-muted">No refund requests</div>
        ) : refunds.map((r) => (
          <div key={r.id} className="clay-card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-clay-text">{r.user?.fullName}</p>
                <p className="text-xs text-clay-muted break-all">{r.user?.email}</p>
              </div>
              <span className={`clay-badge ${statusColor(r.status)}`}>{r.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-clay-muted">Booking</p><p className="font-mono text-xs">{r.booking?.bookingReference}</p></div>
              <div><p className="text-xs text-clay-muted">Amount</p><p className="font-bold text-clay-primary">PKR {r.amount}</p></div>
              <div className="col-span-2"><p className="text-xs text-clay-muted">Route</p><p>{r.booking?.departure?.route}</p></div>
              <div className="col-span-2"><p className="text-xs text-clay-muted">Reason</p><p className="text-sm">{r.reason || '-'}</p></div>
            </div>
            {r.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => process(r.id, 'approved')} className="clay-btn-success clay-btn-sm flex-1">Approve</button>
                <button onClick={() => process(r.id, 'rejected')} className="clay-btn-danger clay-btn-sm flex-1">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
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
