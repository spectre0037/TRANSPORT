import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Calendar, Clock, MapPin, Users, Search, ArrowRight, X, SlidersHorizontal } from 'lucide-react';
import api from '../../lib/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  valid: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  dropped: 'bg-red-100 text-red-700',
};

// Canonical city groups. Each entry maps a set of keywords (matched
// case-insensitively against the raw fromCity string) to one display label.
// This collapses variants like "ISB/RWP", "ISB", "ISB/RWP (GIKI)" into a
// single "ISB/RWP" tab instead of creating a separate tab per spelling.
const CITY_GROUPS = [
  { label: 'ISB/RWP', keywords: ['isb', 'rwp', 'islamabad', 'rawalpindi'] },
  { label: 'Swat', keywords: ['swat'] },
  { label: 'Abbottabad', keywords: ['abbottabad', 'abbotabad', 'abbotabd'] },
  { label: 'Lahore', keywords: ['lahore'] },
];

function normalizeCity(rawCity) {
  if (!rawCity) return 'Other';
  const lower = rawCity.toLowerCase();
  const group = CITY_GROUPS.find((g) => g.keywords.some((kw) => lower.includes(kw)));
  return group ? group.label : rawCity.trim();
}

function SkeletonCard() {
  return (
    <div className="clay-card animate-pulse p-3.5 sm:p-6">
      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="w-10 h-10 flex-shrink-0 rounded-clay bg-clay-bg sm:w-14 sm:h-14" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/5 rounded bg-clay-bg sm:h-5" />
          <div className="h-2.5 w-1/3 rounded bg-clay-bg sm:hidden" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-3.5 w-14 rounded bg-clay-bg ml-auto sm:h-5" />
          <div className="h-2 w-10 rounded bg-clay-bg ml-auto" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:hidden">
        <div className="h-2.5 rounded bg-clay-bg" />
        <div className="h-2.5 rounded bg-clay-bg" />
      </div>
    </div>
  );
}

// Combines date + time into a sortable timestamp. Falls back gracefully
// if departureTime isn't in a directly parseable format.
function getDepartureTimestamp(dep) {
  const datePart = dep.departureDate ? new Date(dep.departureDate) : null;
  if (!datePart || isNaN(datePart.getTime())) return Infinity;

  if (dep.departureTime) {
    // Try "HH:MM" or "HH:MM:SS" style times first
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(dep.departureTime.trim());
    if (match) {
      const [, h, m, s] = match;
      datePart.setHours(Number(h), Number(m), Number(s || 0), 0);
      return datePart.getTime();
    }
    // Fallback: let Date try to parse "date time" combined
    const combined = new Date(`${dep.departureDate}T00:00:00`);
    const parsedTime = new Date(`1970-01-01T${dep.departureTime}`);
    if (!isNaN(parsedTime.getTime())) {
      combined.setHours(parsedTime.getHours(), parsedTime.getMinutes(), parsedTime.getSeconds(), 0);
      return combined.getTime();
    }
  }

  return datePart.getTime();
}

export default function DeparturesPage() {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ to: '' });
  const [activeCity, setActiveCity] = useState('All');

  useEffect(() => {
    api.get('/api/departures')
      .then((r) => setDepartures(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Unique list of normalized cities, ordered to match CITY_GROUPS with any
  // unrecognized cities appended alphabetically at the end, "All" tab first.
  const cities = useMemo(() => {
    const present = new Set(departures.map((d) => normalizeCity(d.fromCity)));
    const known = CITY_GROUPS.map((g) => g.label).filter((label) => present.has(label));
    const unknown = Array.from(present)
      .filter((label) => !CITY_GROUPS.some((g) => g.label === label))
      .sort();
    return ['All', ...known, ...unknown];
  }, [departures]);

  // Reset to "All" if the currently active city no longer exists in the data
  useEffect(() => {
    if (activeCity !== 'All' && !cities.includes(activeCity)) {
      setActiveCity('All');
    }
  }, [cities, activeCity]);

  const filtered = useMemo(() => {
    return departures
      .filter((d) => {
        if (activeCity !== 'All' && normalizeCity(d.fromCity) !== activeCity) return false;
        if (filter.to && !d.toCity.toLowerCase().includes(filter.to.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => getDepartureTimestamp(a) - getDepartureTimestamp(b));
  }, [departures, activeCity, filter.to]);

  const hasActiveFilters = !!filter.to;
  const clearFilters = () => setFilter({ to: '' });

  // Count of departures per normalized city, for badges on the tabs
  const cityCounts = useMemo(() => {
    const counts = { All: departures.length };
    departures.forEach((d) => {
      const city = normalizeCity(d.fromCity);
      counts[city] = (counts[city] || 0) + 1;
    });
    return counts;
  }, [departures]);

  return (
    <div className="space-y-5 px-3 pb-24 sm:space-y-6 sm:px-0 sm:pb-6">
      <div className="pt-1 px-1 sm:px-0">
        <h1 className="text-lg font-bold text-clay-text sm:text-2xl md:text-3xl">Departures</h1>
        <p className="text-clay-muted text-xs sm:text-sm">Browse and book available transport routes</p>
      </div>

      {/* City tabs */}
      {!loading && cities.length > 1 && (
        <div className="-mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap">
            {cities.map((city) => {
              const isActive = activeCity === city;
              return (
                <button
                  key={city}
                  onClick={() => setActiveCity(city)}
                  className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                    isActive
                      ? 'bg-clay-primary text-white shadow-clay'
                      : 'bg-clay-bg text-clay-muted hover:text-clay-text'
                  }`}
                >
                  {city}
                  <span
                    className={`rounded-full px-1.5 text-[10px] ${
                      isActive ? 'bg-white/20' : 'bg-clay-card text-clay-muted'
                    }`}
                  >
                    {cityCounts[city] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="clay-card p-3.5 sm:p-6">
        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-clay-text sm:text-sm">
            <SlidersHorizontal size={13} className="text-clay-primary" /> Filter by destination
          </p>
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
                onClick={clearFilters}
                className="flex items-center gap-1 text-[11px] font-semibold text-clay-primary hover:underline sm:text-xs"
              >
                <X size={12} /> Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-clay-muted sm:left-3 sm:size-[18px]" />
          <input type="text" value={filter.to} onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))}
            className="clay-input w-full text-sm py-2 pl-7 pr-7 sm:text-base sm:py-2.5 sm:pl-10 sm:pr-8" placeholder="To city..." />
          {filter.to && (
            <button onClick={() => setFilter((f) => ({ ...f, to: '' }))} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-clay-muted hover:text-clay-primary sm:right-2">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      {!loading && departures.length > 0 && (
        <p className="px-1 text-[11px] text-clay-muted sm:px-0 sm:text-xs">
          {filtered.length} {filtered.length === 1 ? 'route' : 'routes'}
          {activeCity !== 'All' ? ` from ${activeCity}` : ''}
          {hasActiveFilters ? ' matching your filter' : ''}, sorted by departure time
        </p>
      )}

      {/* Loading skeletons */}
      {loading ? (
        <div className="grid gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="clay-card text-center py-10 sm:py-12">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-clay-bg">
            <Bus className="text-clay-muted" size={26} />
          </div>
          <p className="text-clay-text font-semibold text-sm sm:text-base">
            {hasActiveFilters || activeCity !== 'All' ? 'No routes match your filters' : 'No departures available yet'}
          </p>
          <p className="text-clay-muted text-xs mt-1 sm:text-sm">
            {hasActiveFilters || activeCity !== 'All' ? 'Try a different city or clear your filters.' : 'Check back soon for new routes.'}
          </p>
          {(hasActiveFilters || activeCity !== 'All') && (
            <button
              onClick={() => { clearFilters(); setActiveCity('All'); }}
              className="clay-btn-outline mt-4 inline-flex items-center gap-1.5 text-sm"
            >
              <X size={14} /> Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {filtered.map((dep, i) => {
            const available = dep.availableSeats ?? dep.totalSeats;
            const vehicleLabel = dep.busType === 'hiace' ? '🚐 Hiace' : dep.busType === 'coaster' ? '🚌 Coaster' : dep.busType === 'bus' ? '🚌 Bus' : null;
            return (
              <motion.div key={dep.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
                <Link to={`/departures/${dep.id}`} className="clay-card group block p-3.5 transition-all hover:shadow-clay-lg hover:-translate-y-0.5 sm:p-6">
                  {/* Top row: icon + title + price, always side by side */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 sm:gap-4">
                      <div className="w-10 h-10 flex-shrink-0 bg-clay-primary/10 rounded-clay flex items-center justify-center sm:w-14 sm:h-14">
                        <Bus className="text-clay-primary" size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-clay-text text-sm truncate sm:text-xl">{dep.route}</h3>
                        {dep.status && (
                          <span className={`clay-badge mt-0.5 text-[9px] sm:text-[10px] ${statusColors[dep.status] || 'bg-gray-100 text-gray-700'}`}>
                            {dep.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 sm:gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-clay-primary sm:text-xl">PKR {dep.pricePerSeat}</p>
                        <p className="text-[9px] text-clay-muted sm:text-xs">per seat</p>
                      </div>
                      <ArrowRight className="text-clay-muted transition-transform group-hover:translate-x-1 group-hover:text-clay-primary flex-shrink-0" size={16} strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Details — 2 per row on mobile, single line on desktop */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-3 text-[11px] text-clay-muted sm:flex sm:flex-wrap sm:items-center sm:gap-3 sm:mt-2 sm:ml-[72px] sm:text-sm">
                    <span className="flex items-center gap-1 min-w-0 truncate"><MapPin size={12} className="flex-shrink-0 text-clay-primary/70 sm:size-[14px]" />{dep.fromCity} → {dep.toCity}</span>
                    <span className="flex items-center gap-1 min-w-0 truncate"><Calendar size={12} className="flex-shrink-0 text-clay-primary/70 sm:size-[14px]" />{new Date(dep.departureDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 min-w-0 truncate"><Clock size={12} className="flex-shrink-0 text-clay-primary/70 sm:size-[14px]" />{dep.departureTime}</span>
                    <span className={`flex items-center gap-1 min-w-0 truncate ${available <= 3 && available > 0 ? 'text-clay-warning font-semibold' : available === 0 ? 'text-clay-danger font-semibold' : ''}`}>
                      <Users size={12} className="flex-shrink-0 sm:size-[14px]" />
                      {available === 0 ? 'Full' : `${available}/${dep.totalSeats} seats`}
                    </span>
                  </div>

                  {vehicleLabel && (
                    <div className="mt-2.5 sm:mt-3 sm:ml-[72px]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-clay-bg px-2.5 py-1 text-[10px] font-medium text-clay-text sm:text-xs">
                        {vehicleLabel}
                      </span>
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}