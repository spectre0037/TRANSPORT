import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Trash2, Mail, MailCheck, Plus, Loader } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    api.get('/api/notifications')
      .then((r) => setNotifications(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error('Both fields are required');
    setCreating(true);
    try {
      const { data } = await api.post('/api/notifications', { title: title.trim(), message: message.trim() });
      setNotifications((prev) => [data, ...prev]);
      setTitle('');
      setMessage('');
      toast.success('Notification created!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create notification');
    }
    setCreating(false);
  };

  const handleSendEmail = async (notificationId) => {
    setSendingId(notificationId);
    try {
      const { data } = await api.post(`/api/notifications/${notificationId}/send-email`);
      toast.success(`Emailed ${data.recipientCount} students!`);
      setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, sentViaEmail: true } : n));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send emails');
    }
    setSendingId(null);
  };

  const handleDelete = async (notificationId) => {
    if (!confirm('Delete this notification?')) return;
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      toast.success('Notification deleted');
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
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
        <h1 className="text-2xl font-bold text-clay-text">Notifications</h1>
        <p className="text-clay-muted text-sm">Create announcements and send them to students</p>
      </div>

      {/* Create Form */}
      <motion.form onSubmit={handleCreate} className="clay-card space-y-4"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-bold text-clay-text flex items-center gap-2">
          <Plus size={18} /> New Notification
        </h2>
        <div>
          <label className="text-sm font-medium text-clay-text mb-1 block">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="clay-input" placeholder="e.g., Holiday Schedule Update" required />
        </div>
        <div>
          <label className="text-sm font-medium text-clay-text mb-1 block">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            className="clay-input" rows={4} placeholder="Write your announcement here..." required
            style={{ resize: 'vertical' }} />
        </div>
        <button type="submit" disabled={creating || !title.trim() || !message.trim()}
          className="clay-btn-primary flex items-center gap-2 disabled:opacity-50">
          {creating ? <><Loader size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Create Notification</>}
        </button>
      </motion.form>

      {/* Notifications List */}
      <div>
        <h2 className="font-bold text-clay-text mb-4">All Notifications</h2>
        {notifications.length === 0 ? (
          <div className="clay-card text-center py-12">
            <Bell className="mx-auto text-clay-muted mb-3" size={40} />
            <p className="text-clay-muted">No notifications yet</p>
            <p className="text-xs text-clay-muted mt-1">Create your first announcement above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <motion.div key={n.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="clay-card relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-clay-text">{n.title}</h3>
                      {n.sentViaEmail ? (
                        <span className="clay-badge text-[10px] bg-green-100 text-green-700 flex items-center gap-1">
                          <MailCheck size={10} /> Emailed
                        </span>
                      ) : (
                        <span className="clay-badge text-[10px] bg-blue-100 text-blue-700 flex items-center gap-1">
                          <Bell size={10} /> Portal only
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-clay-muted whitespace-pre-wrap">{n.message}</p>
                    <p className="text-xs text-clay-muted mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.sentViaEmail && (
                      <button onClick={() => handleSendEmail(n.id)}
                        disabled={sendingId === n.id}
                        className="clay-btn-primary clay-btn-sm flex items-center gap-1 text-xs disabled:opacity-50"
                        title="Send email to all students">
                        {sendingId === n.id ? (
                          <><Loader size={12} className="animate-spin" /> Sending...</>
                        ) : (
                          <><Send size={12} /> Send Email</>
                        )}
                      </button>
                    )}
                    <button onClick={() => handleDelete(n.id)}
                      className="text-clay-danger hover:bg-red-50 p-1.5 rounded transition-colors"
                      title="Delete notification">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
