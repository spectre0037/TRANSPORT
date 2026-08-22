import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, ArrowLeft, Check, Upload, User, Wallet, CreditCard, Loader, Copy, CheckCheck, Landmark } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';

const BANK_ACCOUNTS = [
  { id: 'jazzcash', bankName: 'Jazzcash', accountNumber: '03253601441', preferred: false },
];

function CopyableAccountCard({ account }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      toast.success(`${account.bankName} account number copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — please copy manually');
    }
  };

  return (
    <div className={`rounded-clay-lg border-2 p-4 text-left transition-all ${account.preferred ? 'border-clay-primary bg-clay-primary/5' : 'border-clay-border bg-white'}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Landmark size={16} className="text-clay-primary" />
          <span className="font-bold text-clay-text text-sm">{account.bankName}</span>
        </div>
        {account.preferred && (
          <span className="clay-badge text-[10px] bg-clay-primary text-white">Preferred</span>
        )}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex w-full items-center justify-between gap-2 rounded-clay border border-clay-border bg-clay-bg px-3 py-2.5 transition-colors hover:border-clay-primary active:scale-[0.98]"
      >
        <span className="font-mono text-sm text-clay-text tracking-wide truncate">{account.accountNumber}</span>
        {copied ? (
          <CheckCheck size={16} className="flex-shrink-0 text-clay-success" />
        ) : (
          <Copy size={16} className="flex-shrink-0 text-clay-muted" />
        )}
      </button>
      <p className="mt-1.5 text-[11px] text-clay-muted">{copied ? 'Copied to clipboard!' : 'Tap the account number to copy'}</p>
    </div>
  );
}

export default function SeatMapPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthStore();
  const [departure, setDeparture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [gender, setGender] = useState('');
  const [booking, setBooking] = useState(false);
  const [step, setStep] = useState('select');
  const [walletBalance, setWalletBalance] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    api.get(`/api/departures/${id}`)
      .then((r) => setDeparture(r.data))
      .catch(() => { toast.error('Departure not found'); navigate('/departures'); })
      .finally(() => setLoading(false));
    api.get('/api/wallet/balance').then(r => setWalletBalance(r.data.balance)).catch(() => {});
  }, [id, navigate]);

  const handleBookWithWallet = async () => {
    if (!selectedSeat || !gender) return;
    setBooking(true);
    try {
      const { data } = await api.post('/api/bookings', {
        departureId: id,
        seatId: selectedSeat.id,
        gender,
        paymentMethod: 'wallet',
      });
      await refreshUser();
      toast.success('Booking confirmed! Amount deducted from wallet.');
      setStep('done');
    } catch (err) {
      const msg = err.response?.data?.error || 'Booking failed';
      toast.error(msg);
      if (err.response?.data?.code === 'INSUFFICIENT_BALANCE') {
        setStep('payment');
      }
    }
    setBooking(false);
  };

  const handleSelectUpload = () => {
    setStep('upload');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUploadScreenshot = async () => {
    if (!selectedFile) { toast.error('Please select a screenshot first'); return; }
    setUploading(true);
    try {
      const signedRes = await api.get('/api/uploads/signed-url', { params: { folder: 'taleemxpress/payments' } });
      const { url: cloudUrl, uploadPreset } = signedRes.data;

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', uploadPreset);

      const cloudResp = await fetch(cloudUrl, { method: 'POST', body: formData });
      const cloudData = await cloudResp.json();

      if (!cloudData.secure_url) throw new Error(cloudData.error?.message || 'Upload failed');

      // Create the booking with payment upload
      const { data } = await api.post('/api/bookings', {
        departureId: id,
        seatId: selectedSeat.id,
        gender,
        paymentMethod: 'upload',
      });

      // Submit the screenshot URL
      await api.post(`/api/bookings/${data.id}/payment`, { paymentScreenshotUrl: cloudData.secure_url });

      toast.success('Booking submitted! Admin will review your payment screenshot.');
      setStep('done');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Upload failed. Try again.');
    }
    setUploading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;
  if (!departure) return null;

  const seatRows = [...new Set(departure.seats?.map(s => s.row))].sort();
  const seatsByRow = {};
  departure.seats?.forEach((s) => {
    if (!seatsByRow[s.row]) seatsByRow[s.row] = [];
    seatsByRow[s.row].push(s);
  });
  // Detect layout: if any seat column > 2, it's 4-col bus, otherwise 2-col hiace
  const maxColumns = Math.max(...departure.seats?.map(s => s.column) || [4]);
  const isBusLayout = maxColumns > 2;
  const availableCount = departure.seats?.filter((s) => !s.isBooked).length || 0;
  const price = parseFloat(departure.pricePerSeat);
  const canAfford = walletBalance >= price;

  if (step === 'done') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="clay-card text-center py-16 max-w-lg mx-auto">
        <div className="w-16 h-16 bg-clay-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="text-clay-success" size={32} />
        </div>
        <h2 className="text-xl font-bold text-clay-text mb-2">Booking Complete! 🎉</h2>
        <p className="text-clay-muted text-sm mb-6">
          Check your email for the confirmation details.
        </p>
        <button onClick={() => navigate('/bookings')} className="clay-btn-primary">View My Bookings</button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-clay-muted hover:text-clay-primary transition-colors">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="clay-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-clay-primary/10 rounded-clay flex items-center justify-center">
            <Bus className="text-clay-primary" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-clay-text">{departure.route}</h1>
            <p className="text-sm text-clay-muted">{new Date(departure.departureDate).toLocaleDateString()} • {departure.departureTime}</p>
            <p className="text-sm text-clay-muted">{availableCount} seats • PKR {price}/seat</p>
            <span className={`clay-badge mt-1 ${
              departure.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              departure.status === 'valid' ? 'bg-blue-100 text-blue-700' :
              departure.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>{departure.status}</span>
          </div>
        </div>

        {/* ─── SEAT SELECTION ─── */}
        {step === 'select' && (
          <>
            <div className="bg-clay-bg rounded-clay-lg p-6 mb-6">
              <div className="text-center mb-6">
                <div className="inline-block bg-clay-muted/20 text-clay-muted text-xs px-4 py-1.5 rounded-full font-medium">🚌 FRONT (Driver)</div>
              </div>
              <div className="max-w-xs mx-auto space-y-2">
                {seatRows.map((row) => {
                  const rowSeats = seatsByRow[row] || [];
                  const leftSeats = rowSeats.filter(s => s.column <= 2).sort((a, b) => a.column - b.column);
                  const rightSeats = rowSeats.filter(s => s.column > 2).sort((a, b) => a.column - b.column);
                  return (
                    <div key={row} className="flex items-center justify-center gap-1">
                      <span className="w-5 text-center text-xs font-bold text-clay-muted">{row}</span>
                      <div className="flex gap-1">
                        {leftSeats.map((seat) => (
                          <button key={seat.id} disabled={seat.isBooked}
                            onClick={() => { setSelectedSeat(seat); setGender(''); }}
                            className={`w-11 h-11 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center ${
                              seat.isBooked
                                ? `${seat.gender === 'male' ? 'bg-blue-200 text-blue-700' : seat.gender === 'female' ? 'bg-pink-200 text-pink-700' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                                : selectedSeat?.id === seat.id
                                  ? gender === 'male' ? 'bg-blue-500 text-white scale-110 shadow-clay' : gender === 'female' ? 'bg-pink-500 text-white scale-110 shadow-clay' : 'bg-clay-primary text-white scale-110 shadow-clay'
                                  : 'bg-white border-2 border-clay-border text-clay-text hover:border-clay-primary hover:scale-105 cursor-pointer'
                            }`}>{seat.seatNumber}</button>
                        ))}
                      </div>
                      <div className="w-6 text-center"><span className="text-[8px] text-clay-muted/40">| |</span></div>
                      <div className="flex gap-1">
                        {rightSeats.map((seat) => (
                          <button key={seat.id} disabled={seat.isBooked}
                            onClick={() => { setSelectedSeat(seat); setGender(''); }}
                            className={`w-11 h-11 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center ${
                              seat.isBooked
                                ? `${seat.gender === 'male' ? 'bg-blue-200 text-blue-700' : seat.gender === 'female' ? 'bg-pink-200 text-pink-700' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                                : selectedSeat?.id === seat.id
                                  ? gender === 'male' ? 'bg-blue-500 text-white scale-110 shadow-clay' : gender === 'female' ? 'bg-pink-500 text-white scale-110 shadow-clay' : 'bg-clay-primary text-white scale-110 shadow-clay'
                                  : 'bg-white border-2 border-clay-border text-clay-text hover:border-clay-primary hover:scale-105 cursor-pointer'
                            }`}>{seat.seatNumber}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-4 mt-6 text-xs text-clay-muted">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border-2 border-clay-border"></span> Avail</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500"></span> Male</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-pink-500"></span> Female</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-300"></span> Booked</span>
              </div>
            </div>

            {/* Gender + Book */}
            {selectedSeat && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clay-card bg-clay-bg/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-clay-text">Seat {selectedSeat.seatNumber} (Row {selectedSeat.row})</p>
                    <p className="text-sm text-clay-muted">PKR {price}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-clay-text mb-2 flex items-center gap-1"><User size={16} /> Passenger Gender:</p>
                  <div className="flex gap-3">
                    <button onClick={() => setGender('male')}
                      className={`flex-1 py-3 rounded-clay font-bold text-sm transition-all ${gender === 'male' ? 'bg-blue-500 text-white shadow-clay ring-2 ring-blue-300' : 'bg-white border-2 border-clay-border text-clay-text hover:border-blue-300'}`}>👨 Male</button>
                    <button onClick={() => setGender('female')}
                      className={`flex-1 py-3 rounded-clay font-bold text-sm transition-all ${gender === 'female' ? 'bg-pink-500 text-white shadow-clay ring-2 ring-pink-300' : 'bg-white border-2 border-clay-border text-clay-text hover:border-pink-300'}`}>👩 Female</button>
                  </div>
                </div>
                <button onClick={() => setStep('payment')} disabled={!gender}
                  className="clay-btn-primary w-full disabled:opacity-50">
                  Continue to Payment — PKR {price}
                </button>
              </motion.div>
            )}
          </>
        )}

        {/* ─── PAYMENT CHOICE ─── */}
        {step === 'payment' && selectedSeat && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clay-card space-y-4">
            <h3 className="font-bold text-clay-text text-lg text-center">Choose Payment Method</h3>
            <p className="text-sm text-clay-muted text-center">Seat {selectedSeat.seatNumber} • PKR {price}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Wallet Option */}
              <button onClick={handleBookWithWallet} disabled={booking || !canAfford}
                className={`p-6 rounded-clay-lg border-2 text-left transition-all ${canAfford ? 'hover:border-clay-primary border-clay-border bg-white' : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'}`}>
                <Wallet className={`mb-2 ${canAfford ? 'text-clay-success' : 'text-gray-400'}`} size={28} />
                <p className="font-bold text-clay-text mb-1">Pay with Wallet</p>
                <p className="text-sm text-clay-muted">Balance: PKR {walletBalance}</p>
                {canAfford ? (
                  <p className="text-xs text-clay-success mt-1">✅ Sufficient balance</p>
                ) : (
                  <p className="text-xs text-clay-danger mt-1">❌ Insufficient — need PKR {price}</p>
                )}
                <div className="clay-btn-primary w-full mt-3 clay-btn-sm disabled:opacity-50 text-center">
                  {booking ? <><Loader size={14} className="animate-spin mr-1 inline" /> Processing...</> : `Pay PKR ${price}`}
                </div>
              </button>

              {/* Upload Option */}
              <button onClick={handleSelectUpload}
                className="p-6 rounded-clay-lg border-2 border-clay-border bg-white hover:border-clay-primary text-left transition-all">
                <Upload className="mb-2 text-clay-primary" size={28} />
                <p className="font-bold text-clay-text mb-1">Upload Screenshot</p>
                <p className="text-sm text-clay-muted">Pay via bank transfer & upload proof</p>
                <p className="text-xs text-clay-muted mt-1">click here for details</p>
                <div className="clay-btn-outline w-full mt-3 clay-btn-sm text-center">Upload Proof</div>
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── UPLOAD SCREENSHOT ─── */}
        {step === 'upload' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clay-card space-y-4 text-center">
            <Upload className="mx-auto text-clay-primary" size={36} />
            <h3 className="font-bold text-clay-text text-lg">Upload Payment Screenshot</h3>
            <p className="text-sm text-clay-muted max-w-sm mx-auto">
              Transfer <strong>PKR {price}</strong> to the TaleemXpress accounts below and upload the receipt screenshot.
            </p>

            {/* Bank account details — click to copy */}
            <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-1 max-w-lg mx-auto">
              {BANK_ACCOUNTS.map((account) => (
                <CopyableAccountCard key={account.id} account={account} />
              ))}
            </div>

            <div className="border-2 border-dashed border-clay-border rounded-clay-lg p-8 bg-clay-bg/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot-upload"
              />
              <label htmlFor="screenshot-upload" className="cursor-pointer">
                {selectedFile ? (
                  <div className="space-y-2">
                    <Check className="mx-auto text-clay-success" size={24} />
                    <p className="text-sm font-semibold text-clay-text">{selectedFile.name}</p>
                    <p className="text-xs text-clay-muted">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto text-clay-muted" size={28} />
                    <p className="text-sm text-clay-muted">Click to select screenshot</p>
                    <p className="text-xs text-clay-muted">JPG, PNG accepted</p>
                  </div>
                )}
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('payment')} className="clay-btn-outline flex-1">Back</button>
              <button onClick={handleUploadScreenshot} disabled={!selectedFile || uploading}
                className="clay-btn-primary flex-1 disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Submit Screenshot'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}