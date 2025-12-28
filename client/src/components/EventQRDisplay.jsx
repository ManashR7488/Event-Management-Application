import { QRCodeCanvas } from "qrcode.react";
import {
  FaDownload,
  FaPrint,
  FaCalendar,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { downloadEventQR, formatDate } from "../utils/qrHelpers";
const EventQRDisplay = ({ event }) => {
  const handleDownload = () => {
    downloadEventQR(event.canteenQRToken, event.name);
  };
  const handlePrint = () => {
    window.print();
  };
  const getStatusBadge = (isActive, registrationOpen) => {
    if (!isActive) {
      return (
        <span className="px-3 py-1 bg-slate-500/20 border border-slate-500/20 text-slate-300 text-sm font-medium rounded-full backdrop-blur-sm">
          Inactive
        </span>
      );
    }
    if (registrationOpen) {
      return (
        <span className="px-3 py-1 bg-green-500/20 border border-green-500/20 text-green-300 text-sm font-medium rounded-full backdrop-blur-sm shadow-[0_0_10px_rgba(74,222,128,0.2)]">
          Registration Open
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/20 text-blue-300 text-sm font-medium rounded-full backdrop-blur-sm shadow-[0_0_10px_rgba(96,165,250,0.2)]">
        Active
      </span>
    );
  };
  return (
    <div className="bg-slate-900 rounded-xl p-8 max-w-2xl mx-auto border border-white/10 relative overflow-hidden shadow-2xl">
      {/* Header */}{" "}
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 mb-3 tracking-tight">
          {event.name}
        </h2>
        <div className="flex justify-center items-center gap-2 mb-4">
          {getStatusBadge(event.isActive, event.registrationOpen)}
        </div>
      </div>
      {/* Event Details */}{" "}
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 mb-3 tracking-tight">
          {event.name}
        </h2>
        <div className="flex justify-center items-center gap-2 mb-4">
          {getStatusBadge(event.isActive, event.registrationOpen)}
        </div>
      </div>
      {/* Event Details */}{" "}
      <div className="bg-slate-950/50 border border-white/10 rounded-xl p-5 mb-8 space-y-3 relative z-10">
        <div className="flex items-center gap-3 text-slate-300">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <FaMapMarkerAlt />
          </div>
          <div>
            <span className="block text-xs text-slate-500 uppercase font-medium tracking-wider">
              Venue
            </span>
            <span className="font-medium text-white">{event.venue}</span>
          </div>
        </div>{" "}
        <div className="flex items-center gap-3 text-slate-300">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <FaCalendar />
          </div>
          <div>
            <span className="block text-xs text-slate-500 uppercase font-medium tracking-wider">
              Dates
            </span>
            <span className="font-medium text-white">
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
          </div>
        </div>
      </div>
      {/* QR Code Section */}{" "}
      <div className="text-center mb-8 relative z-10">
        <h3 className="text-xl font-semibold text-white mb-2">
          Event Canteen QR Code
        </h3>
        <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
          Display this QR code at the canteen entrance. Participants scan this
          to verify their eligibility for food.
        </p>{" "}
        <div className="inline-block p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)] border-4 border-cyan-500/50 relative group">
          <div className="relative bg-white rounded-lg p-2">
            <QRCodeCanvas
              id={`event-qr-${event.canteenQRToken}`}
              value={event.canteenQRToken}
              size={280}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>
      </div>
      {/* Usage Instructions */}{" "}
      <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-5 mb-8 relative z-10">
        <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs border border-blue-500/30">
            i
          </span>
          How to Use
        </h4>
        <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside marker:text-blue-500/50">
          <li>Download or print this QR code using the buttons below.</li>
          <li>Place it clearly at the food distribution counter.</li>
          <li>
            Participants will use the <strong>Scanner Tab</strong> in their app.
          </li>
          <li>A green tick ✅ confirms they are eligible for food.</li>
        </ol>
      </div>
      {/* Action Buttons */}{" "}
      <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden relative z-10">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-500/20 font-medium"
        >
          <FaDownload /> Download QR
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-slate-300 border border-white/10 rounded-xl hover:bg-slate-700 hover:text-white transition-all font-medium"
        >
          <FaPrint /> Print QR
        </button>
      </div>
    </div>
  );
};
export default EventQRDisplay;
