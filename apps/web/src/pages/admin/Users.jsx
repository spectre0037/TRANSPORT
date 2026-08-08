import { useState, useEffect } from 'react';
import { Users, Mail, Phone, MapPin, Shield, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/users').then((r) => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await api.put(`/api/users/${userId}/role`, { role: newRole });
      toast.success('Role updated');
      setUsers((p) => p.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    } catch { toast.error('Failed'); }
  };

  const adjustWallet = async (userId) => {
    const amount = prompt('Enter amount (positive to credit, negative to debit):');
    if (amount === null) return;
    const num = parseFloat(amount);
    if (isNaN(num)) return toast.error('Invalid amount');
    try {
      await api.post(`/api/users/${userId}/wallet-adjust`, { amount: num, description: 'Admin wallet adjustment' });
      toast.success('Wallet adjusted');
      load();
    } catch { toast.error('Failed'); }
  };

  const load = () => api.get('/api/users').then((r) => setUsers(r.data));

  const deleteUser = async (userId, name) => {
    if (!confirm(`Delete user "${name}"? This will remove all their bookings and data.`)) return;
    try {
      await api.delete(`/api/users/${userId}`);
      toast.success('User deleted');
      setUsers((p) => p.filter((u) => u.id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clay-text sm:text-3xl">User Management</h1>
        <p className="text-clay-muted text-sm">View and manage registered users</p>
      </div>

      <div className="space-y-3 md:hidden">
        {users.map((u) => (
          <div key={u.id} className="clay-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-clay-primary/10 flex items-center justify-center text-clay-primary font-bold text-sm shrink-0">{u.fullName?.charAt(0)}</div>
              <div className="min-w-0">
                <p className="font-medium text-clay-text">{u.fullName}</p>
                <p className="text-xs text-clay-muted break-all">{u.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-clay-muted">Phone</p><p>{u.phone || '-'}</p></div>
              <div><p className="text-xs text-clay-muted">City</p><p>{u.preferredCity || '-'}</p></div>
              <div><p className="text-xs text-clay-muted">Role</p><p><span className={`clay-badge ${u.role === 'admin' ? 'bg-clay-secondary text-white' : 'bg-clay-bg text-clay-text'}`}>{u.role}</span></p></div>
              <div><p className="text-xs text-clay-muted">Wallet</p><p className="font-bold text-clay-primary">PKR {u.walletBalance}</p></div>
              <div className="col-span-2"><p className="text-xs text-clay-muted">Verified</p><p><span className={`clay-badge ${u.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{u.isEmailVerified ? 'Yes' : 'No'}</span></p></div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => toggleRole(u.id, u.role)} className="clay-btn-outline clay-btn-sm text-xs w-full sm:w-auto"><Shield size={12} className="mr-1" />{u.role === 'admin' ? 'Demote' : 'Promote'}</button>
              <button onClick={() => adjustWallet(u.id)} className="clay-btn-outline clay-btn-sm text-xs w-full sm:w-auto">Wallet</button>
              <button onClick={() => deleteUser(u.id, u.fullName)} className="clay-btn-danger clay-btn-sm text-xs w-full sm:w-auto"><Trash2 size={12} /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="clay-table">
          <thead>
            <tr><th>User</th><th>Contact</th><th>City</th><th>Role</th><th>Wallet</th><th>Verified</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-clay-primary/10 flex items-center justify-center text-clay-primary font-bold text-sm">
                      {u.fullName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{u.fullName}</p>
                      <p className="text-xs text-clay-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="text-sm">{u.phone || '-'}</td>
                <td className="text-sm">{u.preferredCity || '-'}</td>
                <td>
                  <span className={`clay-badge ${u.role === 'admin' ? 'bg-clay-secondary text-white' : 'bg-clay-bg text-clay-text'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="font-bold text-sm">PKR {u.walletBalance}</td>
                <td>
                  <span className={`clay-badge ${u.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {u.isEmailVerified ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => toggleRole(u.id, u.role)} className="clay-btn-outline clay-btn-sm text-xs">
                      <Shield size={12} className="mr-1" />{u.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button onClick={() => adjustWallet(u.id)} className="clay-btn-outline clay-btn-sm text-xs">
                      Wallet
                    </button>
                    <button onClick={() => deleteUser(u.id, u.fullName)} className="clay-btn-danger clay-btn-sm text-xs">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
