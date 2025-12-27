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
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: FaInfoCircle,
        iconColor: 'text-yellow-600',
        title: 'Already Checked In',
        message: 'This member was previously checked in',
      };
    } else if (result.success) {
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: FaCheckCircle,
        iconColor: 'text-green-600',
        title: 'Check-in Successful!',
        message: 'Member has been checked in',
      };
    } else {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: FaTimesCircle,
        iconColor: 'text-red-600',
        title: 'Check-in Failed',
        message: result.error || 'An error occurred',
      };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;
  const member = result.member || {};
  const team = result.team || {};

  return (
    <div
      className={`${config.bg} border-2 ${config.border} rounded-lg p-4 shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <StatusIcon className={`text-2xl ${config.iconColor}`} />
          <div>
            <h3 className={`font-bold ${config.text}`}>{config.title}</h3>
            <p className={`text-sm ${config.text}`}>{config.message}</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className={`p-1 rounded-full hover:bg-white/50 transition-colors ${config.text}`}
        >
          <FaTimes />
        </button>
      </div>

      {(member.name || team.teamName) && (
        <div className={`mt-3 pt-3 border-t ${config.border} space-y-1`}>
          {member.name && (
            <div className="flex justify-between text-sm">
              <span className={`${config.text} font-medium`}>Member:</span>
              <span className={config.text}>{member.name}</span>
            </div>
          )}
          {member.email && (
            <div className="flex justify-between text-sm">
              <span className={`${config.text} font-medium`}>Email:</span>
              <span className={config.text}>{member.email}</span>
            </div>
          )}
          {team.teamName && (
            <div className="flex justify-between text-sm">
              <span className={`${config.text} font-medium`}>Team:</span>
              <span className={config.text}>{team.teamName}</span>
            </div>
          )}
          {result.checkInTime && (
            <div className="flex justify-between text-sm">
              <span className={`${config.text} font-medium`}>Time:</span>
              <span className={config.text}>
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
