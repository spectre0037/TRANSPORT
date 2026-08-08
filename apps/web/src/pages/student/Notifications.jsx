import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar } from 'lucide-react';
import api from '../../lib/api';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/notifications')
      .then((r) => setNotifications(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-bold text-clay-text sm:text-3xl">Notifications</h1>
        <p className="text-clay-muted text-sm">Announcements from admin</p>
      </div>

      {notifications.length === 0 ? (
        <div className="clay-card text-center py-12">
          <Bell className="mx-auto text-clay-muted mb-3" size={40} />
          <p className="text-clay-muted">No notifications yet</p>
          <p className="text-xs text-clay-muted mt-1">Check back later for announcements</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n, i) => (
            <motion.div key={n.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="clay-card">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 bg-clay-primary/10 rounded-clay flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="text-clay-primary" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-clay-text mb-1">{n.title}</h3>
                  <p className="text-sm text-clay-muted whitespace-pre-wrap leading-relaxed">{n.message}</p>
                  <p className="text-xs text-clay-muted mt-3 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
