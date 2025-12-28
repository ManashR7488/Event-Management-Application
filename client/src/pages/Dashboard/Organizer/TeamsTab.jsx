import { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight, FaSearch, FaFilter } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import useOrganizerStore from '../../../store/organizerStore';
import { formatDate, getStatusColor, formatCheckInStatus, getCheckInStatus } from '../../../utils/dashboardHelpers';

const TeamsTab = ({ eventId }) => {
  const { teams, teamsPagination, isLoading, errors, fetchTeams } = useOrganizerStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedTeam, setExpandedTeam] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    paymentStatus: searchParams.get('paymentStatus') || '',
    checkInStatus: searchParams.get('checkInStatus') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 10,
  });

  useEffect(() => {
    if (eventId) {
      fetchTeams(eventId, filters);
    }
  }, [eventId, filters, fetchTeams]);

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([k, v]) => {
      if (v && k !== 'limit') {
        params.set(k, v);
      }
    });
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      paymentStatus: '',
      checkInStatus: '',
      page: 1,
      limit: 10,
    };
    setFilters(resetFilters);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    searchParams.set('page', page);
    setSearchParams(searchParams);
  };

  const toggleTeamExpansion = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-500"
            />
          </div>

          {/* Payment Status Filter */}
          <div className="min-w-[200px]">
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Payment Status</option>
              <option value="pending" className="bg-slate-900">Pending</option>
              <option value="completed" className="bg-slate-900">Completed</option>
              <option value="failed" className="bg-slate-900">Failed</option>
            </select>
          </div>

          {/* Check-in Status Filter */}
          <div className="min-w-[200px]">
            <select
              value={filters.checkInStatus}
              onChange={(e) => handleFilterChange('checkInStatus', e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Check-in Status</option>
              <option value="none" className="bg-slate-900">None Checked In</option>
              <option value="partial" className="bg-slate-900">Partially Checked In</option>
              <option value="full" className="bg-slate-900">Fully Checked In</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg transition-colors border border-white/10"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="space-y-4">
        {!Array.isArray(teams) || teams.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-400">No teams found for this event</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
             <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">Team Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">Team Lead</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-cyan-300 uppercase tracking-wider">Members</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-cyan-300 uppercase tracking-wider">Checked In</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-cyan-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-cyan-300 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-cyan-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {teams.map((team) => {
                     const checkedInCount = team.members?.filter(m => m.isCheckedIn).length || 0;
                     const totalMembers = team.members?.length || 0;
                     const checkInStatus = getCheckInStatus(checkedInCount, totalMembers);
                     const paymentStatus = team.paymentStatus || team.paymentMetadata?.status || 'pending';

                    return (
                      <div key={team._id} style={{ display: 'contents' }}>
                        <tr className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 text-sm text-white font-medium">{team.teamName}</td>
                          <td className="px-6 py-4 text-sm text-slate-300">{team.leadEmail}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/20">
                              {team.members?.length || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-slate-300">
                             {checkedInCount} / {totalMembers}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              checkInStatus === 'full' ? 'bg-green-500/20 text-green-300 border-green-500/20' :
                              checkInStatus === 'partial' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20' :
                              'bg-slate-500/20 text-slate-300 border-slate-500/20'
                            }`}>
                              {formatCheckInStatus(checkInStatus)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              paymentStatus === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/20' :
                              paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20' :
                              'bg-red-500/20 text-red-300 border-red-500/20'
                            }`}>
                              {paymentStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button
                              onClick={() => toggleTeamExpansion(team._id)}
                              className="px-3 py-1 text-cyan-400 hover:text-cyan-300 flex items-center justify-end gap-1 transition-colors ml-auto"
                            >
                              {expandedTeam === team._id ? (
                                <>
                                  Hide <FaChevronUp />
                                </>
                              ) : (
                                <>
                                  View <FaChevronDown />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                        {/* Expanded Row */}
                        {expandedTeam === team._id && (
                          <tr>
                            <td colSpan="7" className="p-0 border-none">
                              <div className="bg-slate-900/50 p-6 border-y border-white/5 animate-fade-in-down">
                                <h4 className="text-sm font-bold text-cyan-400 mb-4 uppercase tracking-wider">
                                  Team Members ({team.members?.length || 0})
                                </h4>
                                {team.members && team.members.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {team.members.map((member, index) => (
                                      <div
                                        key={index}
                                        className="bg-slate-950/50 rounded-lg p-4 border border-white/5 hover:border-cyan-500/30 transition-colors"
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="font-semibold text-white">{member.name}</div>
                                          {member.isCheckedIn ? (
                                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] uppercase font-bold border border-green-500/20">
                                              Checked In
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 rounded-full text-[10px] uppercase font-bold border border-slate-500/20">
                                              Not Checked In
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-sm text-slate-400 space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-slate-600 text-xs uppercase">Email</span>
                                            <span className="truncate">{member.email}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-slate-600 text-xs uppercase">Phone</span>
                                            <span>{member.phone}</span>
                                          </div>
                                          {member.collegeName && (
                                            <div className="flex items-center gap-2">
                                              <span className="text-slate-600 text-xs uppercase">College</span>
                                              <span className="truncate" title={member.collegeName}>{member.collegeName}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-slate-500 italic">No members found</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </div>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {teamsPagination && teamsPagination.totalPages > 1 && (
        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              Showing {((teamsPagination.currentPage - 1) * teamsPagination.limit) + 1} to{' '}
              {Math.min(teamsPagination.currentPage * teamsPagination.limit, teamsPagination.total)} of{' '}
              {teamsPagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(teamsPagination.currentPage - 1)}
                disabled={teamsPagination.currentPage === 1}
                className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FaChevronLeft className="text-xs" />
                Previous
              </button>
              <div className="hidden sm:flex items-center gap-2">
                {Array.from({ length: teamsPagination.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    const distance = Math.abs(page - teamsPagination.currentPage);
                    return distance < 2 || page === 1 || page === teamsPagination.totalPages;
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    
                    return (
                      <div key={page} className="flex items-center gap-2">
                        {showEllipsis && (
                          <span className="text-slate-600">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === teamsPagination.currentPage
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                              : 'border border-white/10 text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>
              <button
                onClick={() => handlePageChange(teamsPagination.currentPage + 1)}
                disabled={teamsPagination.currentPage === teamsPagination.totalPages}
                className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Next
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading.teams && teams.length === 0 && (
        <div className="glass-card p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            <p className="text-slate-400">Loading teams...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {errors.teams && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          {errors.teams}
        </div>
      )}
    </div>
  );
};

export default TeamsTab;
