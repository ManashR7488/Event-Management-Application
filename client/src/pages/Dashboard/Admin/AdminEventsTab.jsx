import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaQrcode } from 'react-icons/fa';
import { getAllEvents, getEventCanteenQR } from '../../../api/eventService';
import { toast } from 'react-toastify';
import EventQRDisplay from '../../../components/EventQRDisplay';

const AdminEventsTab = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    isActive: ''
  });
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrEventData, setQREventData] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getAllEvents(filters);
    setIsLoading(false);
    
    if (result.success) {
      setEvents(result.data || []);
    } else {
      setError(result.error || 'Failed to load events');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleViewQR = async (eventId) => {
    setLoadingQR(true);
    const result = await getEventCanteenQR(eventId);
    setLoadingQR(false);

    if (result.success) {
      setQREventData(result.data);
      setShowQRModal(true);
    } else {
      toast.error(result.error || 'Failed to fetch canteen QR code');
    }
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      hackathon: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      sports: 'bg-green-500/20 text-green-300 border border-green-500/30',
      cultural: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
      technical: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      food: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    };
    return colors[type] || 'bg-slate-700 text-slate-300 border border-slate-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Events Overview</h2>
        <p className="text-slate-400 mt-1">View all platform events</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Event Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-300 appearance-none"
            >
              <option value="" className="bg-slate-900">All Types</option>
              <option value="hackathon" className="bg-slate-900">Hackathon</option>
              <option value="sports" className="bg-slate-900">Sports</option>
              <option value="cultural" className="bg-slate-900">Cultural</option>
              <option value="technical" className="bg-slate-900">Technical</option>
              <option value="food" className="bg-slate-900">Food</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-300 appearance-none"
            >
              <option value="" className="bg-slate-900">All Status</option>
              <option value="true" className="bg-slate-900">Active</option>
              <option value="false" className="bg-slate-900">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          <p className="ml-4 text-slate-400">Loading events...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-2 text-red-400 hover:text-red-300 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && events.length === 0 && (
        <div className="glass-card p-12 text-center rounded-xl border border-white/10">
          <FaCalendarAlt className="text-slate-600 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
          <p className="text-slate-400">No events match your filters</p>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="glass-card rounded-xl border border-white/10 overflow-hidden hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex-1 group-hover:text-cyan-400 transition-colors">{event.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <FaCalendarAlt className="text-cyan-500" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <FaMapMarkerAlt className="text-red-500" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <FaUsers className="text-green-500" />
                    <span>{event.minTeamSize}-{event.maxTeamSize} members/team</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <FaMoneyBillWave className="text-yellow-500" />
                    <span>₹{event.registrationFeePerMember}/member</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{event.stats?.totalTeamsRegistered || 0}</div>
                    <div className="text-xs text-slate-400">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{event.stats?.totalMembersRegistered || 0}</div>
                    <div className="text-xs text-slate-400">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{event.stats?.totalCheckedIn || 0}</div>
                    <div className="text-xs text-slate-400">Checked In</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    event.registrationOpen ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {event.registrationOpen ? <FaCheckCircle /> : <FaTimesCircle />}
                    {event.registrationOpen ? 'Open' : 'Closed'}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    event.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {event.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleViewQR(event._id)}
                  disabled={loadingQR}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                >
                  <FaQrcode />
                  {loadingQR ? 'Loading...' : 'View Canteen QR'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && qrEventData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
            <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-white">Event Canteen QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-slate-400 hover:text-white text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 bg-slate-900/50">
              <EventQRDisplay event={qrEventData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsTab;
