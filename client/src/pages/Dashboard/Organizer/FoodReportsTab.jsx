import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle, FaUtensils, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useOrganizerStore from '../../../store/organizerStore';
import ExportButton from '../../../components/Dashboard/ExportButton';
import StatsCard from '../../../components/Dashboard/StatsCard';
import { formatDate, getStatusColor, calculatePercentage, formatNumber } from '../../../utils/dashboardHelpers';

const FoodReportsTab = ({ eventId }) => {
  const { 
    foodLogs, 
    foodPagination, 
    isLoading, 
    errors, 
    fetchFoodLogs, 
    exportFoodCSV, 
    teams 
  } = useOrganizerStore();

  const [filters, setFilters] = useState({
    search: '',
    teamId: '',
    eligible: undefined,
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
  });

  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchFoodLogs(eventId, filters);
    }
  }, [eventId, filters, fetchFoodLogs]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      teamId: '',
      eligible: undefined,
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
    const result = await exportFoodCSV(eventId, filters);
    setIsExporting(false);

    if (result.success) {
      toast.success('Food logs CSV exported successfully');
    } else {
      toast.error(result.error || 'Failed to export CSV');
    }
  };

  // Calculate summary statistics
  const eligibleCount = foodLogs.filter(log => log.eligible === true).length;
  const ineligibleCount = foodLogs.filter(log => log.eligible === false).length;
  const totalScans = foodLogs.length;
  const eligibilityRate = calculatePercentage(eligibleCount, totalScans);

  // Prepare data for team aggregation chart
  const teamAggregation = teams.reduce((acc, team) => {
    const teamFoodLogs = foodLogs.filter(log => 
      log.team?._id === team._id || log.teamId === team._id
    );
    if (teamFoodLogs.length > 0) {
      acc.push({
        teamName: team.teamName,
        eligible: teamFoodLogs.filter(log => log.eligible === true).length,
        ineligible: teamFoodLogs.filter(log => log.eligible === false).length,
        total: teamFoodLogs.length,
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={<FaUtensils className="text-2xl" />}
          label="Total Scans"
          value={formatNumber(totalScans)}
          color="blue"
        />
        <StatsCard
          icon={<FaCheckCircle className="text-2xl" />}
          label="Eligible Scans"
          value={formatNumber(eligibleCount)}
          color="green"
        />
        <StatsCard
          icon={<FaTimesCircle className="text-2xl" />}
          label="Ineligible Scans"
          value={formatNumber(ineligibleCount)}
          color="red"
        />
      </div>

      {/* Eligibility Rate Card */}
      {totalScans > 0 && (
        <div className="glass-card p-6 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Eligibility Rate</h3>
              <p className="text-sm text-slate-300">Percentage of eligible scans</p>
            </div>
            <div className="text-4xl font-bold text-purple-400">{eligibilityRate}%</div>
          </div>
          <div className="mt-4 bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              style={{ width: `${eligibilityRate}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Food Distribution Logs</h2>
          {foodPagination && (
            <p className="text-sm text-slate-400 mt-1">
              Total: {foodPagination.total} records
            </p>
          )}
        </div>
        <ExportButton
          onExport={handleExportCSV}
          isLoading={isExporting}
          label="Export Food CSV"
          className="bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30"
        />
      </div>

      {/* Filter Panel - Inline Glassmorphism */}
      <div className="glass-card p-4">
         <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            {/* Search */}
           <div className="flex-1 min-w-[200px] relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search member, email..."
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

           {/* Eligibility Filter */}
           <div className="min-w-[150px]">
            <select
              value={filters.eligible === undefined ? '' : filters.eligible}
              onChange={(e) => handleFilterChange('eligible', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Eligibility</option>
              <option value="true" className="bg-slate-900">Eligible</option>
              <option value="false" className="bg-slate-900">Ineligible</option>
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

      {/* Team Aggregation Chart */}
      {teamAggregation.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Food Distribution by Team
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamAggregation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="teamName" angle={-45} textAnchor="end" height={100} stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                   cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Legend />
                <Bar dataKey="eligible" fill="#10b981" name="Eligible" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ineligible" fill="#ef4444" name="Ineligible" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Food Logs Table - Inline Glassmorphism */}
      <div className="space-y-4">
        {isLoading.food && foodLogs.length === 0 ? (
           <div className="glass-card p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              <p className="text-slate-400">Loading food logs...</p>
            </div>
          </div>
        ) : foodLogs.length === 0 ? (
          <div className="glass-card p-12 text-center">
             <p className="text-slate-400">No food distribution records found</p>
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
                    <th className="px-6 py-4 text-center text-xs font-semibold text-cyan-300 uppercase tracking-wider">Eligible</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">Meal Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {foodLogs.map((row, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-300">{formatDate(row.timestamp || row.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-white font-medium">{row.member?.name || row.memberName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{row.member?.email || row.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{row.team?.teamName || row.teamName || 'N/A'}</td>
                      <td className="px-6 py-4 text-center">
                         {row.eligible ? (
                            <FaCheckCircle className="text-green-500 text-lg mx-auto" />
                          ) : (
                            <FaTimesCircle className="text-red-500 text-lg mx-auto" />
                          )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                         {row.eligible ? 'Eligible for meal' : (row.error || row.reason || 'Not eligible')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {row.mealType || row.event?.name || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

       {/* Pagination Controls */}
       {foodPagination && foodPagination.totalPages > 1 && (
        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="text-sm text-slate-400">
              Showing {((foodPagination.currentPage - 1) * foodPagination.limit) + 1} to{' '}
              {Math.min(foodPagination.currentPage * foodPagination.limit, foodPagination.total)} of{' '}
              {foodPagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(foodPagination.currentPage - 1)}
                disabled={foodPagination.currentPage === 1}
                className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FaChevronLeft className="text-xs" />
                Previous
              </button>
               {/* Simplified pagination numbers for cleaner code in this file */}
               <span className="text-slate-400 text-sm">
                  Page {foodPagination.currentPage} of {foodPagination.totalPages}
               </span>

              <button
                onClick={() => handlePageChange(foodPagination.currentPage + 1)}
                disabled={foodPagination.currentPage === foodPagination.totalPages}
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
      {errors.food && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          {errors.food}
        </div>
      )}
    </div>
  );
};

export default FoodReportsTab;
