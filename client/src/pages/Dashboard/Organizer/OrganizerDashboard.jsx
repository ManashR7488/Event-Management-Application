import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaUsers, FaClipboardList, FaUtensils, FaSignOutAlt, FaUserCircle, FaCalendarAlt, FaQrcode } from 'react-icons/fa';
import useAuthStore from '../../../store/authStore';
import useOrganizerStore from '../../../store/organizerStore';
import { getAllEvents } from '../../../api/eventService';
import OverviewTab from './OverviewTab';
import EventsTab from './EventsTab';
import QRCodesTab from './QRCodesTab';
import TeamsTab from './TeamsTab';
import AttendanceTab from './AttendanceTab';
import FoodReportsTab from './FoodReportsTab';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { selectedEvent, setSelectedEvent, clearData, fetchTeams } = useOrganizerStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const hasUserSelectedEvent = useRef(false);

  // Fetch all events on mount
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoadingEvents(true);
      const result = await getAllEvents();
      setIsLoadingEvents(false);
      
      if (result.success && result.data) {
        setEvents(result.data);
        // Auto-select first event only on initial load if user hasn't made a choice
        if (!hasUserSelectedEvent.current && !selectedEvent && result.data.length > 0) {
          setSelectedEvent(result.data[0]);
        }
      }
    };
    
    loadEvents();
  }, [setSelectedEvent]);

  // Fetch teams for filter options when event changes
  useEffect(() => {
    if (selectedEvent?._id) {
      fetchTeams(selectedEvent._id, { page: 1, limit: 100 });
    }
  }, [selectedEvent, fetchTeams]);

  const handleLogout = async () => {
    await logout();
    clearData();
    navigate('/login');
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    const event = events.find(ev => ev._id === eventId);
    hasUserSelectedEvent.current = true;
    setSelectedEvent(event || null);
    clearData();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
    { id: 'events', label: 'Events', icon: <FaCalendarAlt /> },
    { id: 'qrcodes', label: 'QR Codes', icon: <FaQrcode /> },
    { id: 'teams', label: 'Teams', icon: <FaUsers /> },
    { id: 'attendance', label: 'Attendance', icon: <FaClipboardList /> },
    { id: 'food', label: 'Food Reports', icon: <FaUtensils /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Title and User Info */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Organizer Dashboard</h1>
                <div className="flex items-center gap-2 mt-1">
                  <FaUserCircle className="text-gray-500" />
                  <span className="text-sm text-gray-600">{user?.name || user?.email}</span>
                </div>
              </div>
            </div>

            {/* Event Selector and Logout */}
            <div className="flex items-center gap-4">
              {/* Event Selector */}
              <div className="min-w-62.5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Select Event
                </label>
                <select
                  value={selectedEvent?._id || ''}
                  onChange={handleEventChange}
                  disabled={isLoadingEvents}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 font-medium"
                >
                  {isLoadingEvents ? (
                    <option>Loading events...</option>
                  ) : !Array.isArray(events) || events.length === 0 ? (
                    <option>No events available</option>
                  ) : (
                    <>
                      <option value="">All Events</option>
                      {events.map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedEvent && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <p className="text-yellow-800 font-medium">
              ℹ️ Please select an event to view dashboard data
            </p>
          </div>
        )}

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'overview' && <OverviewTab eventId={selectedEvent?._id} />}
          {activeTab === 'qrcodes' && <QRCodesTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'teams' && <TeamsTab eventId={selectedEvent?._id} />}
          {activeTab === 'attendance' && <AttendanceTab eventId={selectedEvent?._id} />}
          {activeTab === 'food' && <FoodReportsTab eventId={selectedEvent?._id} />}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
