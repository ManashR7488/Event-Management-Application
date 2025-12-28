import { useState, useEffect } from 'react';
import { FaQrcode, FaSearch, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
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
      return <span className="px-3 py-1 bg-slate-500/20 text-slate-300 text-xs font-medium rounded-full border border-slate-500/20">Inactive</span>;
    }
    if (event.registrationOpen) {
      return <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full border border-green-500/20">Open</span>;
    }
    return <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full border border-blue-500/20">Active</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Event QR Codes</h2>
          <p className="text-slate-400 mt-1">Download and print canteen QR codes for your events</p>
        </div>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="px-4 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium"
        >
          {showInstructions ? 'Hide' : 'Show'} Instructions
        </button>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="mb-6 glass-card p-4">
          <EventQRInstructions />
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search events by name or venue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-500"
        />
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 glass-card">
          <FaQrcode className="text-6xl text-slate-500 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">No events available</p>
          <p className="text-slate-500 text-sm mt-2">Events will appear here once they are created</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="glass-card p-6 hover:border-cyan-500/30 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white flex-1 group-hover:text-cyan-400 transition-colors">{event.name}</h3>
                {getStatusBadge(event)}
              </div>

              <div className="space-y-2 mb-4 text-sm text-slate-400">
                <p><span className="font-medium text-slate-300">Venue:</span> {event.venue}</p>
                <p><span className="font-medium text-slate-300">Dates:</span> {formatDate(event.startDate)} - {formatDate(event.endDate)}</p>
                <p><span className="font-medium text-slate-300">Type:</span> <span className="capitalize">{event.type || 'General'}</span></p>
              </div>

              <button
                onClick={() => handleViewQR(event._id)}
                disabled={loadingQR}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-cyan-500/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="sticky top-0 glass-card bg-opacity-90 border-b border-white/10 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-white">Event Canteen QR Code</h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white text-2xl font-bold transition-colors"
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
