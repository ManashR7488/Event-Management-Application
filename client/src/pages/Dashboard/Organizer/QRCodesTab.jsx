import { useState, useEffect } from 'react';
import { FaQrcode, FaSearch, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllEvents, getEventCanteenQR } from '../../../api/eventService';
import EventQRDisplay from '../../../components/EventQRDisplay';
import EventQRInstructions from '../../../components/EventQRInstructions';
import { formatDate } from '../../../utils/qrHelpers';

const QRCodesTab = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [loadingQR, setLoadingQR] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEvents(filtered);
    } else {
      // Sort: active events first, then by start date
      const sorted = [...events].sort((a, b) => {
        if (a.isActive !== b.isActive) return b.isActive - a.isActive;
        return new Date(b.startDate) - new Date(a.startDate);
      });
      setFilteredEvents(sorted);
    }
  }, [searchTerm, events]);

  const fetchEvents = async () => {
    setIsLoading(true);
    const result = await getAllEvents();
    if (result.success) {
      setEvents(result.data || []);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleViewQR = async (eventId) => {
    setLoadingQR(true);
    const result = await getEventCanteenQR(eventId);
    
    if (result.success) {
      setSelectedEvent(result.data);
      setShowModal(true);
    } else {
      toast.error(result.error);
    }
    setLoadingQR(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const getStatusBadge = (event) => {
    if (!event.isActive) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Inactive</span>;
    }
    if (event.registrationOpen) {
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Open</span>;
    }
    return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Active</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Event QR Codes</h2>
          <p className="text-gray-600 mt-1">Download and print canteen QR codes for your events</p>
        </div>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {showInstructions ? 'Hide' : 'Show'} Instructions
        </button>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="mb-6">
          <EventQRInstructions />
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search events by name or venue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <FaQrcode className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No events available</p>
          <p className="text-gray-500 text-sm mt-2">Events will appear here once they are created</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex-1">{event.name}</h3>
                {getStatusBadge(event)}
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <p><span className="font-medium">Venue:</span> {event.venue}</p>
                <p><span className="font-medium">Dates:</span> {formatDate(event.startDate)} - {formatDate(event.endDate)}</p>
                <p><span className="font-medium">Type:</span> <span className="capitalize">{event.type || 'General'}</span></p>
              </div>

              <button
                onClick={() => handleViewQR(event._id)}
                disabled={loadingQR}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
              >
                <FaQrcode />
                {loadingQR ? 'Loading...' : 'View Canteen QR'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Event Canteen QR Code</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <EventQRDisplay event={selectedEvent} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodesTab;
