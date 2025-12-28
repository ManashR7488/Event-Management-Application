import { QRCodeCanvas } from 'qrcode.react';
import { FaDownload, FaCheckCircle, FaClock } from 'react-icons/fa';
import { downloadQRCode } from '../utils/qrHelpers';

const QRCodeDisplay = ({ member, teamName, eventName }) => {
  const handleDownload = () => {
    downloadQRCode(member.qrToken, member.name);
  };

  return (
    <div className="glass-card border border-white/5 rounded-xl p-5 hover:border-cyan-500/30 transition-all relative group overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-bold text-white truncate">{member.name}</h3>
          <p className="text-sm text-slate-400 truncate">{member.email}</p>
        </div>
        {member.isCheckedIn ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-medium rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <FaCheckCircle className="text-xs" />
            Checked In
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-400 border border-white/5 text-xs font-medium rounded-full">
            <FaClock className="text-xs" />
            Pending
          </span>
        )}
      </div>

      {/* QR Code */}
      <div className="flex justify-center my-5 relative z-10">
         <div className="p-3 bg-white rounded-xl shadow-lg shadow-black/20">
            <QRCodeCanvas
            id={`qr-${member.qrToken}`}
            value={member.qrToken}
            size={180}
            level="H"
            includeMargin={false}
            />
         </div>
      </div>

      {/* Member Details */}
      <div className="space-y-2 mb-4 text-sm relative z-10 bg-slate-950/30 p-3 rounded-lg border border-white/5">
        <div className="flex justify-between">
          <span className="text-slate-500">College</span>
          <span className="text-slate-200 font-medium truncate max-w-[150px]">{member.college}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Roll No</span>
          <span className="text-slate-200 font-medium">{member.rollNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Team</span>
          <span className="text-slate-200 font-medium truncate max-w-[150px]">{teamName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Event</span>
          <span className="text-slate-200 font-medium truncate max-w-[150px]">{eventName}</span>
        </div>
      </div>

      {/* Check-in Time */}
      {member.isCheckedIn && member.checkInTime && (
        <div className="mb-4 p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/10 relative z-10">
          <p className="text-xs text-emerald-400 text-center font-medium">
            Checked in at {new Date(member.checkInTime).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-slate-200 rounded-xl hover:bg-white hover:text-slate-900 transition-all font-bold relative z-10 border border-white/5 hover:border-white shadow-lg"
      >
        <FaDownload className="text-sm" />
        Download QR
      </button>
    </div>
  );
};

export default QRCodeDisplay;
