import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaQrcode } from 'react-icons/fa';
import { getAllEvents, getEventCanteenQR } from '../../../api/eventService';
import { toast } from 'react-hot-toast';
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
      hackathon: 'bg-purple-100 text-purple-800',
      sports: 'bg-green-100 text-green-800',
      cultural: 'bg-pink-100 text-pink-800',
      technical: 'bg-blue-100 text-blue-800',
      food: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
        <h2 className="text-2xl font-bold text-gray-800">Events Overview</h2>
        <p className="text-gray-600 mt-1">View all platform events</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="hackathon">Hackathon</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="technical">Technical</option>
              <option value="food">Food</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading events...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && events.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FaCalendarAlt className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No events found</h3>
          <p className="text-gray-600">No events match your filters</p>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex-1">{event.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendarAlt className="text-blue-500" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaMapMarkerAlt className="text-red-500" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaUsers className="text-green-500" />
                    <span>{event.minTeamSize}-{event.maxTeamSize} members/team</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaMoneyBillWave className="text-yellow-500" />
                    <span>₹{event.registrationFeePerMember}/member</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{event.stats?.totalTeams || 0}</div>
                    <div className="text-xs text-gray-600">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{event.stats?.totalMembers || 0}</div>
                    <div className="text-xs text-gray-600">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{event.stats?.checkedIn || 0}</div>
                    <div className="text-xs text-gray-600">Checked In</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    event.registrationOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.registrationOpen ? <FaCheckCircle /> : <FaTimesCircle />}
                    {event.registrationOpen ? 'Open' : 'Closed'}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    event.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleViewQR(event._id)}
                  disabled={loadingQR}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Event Canteen QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <EventQRDisplay event={qrEventData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsTab;
