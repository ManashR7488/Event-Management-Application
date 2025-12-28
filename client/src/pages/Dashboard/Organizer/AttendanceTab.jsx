import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useOrganizerStore from '../../../store/organizerStore';
import ExportButton from '../../../components/Dashboard/ExportButton';
import { formatDate, getStatusColor } from '../../../utils/dashboardHelpers';
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const AttendanceTab = ({ eventId }) => {
  const { 
    attendanceLogs, 
    attendancePagination, 
    isLoading, 
    errors, 
    fetchAttendanceLogs,
    exportAttendanceCSV,
    teams 
  } = useOrganizerStore();

  const [filters, setFilters] = useState({
    search: '',
    teamId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
  });

  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchAttendanceLogs(eventId, filters);
    }
  }, [eventId, filters, fetchAttendanceLogs]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      teamId: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10,
    });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    const result = await exportAttendanceCSV(eventId, filters);
    setIsExporting(false);

    if (result.success) {
      toast.success('Attendance CSV exported successfully');
    } else {
      toast.error(result.error || 'Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Total Count and Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Attendance Logs</h2>
          {attendancePagination && (
            <p className="text-sm text-slate-400 mt-1">
              Total: {attendancePagination.total} records
            </p>
          )}
        </div>
        <ExportButton
          onExport={handleExportCSV}
          isLoading={isExporting}
          label="Export Attendance CSV"
          className="bg-green-600/20 text-green-300 border border-green-500/30 hover:bg-green-600/30"
        />
      </div>

      {/* Filter Panel - Inline implementation for Glassmorphism */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
           {/* Search */}
           <div className="flex-1 min-w-[200px] relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search member, email, token..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-500"
            />
          </div>

          {/* Team Filter */}
           <div className="min-w-[200px]">
            <select
              value={filters.teamId}
              onChange={(e) => handleFilterChange('teamId', e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Teams</option>
              {teams && teams.map(team => (
                <option key={team._id} value={team._id} className="bg-slate-900">{team.teamName}</option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <input 
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white scheme-dark"
              placeholder="Start Date"
            />
          </div>

           {/* Date Range End */}
           <div>
            <input 
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white scheme-dark"
              placeholder="End Date"
            />
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

      {/* Attendance Table - Inline implementation for Glassmorphism */}
      <div className="space-y-4">
        {isLoading.attendance && attendanceLogs.length === 0 ? (
           <div className="glass-card p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              <p className="text-slate-400">Loading attendance logs...</p>
            </div>
          </div>
        ) : attendanceLogs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-400">No attendance records found</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">Member Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">QR Token</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">Scanned By</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-cyan-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {attendanceLogs.map((row, index) => {
                    const status = row.success !== false ? 'success' : 'failed';
                    return (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-300">{formatDate(row.timestamp || row.createdAt)}</td>
                        <td className="px-6 py-4 text-sm text-white font-medium">{row.member?.name || row.memberName || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">{row.member?.email || row.email || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{row.team?.teamName || row.teamName || 'N/A'}</td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 truncate max-w-[150px]">{row.qrToken || row.memberQRToken || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {row.staff?.name || row.scannedBy?.name || (typeof row.scannedBy === 'string' ? row.scannedBy : 'System')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            status === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/20' : 'bg-red-500/20 text-red-300 border-red-500/20'
                          }`}>
                            {status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {attendancePagination && attendancePagination.totalPages > 1 && (
        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="text-sm text-slate-400">
              Showing {((attendancePagination.currentPage - 1) * attendancePagination.limit) + 1} to{' '}
              {Math.min(attendancePagination.currentPage * attendancePagination.limit, attendancePagination.total)} of{' '}
              {attendancePagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(attendancePagination.currentPage - 1)}
                disabled={attendancePagination.currentPage === 1}
                className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FaChevronLeft className="text-xs" />
                Previous
              </button>
               {/* Simplified pagination numbers for cleaner code in this file */}
               <span className="text-slate-400 text-sm">
                  Page {attendancePagination.currentPage} of {attendancePagination.totalPages}
               </span>

              <button
                onClick={() => handlePageChange(attendancePagination.currentPage + 1)}
                disabled={attendancePagination.currentPage === attendancePagination.totalPages}
                className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Next
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.attendance && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          {errors.attendance}
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;
