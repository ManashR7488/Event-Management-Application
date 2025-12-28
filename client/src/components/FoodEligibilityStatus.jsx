import { FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import FoodEligibilitySuccessScreen from './FoodEligibilitySuccessScreen';

const FoodEligibilityStatus = ({ eligible, memberData, eventData, checkInTime, error, onScanAgain }) => {
  if (eligible) {
    return (
      <FoodEligibilitySuccessScreen
        memberData={memberData}
        eventData={eventData}
        checkInTime={checkInTime}
        onScanAgain={onScanAgain}
      />
    );
  }

  // Ineligible or Error State
  return (
    <div className="bg-red-500/10 border h-fit border-red-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden animate-fade-in-up">
       {/* Decorative Glow */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
       
      {/* Error Icon */}
      <div className="flex justify-center mb-6 relative z-10">
        <div className="bg-red-500/20 rounded-full p-6 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <FaTimesCircle className="text-red-400 text-6xl drop-shadow-md" />
        </div>
      </div>

      {/* Error Message */}
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Not Eligible
        </h2>
        <p className="text-red-300 text-lg font-medium">
          {error || 'You are not authorized to receive food at this time'}
        </p>
      </div>

      {/* Member Details (if available) */}
      {memberData && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 mb-6 relative z-10 backdrop-blur-sm">
          {memberData.memberName && (
            <div className="flex items-center gap-4 pb-4 border-b border-white/5">
              <div className="p-2.5 bg-red-500/10 rounded-lg">
                <FaUser className="text-red-400 text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Member</p>
                <p className="text-lg font-bold text-white">
                  {memberData.memberName}
                </p>
              </div>
            </div>
          )}

          {memberData.teamName && (
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-red-500/10 rounded-lg">
                <span className="text-red-400 text-xl">👥</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Team</p>
                <p className="text-lg font-bold text-white">
                  {memberData.teamName}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 relative z-10">
        <p className="text-sm text-red-300 font-bold mb-2 flex items-center gap-2">
           <span>📋</span> Common reasons for ineligibility:
        </p>
        <ul className="space-y-1.5 text-sm text-red-200/80 pl-1">
          <li>• Not checked in at the event gate</li>
          <li>• QR code is for a different event</li>
          <li>• Event is not currently active</li>
          <li>• Invalid or expired QR code</li>
        </ul>
      </div>
    </div>
  );
};

export default FoodEligibilityStatus;
