import { QRCodeCanvas } from 'qrcode.react';
import { FaDownload, FaCheckCircle, FaClock } from 'react-icons/fa';
import { downloadQRCode } from '../utils/qrHelpers';

const QRCodeDisplay = ({ member, teamName, eventName }) => {
  const handleDownload = () => {
    downloadQRCode(member.qrToken, member.name);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{member.name}</h3>
          <p className="text-sm text-gray-600">{member.email}</p>
        </div>
        {member.isCheckedIn ? (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            <FaCheckCircle className="text-xs" />
            Checked In
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            <FaClock className="text-xs" />
            Pending
          </span>
        )}
      </div>

      {/* QR Code */}
      <div className="flex justify-center my-4 bg-white p-3 rounded-lg border border-gray-100">
        <QRCodeCanvas
          id={`qr-${member.qrToken}`}
          value={member.qrToken}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>

      {/* Member Details */}
      <div className="space-y-1 mb-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">College:</span>
          <span className="text-gray-800 font-medium">{member.college}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Roll No:</span>
          <span className="text-gray-800 font-medium">{member.rollNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Team:</span>
          <span className="text-gray-800 font-medium">{teamName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Event:</span>
          <span className="text-gray-800 font-medium">{eventName}</span>
        </div>
      </div>

      {/* Check-in Time */}
      {member.isCheckedIn && member.checkInTime && (
        <div className="mb-3 p-2 bg-green-50 rounded-md">
          <p className="text-xs text-green-700">
            Checked in: {new Date(member.checkInTime).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <FaDownload className="text-sm" />
        Download QR Code
      </button>
    </div>
  );
};

export default QRCodeDisplay;
