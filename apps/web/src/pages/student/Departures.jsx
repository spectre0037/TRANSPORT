import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, Calendar, Clock, MapPin, Users, Search, ArrowRight } from 'lucide-react';
import api from '../../lib/api';

export default function DeparturesPage() {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ from: '', to: '' });

  useEffect(() => {
    api.get('/api/departures')
      .then((r) => setDepartures(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = departures.filter((d) => {
    if (filter.from && !d.fromCity.toLowerCase().includes(filter.from.toLowerCase())) return false;
    if (filter.to && !d.toCity.toLowerCase().includes(filter.to.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-clay-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clay-text">Departures</h1>
        <p className="text-clay-muted text-sm">Browse and book available transport routes</p>
      </div>

      {/* Filters */}
      <div className="clay-card">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={18} className="text-clay-muted" />
            <input type="text" value={filter.from} onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))}
              className="clay-input" placeholder="From city..." />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={18} className="text-clay-muted" />
            <input type="text" value={filter.to} onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))}
              className="clay-input" placeholder="To city..." />
          </div>
        </div>
      </div>

      {/* Departure List */}
      {filtered.length === 0 ? (
        <div className="clay-card text-center py-12">
          <Bus className="mx-auto text-clay-muted mb-3" size={40} />
          <p className="text-clay-muted">No departures found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((dep, i) => (
            <motion.div key={dep.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/departures/${dep.id}`} className="clay-card hover:shadow-clay-lg transition-all block">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-clay-primary/10 rounded-clay flex items-center justify-center">
                      <Bus className="text-clay-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-clay-text text-lg">{dep.route}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-clay-muted">
                        <span className="flex items-center gap-1"><MapPin size={14} />{dep.fromCity} → {dep.toCity}</span>
                        <span className="flex items-center gap-1"><Calendar size={14} />{new Date(dep.departureDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock size={14} />{dep.departureTime}</span>
                        <span className="flex items-center gap-1"><Users size={14} />{dep.totalSeats} seats</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <p className="text-xl font-bold text-clay-primary">PKR {dep.pricePerSeat}</p>
                      <p className="text-xs text-clay-muted">per seat</p>
                    </div>
                    <ArrowRight className="text-clay-muted" size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
