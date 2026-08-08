import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, Loader } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminTopups() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    api.get('/api/wallet/topup').then((r) => setRequests(r.data)).finally(() => setLoading(false));
  }, []);

  const processRequest = async (id, status, amount) => {
    if (status === 'approved') {
      const amt = prompt(`Enter top-up amount (or confirm: PKR ${amount}):`);
      if (amt === null) return;
      amount = parseFloat(amt) || parseFloat(amount);
      if (amount <= 0) return toast.error('Invalid amount');
    }

    const notes = status === 'rejected' ? (prompt('Rejection reason (optional):') || '') : '';
    setProcessing(id);
    try {
      await api.put(`/api/wallet/topup/${id}/process`, { status, amount, adminNotes: notes });
      toast.success(status === 'approved' ? `Wallet topped up with PKR ${amount}` : 'Request rejected');
      setRequests((p) => p.map((r) => r.id === id ? { ...r, status } : r));
    } catch { toast.error('Failed'); }
    setProcessing(null);
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
        <h1 className="text-2xl font-bold text-clay-text">Wallet Top-up Requests</h1>
        <p className="text-clay-muted text-sm">Review payment screenshots and approve/reject top-up requests</p>
      </div>

      <div className="overflow-x-auto">
        <table className="clay-table">
          <thead>
            <tr><th>Student</th><th>Amount</th><th>Screenshot</th><th>Date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-clay-muted">No top-up requests</td></tr>
            ) : requests.map((r) => (
              <tr key={r.id} className={r.status === 'pending' ? 'bg-yellow-50/50' : ''}>
                <td>
                  <div>
                    <p className="font-medium">{r.user?.fullName}</p>
                    <p className="text-xs text-clay-muted">{r.user?.email}</p>
                  </div>
                </td>
                <td className="font-bold">PKR {r.amount}</td>
                <td>
                  {r.screenshotUrl ? (
                    <a href={r.screenshotUrl} target="_blank" rel="noopener noreferrer"
                      className="clay-btn-outline clay-btn-sm text-xs inline-flex items-center gap-1">
                      <Eye size={14} /> View
                    </a>
                  ) : <span className="text-xs text-clay-muted">—</span>}
                </td>
                <td className="text-xs text-clay-muted">{new Date(r.createdAt).toLocaleString()}</td>
                <td><span className={`clay-badge ${statusColor(r.status)}`}>{r.status}</span></td>
                <td>
                  {r.status === 'pending' && (
                    <div className="flex gap-1">
                      <button disabled={processing === r.id} onClick={() => processRequest(r.id, 'approved', r.amount)}
                        className="p-1.5 rounded text-green-600 hover:bg-green-50 border border-green-200 disabled:opacity-50" title="Approve">
                        {processing === r.id ? <Loader size={14} className="animate-spin" /> : <Check size={16} />}
                      </button>
                      <button disabled={processing === r.id} onClick={() => processRequest(r.id, 'rejected')}
                        className="p-1.5 rounded text-red-600 hover:bg-red-50 border border-red-200 disabled:opacity-50" title="Reject">
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
