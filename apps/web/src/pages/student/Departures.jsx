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
    <div className="space-y-5 px-3 pb-24 sm:space-y-6 sm:px-0 sm:pb-6">
      <div className="pt-1 px-1 sm:px-0">
        <h1 className="text-lg font-bold text-clay-text sm:text-2xl md:text-3xl">Departures</h1>
        <p className="text-clay-muted text-xs sm:text-sm">Browse and book available transport routes</p>
      </div>

      {/* Filters — side by side always */}
      <div className="clay-card p-3.5 sm:p-6">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-clay-muted sm:left-3 sm:size-[18px]" />
            <input type="text" value={filter.from} onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))}
              className="clay-input w-full text-sm py-2 pl-7 pr-2 sm:text-base sm:py-2.5 sm:pl-10 sm:pr-3" placeholder="From city..." />
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-clay-muted sm:left-3 sm:size-[18px]" />
            <input type="text" value={filter.to} onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))}
              className="clay-input w-full text-sm py-2 pl-7 pr-2 sm:text-base sm:py-2.5 sm:pl-10 sm:pr-3" placeholder="To city..." />
          </div>
        </div>
      </div>

      {/* Departure List */}
      {filtered.length === 0 ? (
        <div className="clay-card text-center py-10 sm:py-12">
          <Bus className="mx-auto text-clay-muted mb-3" size={34} />
          <p className="text-clay-muted text-sm sm:text-base">No departures found</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {filtered.map((dep, i) => (
            <motion.div key={dep.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/departures/${dep.id}`} className="clay-card hover:shadow-clay-lg transition-all block p-3.5 sm:p-6">
                {/* Top row: icon + title + price, always side by side */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 sm:gap-4">
                    <div className="w-10 h-10 flex-shrink-0 bg-clay-primary/10 rounded-clay flex items-center justify-center sm:w-14 sm:h-14">
                      <Bus className="text-clay-primary" size={18} />
                    </div>
                    <h3 className="font-bold text-clay-text text-sm truncate sm:text-xl">{dep.route}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 sm:gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-clay-primary sm:text-xl">PKR {dep.pricePerSeat}</p>
                      <p className="text-[9px] text-clay-muted sm:text-xs">per seat</p>
                    </div>
                    <ArrowRight className="text-clay-muted hidden sm:block" size={20} />
                  </div>
                </div>

                {/* Details — 2 per row on mobile, single line on desktop */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-3 text-[11px] text-clay-muted sm:flex sm:flex-wrap sm:items-center sm:gap-3 sm:mt-1 sm:ml-[72px] sm:text-sm">
                  <span className="flex items-center gap-1 min-w-0 truncate"><MapPin size={12} className="flex-shrink-0 sm:size-[14px]" />{dep.fromCity} → {dep.toCity}</span>
                  <span className="flex items-center gap-1 min-w-0 truncate"><Users size={12} className="flex-shrink-0 sm:size-[14px]" />{dep.totalSeats} seats</span>
                  <span className="flex items-center gap-1 min-w-0 truncate"><Calendar size={12} className="flex-shrink-0 sm:size-[14px]" />{new Date(dep.departureDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 min-w-0 truncate"><Clock size={12} className="flex-shrink-0 sm:size-[14px]" />{dep.departureTime}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}