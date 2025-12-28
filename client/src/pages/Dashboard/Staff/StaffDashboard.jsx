import { useState, useEffect } from 'react';
import { FaCamera, FaKeyboard, FaSignOutAlt, FaUserCircle, FaQrcode, FaCheckCircle, FaChartLine, FaCalendarAlt, FaHistory } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuthStore from '../../../store/authStore';
import useStaffStore from '../../../store/staffStore';
import QRScanner from '../../../components/QRScanner';
import ManualQRInput from '../../../components/ManualQRInput';
import CheckInResultCard from '../../../components/CheckInResultCard';
import CheckInHistory from '../../../components/CheckInHistory';
import { scanMemberQR } from '../../../api/checkinService';
import { getAllEvents } from '../../../api/eventService';
import { validateQRToken, calculateSuccessRate } from '../../../utils/staffHelpers';

const StaffDashboard = () => {
  const { user, logout } = useAuthStore();
  const { 
    recentCheckIns, 
    todayStats, 
    selectedEvent,
    setSelectedEvent,
    addCheckIn, 
    updateStats, 
    clearRecentCheckIns,
    setScanning 
  } = useStaffStore();

  /* 
    State for Mobile Navigation
    'home':   Stats & Event Selection
    'scan':   Scanner & Manual Input
    'history': Recent Check-ins
  */
  const [mobileTab, setMobileTab] = useState('home'); 

  // ... (keep default scanMode state) ...
  const [scanMode, setScanMode] = useState('camera'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // ... (keep useEffect & fetchEvents) ...
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    const result = await getAllEvents({ isActive: 'true' });
    setLoadingEvents(false);

    if (result.success) {
      setEvents(result.data || []);
      // Auto-select first event if no event is selected
      if (!selectedEvent && result.data && result.data.length > 0) {
        setSelectedEvent(result.data[0]);
      }
    } else {
      toast.error('Failed to load events');
    }
  };

  const handleEventChange = (eventId) => {
    const event = events.find(e => e._id === eventId);
    if (event) {
      setSelectedEvent(event);
      toast.success(`Switched to ${event.name}`);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleScan = async (qrToken) => {
    // Prevent duplicate scans while processing
    if (isProcessing) return;

    // Block scanning if no event is selected
    if (!selectedEvent) {
      toast.error('Please select an event before scanning');
      return;
    }

    // Validate token
    const validation = validateQRToken(qrToken);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsProcessing(true);
    setScanning(true);

    try {
      const result = await scanMemberQR(qrToken, selectedEvent._id);

      if (result.success) {
        // Merge success and alreadyCheckedIn flags into the data
        const checkInPayload = {
          ...result.data,
          success: true,
          alreadyCheckedIn: result.alreadyCheckedIn ?? false,
          message: result.message
        };
        
        // Add to check-ins history
        addCheckIn(checkInPayload);
        
        // Update stats based on result
        if (result.alreadyCheckedIn) {
          updateStats('alreadyCheckedIn');
          toast.info('Member already checked in');
        } else {
          updateStats('success');
          toast.success('Check-in successful!');
        }

        // Show result card
        setCurrentResult(checkInPayload);
        // If on scan tab, result shows there. If not, maybe switch? 
        // For now, keep user context where they are, result card handles display.
      } else {
        updateStats('error');
        toast.error(result.error);
        setCurrentResult({ success: false, error: result.error });
      }
    } catch (error) {
      updateStats('error');
      toast.error('An unexpected error occurred');
      setCurrentResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setIsProcessing(false);
      setScanning(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the check-in history?')) {
      clearRecentCheckIns();
      toast.success('History cleared');
    }
  };

  const successRate = calculateSuccessRate(
    todayStats.totalScans,
    todayStats.successfulCheckIns
  );

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden pt-25">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animate-delay-2000"></div>
        <div className="absolute top-[40%] right-[40%] w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animate-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header - Hidden on Mobile Scan/History tabs */}
        <div className={`glass-card border-b border-white/10 backdrop-blur-md sticky top-0 z-50 ${mobileTab !== 'home' ? 'hidden md:block' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
              <div className="flex items-center justify-between w-full md:w-auto">
                <div className="text-left">
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Staff Dashboard</h1>
                  <p className="text-xs md:text-sm text-slate-400 mt-0.5">Scan QR codes to check in</p>
                </div>
                {/* Mobile User/Logout (Compact) */}
                <div className="flex items-center gap-3 md:hidden">
                   {/* <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 border border-white/10">
                      <FaUserCircle size={20} />
                   </div>
                   <button
                    onClick={handleLogout}
                    className="p-2 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20"
                  >
                    <FaSignOutAlt size={16} />
                  </button> */}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
                {/* Event Selector - Hidden on Mobile, Visible on Desktop */}
                <div className="hidden md:flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg border border-white/10">
                  <FaCalendarAlt className="text-cyan-400 shrink-0" />
                  <select
                    value={selectedEvent?._id || ''}
                    onChange={(e) => handleEventChange(e.target.value)}
                    disabled={loadingEvents}
                    className="bg-transparent border-none outline-none text-sm font-medium text-white cursor-pointer appearance-none min-w-[150px]"
                  >
                    {loadingEvents ? (
                      <option className="bg-slate-900">Loading events...</option>
                    ) : events.length === 0 ? (
                      <option className="bg-slate-900">No active events</option>
                    ) : (
                      <>
                        <option value="" className="bg-slate-900">Select Event</option>
                        {events.map((event) => (
                          <option key={event._id} value={event._id} className="bg-slate-900">
                            {event.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {/* Desktop User Info & Logout */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FaUserCircle className="text-2xl text-cyan-400" />
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-slate-400">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    title="Logout"
                  >
                    <FaSignOutAlt size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Event Banner - Visible on Desktop mostly, or Mobile Home */}
            {selectedEvent && (
              <div className="hidden md:block mt-3 md:mt-4 p-2.5 md:p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] md:text-xs text-blue-400 font-medium uppercase tracking-wider">Active Event</p>
                    <p className="text-sm md:text-base font-bold text-white mt-0.5">{selectedEvent.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] md:text-xs text-blue-400 uppercase tracking-wider">Venue</p>
                    <p className="text-xs md:text-sm font-medium text-white max-w-[150px] truncate">{selectedEvent.venue}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 space-y-6 md:space-y-8">
            
            {/* MOBILE HOME TAB CONTENT */}
            <div className={`space-y-6 ${mobileTab === 'home' ? 'block' : 'hidden'} md:block`}>
               {/* Mobile Event Selector & Banner */}
               <div className="md:hidden space-y-4">
                  <div className="glass-card p-4 border border-white/10">
                    <label className="text-xs text-slate-400 font-medium uppercase mb-2 block">Select Active Event</label>
                    <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-3 rounded-xl border border-white/5">
                      <FaCalendarAlt className="text-cyan-400 text-lg" />
                      <select
                        value={selectedEvent?._id || ''}
                        onChange={(e) => handleEventChange(e.target.value)}
                        disabled={loadingEvents}
                        className="bg-transparent border-none outline-none text-base font-medium text-white cursor-pointer appearance-none w-full"
                      >
                        {loadingEvents ? (
                          <option className="bg-slate-900">Loading events...</option>
                        ) : events.length === 0 ? (
                          <option className="bg-slate-900">No active events</option>
                        ) : (
                          <>
                            <option value="" className="bg-slate-900">Select Event</option>
                            {events.map((event) => (
                              <option key={event._id} value={event._id} className="bg-slate-900">
                                {event.name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {selectedEvent && (
                    <div className="p-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/20 rounded-xl backdrop-blur-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-blue-300 font-medium uppercase tracking-wider mb-1">Current Event</p>
                          <h3 className="text-lg font-bold text-white leading-tight">{selectedEvent.name}</h3>
                          <p className="text-sm text-slate-300 mt-1 flex items-center gap-1">
                             <span className="text-blue-400">📍</span> {selectedEvent.venue}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
               </div>

               {/* Stats Grid - Full Grid on Mobile Home / Desktop */}
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="glass-card p-3 md:p-4 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-blue-300 uppercase font-medium">Total Scans</p>
                        <p className="text-xl md:text-2xl font-bold text-white mt-0.5">{todayStats.totalScans}</p>
                      </div>
                      <div className="self-end md:self-auto p-1.5 md:p-2 bg-blue-500/20 rounded-lg">
                        <FaQrcode className="text-lg md:text-xl text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-3 md:p-4 border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-green-300 uppercase font-medium">Successful</p>
                        <p className="text-xl md:text-2xl font-bold text-white mt-0.5">{todayStats.successfulCheckIns}</p>
                      </div>
                      <div className="self-end md:self-auto p-1.5 md:p-2 bg-green-500/20 rounded-lg">
                        <FaCheckCircle className="text-lg md:text-xl text-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-3 md:p-4 border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-cyan-300 uppercase font-medium">Success Rate</p>
                        <p className="text-xl md:text-2xl font-bold text-white mt-0.5">{successRate}%</p>
                      </div>
                      <div className="self-end md:self-auto p-1.5 md:p-2 bg-cyan-500/20 rounded-lg">
                        <FaChartLine className="text-lg md:text-xl text-cyan-400" />
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-3 md:p-4 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-red-300 uppercase font-medium">Errors</p>
                        <p className="text-xl md:text-2xl font-bold text-white mt-0.5">{todayStats.errors}</p>
                      </div>
                      <div className="self-end md:self-auto p-1.5 md:p-2 bg-red-500/20 rounded-lg">
                        <span className="text-lg md:text-xl">⚠️</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Scanner - Visible on Desktop or Mobile 'scan' tab */}
              <div className={`${mobileTab === 'scan' ? 'block' : 'hidden'} lg:block space-y-6 animate-fade-in`}>
                {/* Mode Toggle */}
                <div className="glass-card p-1">
                  <div className="flex">
                    <button
                      onClick={() => setScanMode('camera')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                        scanMode === 'camera'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <FaCamera />
                      Camera
                    </button>
                    <button
                      onClick={() => setScanMode('manual')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                        scanMode === 'manual'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <FaKeyboard />
                      Manual
                    </button>
                  </div>
                </div>

                {/* Scanner/Input Area */}
                <div className="relative z-0">
                  {scanMode === 'camera' ? (
                    <div className="space-y-4 animate-fade-in">
                      {!selectedEvent && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 backdrop-blur-sm">
                           <p className="text-sm text-yellow-300">⚠️ Please select an event to start scanning.</p>
                        </div>
                      )}
                      
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-sm text-blue-300 flex gap-2">
                          <span>📌</span>
                          <span>Click <strong>"Start Scanning"</strong> below. Your browser will request camera permission.</span>
                        </p>
                      </div>
                      <QRScanner
                        onScanSuccess={handleScan}
                        onScanError={(error) => console.error('Scan error:', error)}
                      />
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <ManualQRInput
                        onSubmit={handleScan}
                        isLoading={isProcessing}
                      />
                    </div>
                  )}
                </div>

                {/* Result Display */}
                {currentResult && (
                  <div className="animate-fade-in-up">
                    <CheckInResultCard
                      result={currentResult}
                      onDismiss={() => setCurrentResult(null)}
                    />
                  </div>
                )}
              </div>

              {/* Right Column: History - Visible on Desktop or Mobile 'history' tab */}
              <div className={`${mobileTab === 'history' ? 'block' : 'hidden'} lg:block h-full min-h-[500px] lg:h-[calc(100vh-300px)] lg:overflow-y-auto custom-scrollbar rounded-xl animate-fade-in`}>
                <CheckInHistory
                  checkIns={recentCheckIns}
                  onClear={handleClearHistory}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation 3-Tabs */}
        <div className="fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-xl border-t border-white/10 p-2 z-[100] md:hidden">
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setMobileTab('home')}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl w-full transition-all duration-300 ${
                mobileTab === 'home' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FaCalendarAlt className="text-lg" />
              <span className="text-[10px] font-medium">Home</span>
            </button>

            <button 
              onClick={() => setMobileTab('scan')}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl w-full transition-all duration-300 ${
                mobileTab === 'scan' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FaQrcode className={`text-lg ${mobileTab === 'scan' ? 'animate-pulse' : ''}`} />
              <span className="text-[10px] font-medium">Scan</span>
            </button>
            
            <button 
              onClick={() => setMobileTab('history')}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl w-full transition-all duration-300 ${
                mobileTab === 'history' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FaHistory className="text-lg" />
              <div className="relative">
                <span className="text-[10px] font-medium">History</span>
                {recentCheckIns.length > 0 && (
                   <span className="absolute -top-[18px] -right-[10px] bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-slate-900">
                     {recentCheckIns.length}
                   </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;


