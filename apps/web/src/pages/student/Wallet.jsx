import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, Upload, Loader, Check, X } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupFile, setTopupFile] = useState(null);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupRequests, setTopupRequests] = useState([]);

  const loadData = () => {
    Promise.all([
      api.get('/api/wallet/balance'),
      api.get('/api/wallet/transactions'),
      api.get('/api/wallet/topup/my'),
    ]).then(([b, t, tr]) => {
      setBalance(b.data.balance);
      setTransactions(t.data);
      setTopupRequests(tr.data);
    }).catch(console.error)
    .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleTopup = async () => {
    if (!topupAmount || parseFloat(topupAmount) <= 0) return toast.error('Enter a valid amount');
    if (!topupFile) return toast.error('Please select a payment screenshot');

    setTopupLoading(true);
    try {
      // Upload to Cloudinary
      const signedRes = await api.get('/api/uploads/signed-url', { params: { folder: 'taleemxpress/topups' } });
      const { url: cloudUrl, uploadPreset } = signedRes.data;
      const formData = new FormData();
      formData.append('file', topupFile);
      formData.append('upload_preset', uploadPreset);

      const cloudResp = await fetch(cloudUrl, { method: 'POST', body: formData });
      const cloudData = await cloudResp.json();
      if (!cloudData.secure_url) throw new Error(cloudData.error?.message || 'Upload failed');

      // Submit top-up request
      await api.post('/api/wallet/topup', {
        amount: parseFloat(topupAmount),
        screenshotUrl: cloudData.secure_url,
      });

      toast.success('Top-up request submitted! Admin will review shortly.');
      setShowTopup(false);
      setTopupAmount('');
      setTopupFile(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to submit top-up request');
    }
    setTopupLoading(false);
  };

  const txIcon = (type) => {
    if (type === 'credit' || type === 'refund') return <ArrowDownLeft className="text-clay-success" size={18} />;
    return <ArrowUpRight className="text-clay-danger" size={18} />;
  };

  const txColor = (type) => {
    if (type === 'credit' || type === 'refund') return 'text-clay-success';
    return 'text-clay-danger';
  };

  const topupStatusColor = (s) => {
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
        <h1 className="text-2xl font-bold text-clay-text">Wallet</h1>
        <p className="text-clay-muted text-sm">View your balance, transaction history, and top up</p>
      </div>

      {/* Balance Card + Top Up Button */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="clay-card bg-gradient-to-br from-clay-primary to-clay-secondary text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Wallet size={24} />
              <span className="text-white/80 text-sm">Total Balance</span>
            </div>
            <p className="text-4xl font-bold">PKR {balance}</p>
            <p className="text-white/60 text-xs mt-2">Available for bookings</p>
          </div>
          <button onClick={() => setShowTopup(!showTopup)} className="bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-clay font-semibold transition-all flex items-center gap-2">
            <Upload size={18} /> Top Up
          </button>
        </div>
      </motion.div>

      {/* Top Up Form */}
      {showTopup && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="clay-card space-y-4">
          <h3 className="font-bold text-clay-text">Wallet Top Up</h3>
          <p className="text-sm text-clay-muted">Transfer money to the TaleemXpress bank account, then upload the receipt.</p>

          <div>
            <label className="text-sm font-medium text-clay-text mb-1 block">Amount (PKR)</label>
            <input type="number" className="clay-input" placeholder="Enter amount" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} min={1} />
          </div>

          <div>
            <label className="text-sm font-medium text-clay-text mb-1 block">Payment Screenshot</label>
            <div className="border-2 border-dashed border-clay-border rounded-clay p-6 bg-clay-bg/50 text-center">
              <input type="file" accept="image/*" className="hidden" id="topup-file" onChange={(e) => setTopupFile(e.target.files?.[0] || null)} />
              <label htmlFor="topup-file" className="cursor-pointer">
                {topupFile ? (
                  <div className="space-y-1">
                    <Check className="mx-auto text-clay-success" size={24} />
                    <p className="text-sm font-semibold text-clay-text">{topupFile.name}</p>
                    <p className="text-xs text-clay-muted">{(topupFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="mx-auto text-clay-muted" size={28} />
                    <p className="text-sm text-clay-muted">Click to select receipt</p>
                    <p className="text-xs text-clay-muted">JPG, PNG accepted</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setShowTopup(false); setTopupAmount(''); setTopupFile(null); }} className="clay-btn-outline flex-1">Cancel</button>
            <button onClick={handleTopup} disabled={!topupAmount || !topupFile || topupLoading} className="clay-btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2">
              {topupLoading ? <><Loader size={16} className="animate-spin" /> Submitting...</> : 'Submit Request'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Top-up Requests History */}
      {topupRequests.length > 0 && (
        <div className="clay-card">
          <h2 className="font-bold text-clay-text mb-4">Top-up Requests</h2>
          <div className="space-y-3">
            {topupRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-clay bg-clay-bg/50">
                <div>
                  <p className="text-sm font-semibold text-clay-text">PKR {r.amount}</p>
                  <p className="text-xs text-clay-muted">{new Date(r.createdAt).toLocaleString()}</p>
                  {r.adminNotes && <p className="text-xs text-clay-muted italic">Note: {r.adminNotes}</p>}
                </div>
                <span className={`clay-badge text-xs ${topupStatusColor(r.status)}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="clay-card">
        <h2 className="font-bold text-clay-text mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-clay-muted text-sm text-center py-4">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, i) => (
              <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-clay bg-clay-bg/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-clay flex items-center justify-center">
                    {txIcon(tx.type)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-clay-text capitalize">{tx.type}</p>
                    <p className="text-xs text-clay-muted">{tx.description}</p>
                    <p className="text-xs text-clay-muted">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`font-bold ${txColor(tx.type)}`}>
                  {tx.type === 'credit' || tx.type === 'refund' ? '+' : '-'}PKR {tx.amount}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
