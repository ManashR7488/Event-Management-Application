import { useState, useMemo } from 'react';
import { FaTrash, FaClock, FaUsers, FaUser, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaSearch, FaFilter } from 'react-icons/fa';
import { formatCheckInTime } from '../utils/staffHelpers';

const CheckInHistory = ({ checkIns, onClear }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter checkIns based on search and status
  const filteredCheckIns = useMemo(() => {
    return checkIns.filter((checkIn) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        checkIn.member?.name?.toLowerCase().includes(searchLower) ||
        checkIn.member?.email?.toLowerCase().includes(searchLower) ||
        checkIn.team?.teamName?.toLowerCase().includes(searchLower);

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'success') {
        matchesStatus = checkIn.success && !checkIn.alreadyCheckedIn;
      } else if (statusFilter === 'already') {
        matchesStatus = checkIn.alreadyCheckedIn;
      } else if (statusFilter === 'failed') {
        matchesStatus = !checkIn.success && !checkIn.alreadyCheckedIn;
      }

      return matchesSearch && matchesStatus;
    });
  }, [checkIns, searchQuery, statusFilter]);

  if (checkIns.length === 0) {
    return (
      <div className="glass-card p-8 text-center flex flex-col items-center justify-center h-full border border-white/10">
        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
          <FaClock className="text-3xl text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">No Check-ins Yet</h3>
        <p className="text-slate-400 text-sm">
          Recent check-in history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card border border-white/10 overflow-hidden flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <FaClock className="text-cyan-400" />
            Recent Check-ins 
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-normal border border-white/10">
              {filteredCheckIns.length}/{checkIns.length}
            </span>
          </h3>
          {onClear && (
            <button
              onClick={onClear}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <FaTrash className="text-xs" />
              Clear
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            <input
              type="text"
              placeholder="Search by name, email, or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="already">Already</option>
              <option value="failed">Failed</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full">
          <thead className="bg-slate-900/50 sticky top-0 z-0 text-left">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Member</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Team</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCheckIns.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FaInfoCircle className="text-2xl text-slate-500 mb-2" />
                    <p className="text-slate-400 text-sm">No check-ins match your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCheckIns.map((checkIn) => (
              <tr key={checkIn.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-slate-800 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                      <FaUser className="text-xs" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                        {checkIn.member?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500 group-hover:text-slate-400">
                        {checkIn.member?.email || ''}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FaUsers className="text-xs" />
                    <span className="text-sm">
                      {checkIn.team?.teamName || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {checkIn.alreadyCheckedIn ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      <FaInfoCircle className="text-[10px]" /> Already
                    </span>
                  ) : checkIn.success ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                      <FaCheckCircle className="text-[10px]" /> Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                      <FaTimesCircle className="text-[10px]" /> Failed
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-slate-500 font-mono">
                  {formatCheckInTime(checkIn.timestamp)}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {filteredCheckIns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaInfoCircle className="text-3xl text-slate-500 mb-3" />
            <p className="text-slate-400 text-sm">No check-ins match your filters</p>
          </div>
        ) : (
          filteredCheckIns.map((checkIn) => (
          <div key={checkIn.id} className="bg-white/5 border border-white/10 rounded-xl p-4 active:scale-98 transition-transform">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <FaUser className="text-xs" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">
                    {checkIn.member?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {checkIn.team?.teamName || 'N/A'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {formatCheckInTime(checkIn.timestamp)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 truncate max-w-[150px]">
                {checkIn.member?.email}
              </p>
              {checkIn.alreadyCheckedIn ? (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  Already Checked In
                </span>
              ) : checkIn.success ? (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                  Successful
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  Failed
                </span>
              )}
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CheckInHistory;
