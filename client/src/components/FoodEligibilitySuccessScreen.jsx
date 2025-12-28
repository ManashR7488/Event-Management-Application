import React, { useEffect, useState } from 'react';
import { FaCheck, FaUser, FaCalendarAlt, FaClock, FaQrcode } from 'react-icons/fa';

const FoodEligibilitySuccessScreen = ({ memberData, eventData, checkInTime, onScanAgain }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    // Trigger confetti animation on mount
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-fade-in">
      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-0 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                backgroundColor: ['#34d399', '#fcd34d', '#ffffff', '#60a5fa'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up flex flex-col items-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        {/* Animated Checkmark */}
        <div className="mb-6 relative z-10">
          <div className="w-28 h-28 bg-emerald-500/20 rounded-full flex items-center justify-center animate-pulse-slow shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <svg 
              className="w-16 h-16 text-emerald-400" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path 
                className="animate-checkmarkDraw" 
                strokeDasharray="100" 
                strokeDashoffset="100" 
                d="M20 6L9 17l-5-5" 
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-white mb-2 text-center animate-fade-in delay-300 relative z-10">
          Eligible for Food!
        </h1>
        <p className="text-emerald-300 text-center mb-8 animate-fade-in delay-500 font-medium relative z-10">
          Verification Successful
        </p>

        {/* Member Details Card */}
        <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10 mb-8 animate-fade-in delay-700 relative z-10">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <FaUser size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Member</p>
              <h3 className="text-white font-bold text-lg truncate">{memberData?.name || memberData?.memberName || 'Unknown Member'}</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/30 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-medium">
                <FaCalendarAlt />
                <span>Event</span>
              </div>
              <p className="text-white font-semibold text-sm truncate">{eventData?.name || 'Event'}</p>
            </div>
            
            <div className="bg-slate-950/30 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-medium">
                <FaClock />
                <span>Checked In</span>
              </div>
              <p className="text-white font-semibold text-sm">
                {checkInTime ? new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onScanAgain}
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 animate-fade-in delay-1000 relative z-10"
        >
          <FaQrcode size={20} />
          Scan Next Member
        </button>
      </div>
    </div>
  );
};

export default FoodEligibilitySuccessScreen;
