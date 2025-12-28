import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaUsers,
  FaClipboardList,
  FaUtensils,
  FaSignOutAlt,
  FaUserCircle,
  FaCalendarAlt,
  FaQrcode,
} from "react-icons/fa";
import useAuthStore from "../../../store/authStore";
import useOrganizerStore from "../../../store/organizerStore";
import { getAllEvents } from "../../../api/eventService";
import OverviewTab from "./OverviewTab";
import EventsTab from "./EventsTab";
import QRCodesTab from "./QRCodesTab";
import TeamsTab from "./TeamsTab";
import AttendanceTab from "./AttendanceTab";
import FoodReportsTab from "./FoodReportsTab";

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { selectedEvent, setSelectedEvent, clearData, fetchTeams } =
    useOrganizerStore();

  const [activeTab, setActiveTab] = useState("overview");
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
        if (
          !hasUserSelectedEvent.current &&
          !selectedEvent &&
          result.data.length > 0
        ) {
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
    navigate("/login");
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    const event = events.find((ev) => ev._id === eventId);
    hasUserSelectedEvent.current = true;
    setSelectedEvent(event || null);
    clearData();
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <FaChartLine /> },
    { id: "events", label: "Events", icon: <FaCalendarAlt /> },
    { id: "qrcodes", label: "QR Codes", icon: <FaQrcode /> },
    { id: "teams", label: "Teams", icon: <FaUsers /> },
    { id: "attendance", label: "Attendance", icon: <FaClipboardList /> },
    { id: "food", label: "Food Reports", icon: <FaUtensils /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 relative  pt-20">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animate-delay-2000"></div>
        <div className="absolute top-[40%] left-[40%] w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animate-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <div className="glass-card border-b border-white/10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Title and User Info */}
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Organizer Dashboard
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <FaUserCircle className="text-cyan-400" />
                    <span className="text-sm text-slate-300">
                      {user?.name || user?.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Selector and Logout */}
              <div className="flex items-center gap-4">
                {/* Event Selector */}
                <div className="min-w-64">
                  <select
                    value={selectedEvent?._id || ""}
                    onChange={handleEventChange}
                    disabled={isLoadingEvents}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white appearance-none cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    {isLoadingEvents ? (
                      <option className="bg-slate-900 text-slate-400">
                        Loading events...
                      </option>
                    ) : !Array.isArray(events) || events.length === 0 ? (
                      <option className="bg-slate-900 text-slate-400">
                        No events available
                      </option>
                    ) : (
                      <>
                        <option value="" className="bg-slate-900">
                          Select Event
                        </option>
                        {events.map((event) => (
                          <option
                            key={event._id}
                            value={event._id}
                            className="bg-slate-900"
                          >
                            {event.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-white/5 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
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
        <div className="flex-1 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!selectedEvent && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-6 backdrop-blur-sm">
                <p className="text-yellow-300 font-medium flex items-center gap-2">
                  <span>ℹ️</span> Please select an event to view dashboard data
                </p>
              </div>
            )}

            {/* Tab Content */}
            <div className="transition-all duration-300 animate-fade-in-up">
              {activeTab === "overview" && (
                <OverviewTab eventId={selectedEvent?._id} />
              )}
              {activeTab === "qrcodes" && <QRCodesTab />}
              {activeTab === "events" && <EventsTab />}
              {activeTab === "teams" && (
                <TeamsTab eventId={selectedEvent?._id} />
              )}
              {activeTab === "attendance" && (
                <AttendanceTab eventId={selectedEvent?._id} />
              )}
              {activeTab === "food" && (
                <FoodReportsTab eventId={selectedEvent?._id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
