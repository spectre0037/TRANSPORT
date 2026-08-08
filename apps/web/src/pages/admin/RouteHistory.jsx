import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, DollarSign, ChevronDown, ChevronRight, Bus, Phone, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const statusColors = {
  confirmed: 'bg-green-100 text-green-700',
  valid: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  dropped: 'bg-red-100 text-red-700',
};

export default function RouteHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [passengersLoading, setPassengersLoading] = useState(false);

  useEffect(() => {
    api.get('/api/departures/history')
      .then((r) => setHistory(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (departureId) => {
    if (expandedId === departureId) {
      setExpandedId(null);
      setPassengers([]);
      return;
    }
    setExpandedId(departureId);
    setPassengersLoading(true);
    try {
      const res = await api.get(`/api/departures/${departureId}/passengers`);
      setPassengers(res.data);
    } catch (err) {
      console.error(err);
    }
    setPassengersLoading(false);
  };

  const handleDelete = async (departureId, routeName) => {
    if (!confirm(`Delete route "${routeName}"? This will permanently remove it and all associated data.`)) return;
    try {
      await api.delete(`/api/departures/${departureId}`);
      toast.success('Route deleted');
      setHistory((prev) => prev.filter((d) => d.id !== departureId));
      if (expandedId === departureId) {
        setExpandedId(null);
        setPassengers([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete route');
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
        <h1 className="text-2xl font-bold text-clay-text sm:text-3xl">Route History</h1>
        <p className="text-clay-muted text-sm">View completed and past routes with passenger manifests</p>
      </div>

      {history.length === 0 ? (
        <div className="clay-card text-center py-12">
          <Bus className="mx-auto text-clay-muted mb-3" size={40} />
          <p className="text-clay-muted">No route history found</p>
          <p className="text-xs text-clay-muted mt-1">Past/completed departures will appear here</p>
        </div>
      ) : (
        <>
        <div className="space-y-3 md:hidden">
          {history.map((dep) => (
            <div key={dep.id} className="clay-card space-y-3">
              <button onClick={() => toggleExpand(dep.id)} className="flex w-full items-start justify-between gap-3 text-left">
                <div className="min-w-0">
                  <p className="font-semibold text-clay-text">{dep.route}</p>
                  <p className="text-xs text-clay-muted">{dep.fromCity} → {dep.toCity}</p>
                </div>
                <span className={`clay-badge text-xs ${statusColors[dep.status] || 'bg-gray-100 text-gray-700'}`}>{dep.status}</span>
              </button>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-clay-muted">Date</p><p>{new Date(dep.departureDate).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-clay-muted">Time</p><p>{dep.departureTime}</p></div>
                <div><p className="text-xs text-clay-muted">Passengers</p><p className="font-semibold">{dep.passengerCount || 0} / {dep.totalSeats}</p></div>
                <div><p className="text-xs text-clay-muted">Revenue</p><p className="font-bold text-clay-primary">PKR {parseFloat(dep.totalRevenue || 0).toLocaleString()}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleExpand(dep.id)} className="clay-btn-outline clay-btn-sm text-xs flex-1">{expandedId === dep.id ? 'Hide passengers' : 'Show passengers'}</button>
                <button onClick={() => handleDelete(dep.id, dep.route)} className="clay-btn-danger clay-btn-sm text-xs">Delete</button>
              </div>
              {expandedId === dep.id && (
                <div className="rounded-clay bg-clay-bg/50 p-3 space-y-2">
                  <p className="text-sm font-semibold text-clay-text">Passenger Manifest</p>
                  {passengersLoading ? <div className="py-4 text-center text-clay-muted">Loading...</div> : passengers.length === 0 ? <p className="text-sm text-clay-muted">No approved passengers for this route</p> : passengers.map((p) => (
                    <div key={p.bookingId} className="rounded-clay bg-white p-3 text-sm">
                      <p className="font-medium text-clay-text">{p.fullName}</p>
                      <p className="text-xs text-clay-muted break-all">{p.bookingReference}</p>
                      <p className="text-xs text-clay-muted">Seat #{p.seatNumber} • {p.gender === 'male' ? 'Male' : 'Female'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="clay-table">
            <thead>
              <tr>
                <th className="w-10"></th>
                <th>Route</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Passengers</th>
                <th>Revenue</th>
                <th>Status</th>
                <th className="w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((dep) => (
                <Fragment key={dep.id}>
                  <tr className="cursor-pointer hover:bg-clay-bg/50" onClick={() => toggleExpand(dep.id)}>
                    <td>
                      <button className="text-clay-muted hover:text-clay-primary transition-colors">
                        {expandedId === dep.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </td>
                    <td className="font-semibold">{dep.route}</td>
                    <td>
                      <span className={`clay-badge text-xs ${dep.busType === 'hiace' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                        {dep.busType === 'hiace' ? '🚐 Hiace' : '🚌 Bus'}
                      </span>
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-sm">
                        <Calendar size={12} />{new Date(dep.departureDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-sm">
                        <Clock size={12} />{dep.departureTime}
                      </span>
                    </td>
                    <td>
                      <span className="flex items-center gap-1">
                        <Users size={14} className="text-clay-muted" />
                        <span className="font-semibold">{dep.passengerCount || 0}</span>
                        <span className="text-xs text-clay-muted">/ {dep.totalSeats}</span>
                      </span>
                    </td>
                    <td className="font-bold text-clay-primary">
                      PKR {parseFloat(dep.totalRevenue || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className={`clay-badge ${statusColors[dep.status] || 'bg-gray-100 text-gray-700'}`}>
                        {dep.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(dep.id, dep.route); }}
                        className="text-clay-danger hover:bg-red-50 p-1.5 rounded transition-colors" title="Delete route">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                  {expandedId === dep.id && (
                    <tr key={`${dep.id}-passengers`}>
                      <td colSpan={9} className="p-0 bg-clay-bg/30">
                        <div className="p-4">
                          <h4 className="font-bold text-clay-text mb-3 flex items-center gap-2">
                            <Users size={16} /> Passenger Manifest
                          </h4>
                          {passengersLoading ? (
                            <div className="flex items-center justify-center py-6">
                              <div className="animate-spin w-6 h-6 border-4 border-clay-primary border-t-transparent rounded-full"></div>
                            </div>
                          ) : passengers.length === 0 ? (
                            <p className="text-clay-muted text-sm text-center py-4">No approved passengers for this route</p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="clay-table text-sm">
                                <thead>
                                  <tr>
                                    <th>Name</th>
                                    <th>Destination</th>
                                    <th>Ticket ID</th>
                                    <th>Phone</th>
                                    <th>Seat</th>
                                    <th>Gender</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {passengers.map((p) => (
                                    <tr key={p.bookingId}>
                                      <td className="font-medium">{p.fullName}</td>
                                      <td>{p.preferredCity || p.destination || '—'}</td>
                                      <td className="font-mono text-xs font-semibold text-clay-primary">{p.bookingReference}</td>
                                      <td>
                                        <span className="flex items-center gap-1">
                                          <Phone size={12} className="text-clay-muted" />
                                          {p.phone || '—'}
                                        </span>
                                      </td>
                                      <td>#{p.seatNumber}</td>
                                      <td>
                                        <span className={`clay-badge text-xs ${p.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                          {p.gender === 'male' ? '👨 Male' : '👩 Female'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
