import { FaUsers, FaCheckCircle, FaClock, FaDollarSign, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';

const TeamCard = ({ team, onClick }) => {
  const checkedInCount = team.members?.filter(m => m.isCheckedIn).length || 0;
  const totalMembers = team.members?.length || 0;
  const checkedInPercentage = totalMembers > 0 ? (checkedInCount / totalMembers) * 100 : 0;

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-orange-500/20', border: 'border-orange-500/20', text: 'text-orange-300', label: 'Pending' },
      completed: { bg: 'bg-green-500/20', border: 'border-green-500/20', text: 'text-green-300', label: 'Paid' },
      failed: { bg: 'bg-red-500/20', border: 'border-red-500/20', text: 'text-red-300', label: 'Failed' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`flex items-center gap-1.5 px-2.5 py-1 ${config.bg} border ${config.border} ${config.text} text-xs font-medium rounded-full backdrop-blur-sm`}>
        <FaDollarSign className="text-[10px]" />
        {config.label}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className="glass-card hover:bg-slate-800/50 border border-white/5 rounded-xl p-5 hover:border-cyan-500/30 transition-all cursor-pointer group relative overflow-hidden"
    >
      {/* Hover Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors truncate pr-2">
            {team.teamName}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-400">
            <FaCalendarAlt className="text-xs text-blue-400" />
            <span className="truncate">{team.eventId?.name || 'Unknown Event'}</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-all">
           <FaChevronRight size={12} />
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4 mb-5 relative z-10">
        {/* Member Count */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="flex items-center gap-2.5 text-slate-300">
            <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-400">
                <FaUsers size={12} />
            </div>
            <span className="text-sm font-medium">Members</span>
          </div>
          <span className="font-bold text-white">{totalMembers}</span>
        </div>

        {/* Check-in Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <FaCheckCircle className="text-emerald-500 text-xs" />
              <span className="text-xs font-medium uppercase tracking-wider">Check-in</span>
            </div>
            <span className="text-xs font-bold text-slate-200">
              {checkedInCount}/{totalMembers}
            </span>
          </div>
          <div className="w-full bg-slate-900/50 rounded-full h-1.5 border border-white/5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              style={{ width: `${checkedInPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
        <div className="text-sm">
          <span className="text-slate-500 mr-2">Fee:</span>
          <span className="font-bold text-white tracking-wide">
            ₹{team.paymentMetadata?.totalAmount || 0}
          </span>
        </div>
        {getPaymentStatusBadge(team.paymentMetadata?.status)}
      </div>

      {/* Lead Info */}
      {team.leadName && (
        <div className="mt-3 pt-3 border-t border-white/5 relative z-10">
          <p className="text-xs text-slate-500 truncate">
            Lead: <span className="text-slate-300 font-medium ml-1">{team.leadName}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamCard;
