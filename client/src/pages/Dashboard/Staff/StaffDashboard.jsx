import { useState, useEffect } from 'react';
import { FaCamera, FaKeyboard, FaSignOutAlt, FaUserCircle, FaQrcode, FaCheckCircle, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
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

  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">Staff Check-in Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Scan QR codes to check in members</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Event Selector */}
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <FaCalendarAlt className="text-blue-600" />
                <select
                  value={selectedEvent?._id || ''}
                  onChange={(e) => handleEventChange(e.target.value)}
                  disabled={loadingEvents}
                  className="bg-transparent border-none outline-none text-sm font-medium text-gray-800 cursor-pointer"
                >
                  {loadingEvents ? (
                    <option>Loading events...</option>
                  ) : events.length === 0 ? (
                    <option>No active events</option>
                  ) : (
                    <>
                      <option value="">Select Event</option>
                      {events.map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <FaUserCircle className="text-2xl text-blue-600" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Selected Event Banner */}
          {selectedEvent && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Currently Checking In For:</p>
                  <p className="text-sm font-bold text-blue-800 mt-1">{selectedEvent.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-600">Venue</p>
                  <p className="text-sm font-medium text-blue-800">{selectedEvent.venue}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {todayStats.totalScans}
                </p>
              </div>
              <FaQrcode className="text-3xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {todayStats.successfulCheckIns}
                </p>
              </div>
              <FaCheckCircle className="text-3xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {successRate}%
                </p>
              </div>
              <FaChartLine className="text-3xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {todayStats.errors}
                </p>
              </div>
              <div className="text-3xl text-red-500">⚠️</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Scanner */}
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Scan Mode</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setScanMode('camera')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    scanMode === 'camera'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaCamera />
                  Camera
                </button>
                <button
                  onClick={() => setScanMode('manual')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    scanMode === 'manual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaKeyboard />
                  Manual
                </button>
              </div>
            </div>

            {/* Scanner/Input Area */}
            {scanMode === 'camera' ? (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>📌 Quick Tip:</strong> Click "Start Scanning" to activate the camera. Your browser will automatically request camera permission - simply allow access to begin scanning.
                  </p>
                </div>
                <QRScanner
                  onScanSuccess={handleScan}
                  onScanError={(error) => console.error('Scan error:', error)}
                />
              </div>
            ) : (
              <ManualQRInput
                onSubmit={handleScan}
                isLoading={isProcessing}
              />
            )}

            {/* Result Display */}
            {currentResult && (
              <CheckInResultCard
                result={currentResult}
                onDismiss={() => setCurrentResult(null)}
              />
            )}

            {/* Camera Help Section */}
            {scanMode === 'camera' && (
              <details className="bg-yellow-50 border border-yellow-200 rounded-lg">
                <summary className="cursor-pointer p-3 text-sm font-medium text-yellow-800 hover:bg-yellow-100 transition-colors">
                  💡 Camera Troubleshooting
                </summary>
                <div className="p-3 pt-0 text-xs text-yellow-700 space-y-2">
                  <p><strong>Permission Denied?</strong> The camera permission is requested automatically. Click the lock/camera icon in your browser's address bar and allow access.</p>
                  <p><strong>Camera Not Working?</strong> Close other apps using the camera, refresh the page, or switch to Manual mode.</p>
                  <p><strong>Best Practice:</strong> Ensure good lighting and hold the QR code steady within the scanning frame.</p>
                </div>
              </details>
            )}
          </div>

          {/* Right Column: History */}
          <div>
            <CheckInHistory
              checkIns={recentCheckIns}
              onClear={handleClearHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
