import { useEffect, useState } from 'react';
import { FaCheckCircle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

const CheckInResultCard = ({ result, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  };

  const getStatusConfig = () => {
    if (result.alreadyCheckedIn) {
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-400',
        subText: 'text-yellow-200/80',
        icon: FaInfoCircle,
        title: 'Already Checked In',
        message: 'This member was previously checked in',
        glow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]',
      };
    } else if (result.success) {
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-400',
        subText: 'text-green-200/80',
        icon: FaCheckCircle,
        title: 'Check-in Successful!',
        message: 'Member has been checked in',
        glow: 'shadow-[0_0_15px_rgba(74,222,128,0.2)]',
      };
    } else {
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-400',
        subText: 'text-red-200/80',
        icon: FaTimesCircle,
        title: 'Check-in Failed',
        message: result.error || 'An error occurred',
        glow: 'shadow-[0_0_15px_rgba(248,113,113,0.2)]',
      };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;
  const member = result.member || {};
  const team = result.team || {};

  return (
    <div
      className={`relative backdrop-blur-md rounded-xl p-5 border ${config.bg} ${config.border} ${config.glow} transition-all duration-300 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${config.bg} border ${config.border}`}>
            <StatusIcon className={`text-3xl ${config.text}`} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${config.text}`}>{config.title}</h3>
            <p className={`text-sm ${config.subText}`}>{config.message}</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className={`p-1 rounded-full hover:bg-white/10 transition-colors ${config.text} opacity-70 hover:opacity-100`}
        >
          <FaTimes />
        </button>
      </div>

      {(member.name || team.teamName) && (
        <div className={`mt-4 pt-4 border-t border-white/10 space-y-2`}>
          {member.name && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Member:</span>
              <span className="text-white font-semibold">{member.name}</span>
            </div>
          )}
          {member.email && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Email:</span>
              <span className="text-slate-200 font-mono text-xs">{member.email}</span>
            </div>
          )}
          {team.teamName && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Team:</span>
              <span className="text-cyan-400 font-medium">{team.teamName}</span>
            </div>
          )}
          {result.checkInTime && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Time:</span>
              <span className="text-slate-200">
                {new Date(result.checkInTime).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckInResultCard;
