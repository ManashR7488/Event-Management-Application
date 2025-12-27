import { FaUsers, FaCheckCircle, FaClock, FaDollarSign, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';

const TeamCard = ({ team, onClick }) => {
  const checkedInCount = team.members?.filter(m => m.isCheckedIn).length || 0;
  const totalMembers = team.members?.length || 0;
  const checkedInPercentage = totalMembers > 0 ? (checkedInCount / totalMembers) * 100 : 0;

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Pending' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`flex items-center gap-1 px-2 py-1 ${config.bg} ${config.text} text-xs rounded-full`}>
        <FaDollarSign className="text-xs" />
        {config.label}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {team.teamName}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <FaCalendarAlt className="text-xs" />
            <span>{team.eventId?.name || 'Unknown Event'}</span>
          </div>
        </div>
        <FaChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        {/* Member Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <FaUsers className="text-blue-500" />
            <span className="text-sm">Team Members</span>
          </div>
          <span className="font-semibold text-gray-800">{totalMembers}</span>
        </div>

        {/* Check-in Progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-gray-700">
              <FaCheckCircle className="text-green-500" />
              <span className="text-sm">Check-in Status</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {checkedInCount}/{totalMembers}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${checkedInPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-sm">
          <span className="text-gray-600">Total Fee: </span>
          <span className="font-semibold text-gray-800">
            ₹{team.paymentMetadata?.totalAmount || 0}
          </span>
        </div>
        {getPaymentStatusBadge(team.paymentMetadata?.status)}
      </div>

      {/* Lead Info */}
      {team.leadName && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600">
            Lead: <span className="text-gray-800 font-medium">{team.leadName}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamCard;
