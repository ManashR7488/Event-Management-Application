import { QRCodeCanvas } from 'qrcode.react';
import { FaDownload, FaPrint, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import { downloadEventQR, formatDate } from '../utils/qrHelpers';

const EventQRDisplay = ({ event }) => {
  const handleDownload = () => {
    downloadEventQR(event.canteenQRToken, event.name);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (isActive, registrationOpen) => {
    if (!isActive) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">Inactive</span>;
    }
    if (registrationOpen) {
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Registration Open</span>;
    }
    return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Active</span>;
  };

  return (
    <div className="bg-white rounded-xl p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{event.name}</h2>
        <div className="flex justify-center items-center gap-2 mb-4">
          {getStatusBadge(event.isActive, event.registrationOpen)}
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
        <div className="flex items-center gap-2 text-gray-700">
          <FaMapMarkerAlt className="text-blue-600" />
          <span className="font-medium">Venue:</span>
          <span>{event.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <FaCalendar className="text-blue-600" />
          <span className="font-medium">Dates:</span>
          <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Event Canteen QR Code</h3>
        <p className="text-sm text-gray-600 mb-4">
          Display this QR at the canteen for participants to scan
        </p>
        
        <div className="inline-block p-6 bg-white border-4 border-blue-600 rounded-xl shadow-lg">
          <QRCodeCanvas
            id={`event-qr-${event.canteenQRToken}`}
            value={event.canteenQRToken}
            size={300}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">How to Use:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Download or print this QR code</li>
          <li>Display it prominently at the canteen entrance</li>
          <li>Participants scan this QR to check food eligibility</li>
          <li>System verifies their check-in status automatically</li>
          <li>Green tick = Eligible, Red error = Not checked in</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center print:hidden">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <FaDownload />
          Download QR Code
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          <FaPrint />
          Print QR Code
        </button>
      </div>
    </div>
  );
};

export default EventQRDisplay;
