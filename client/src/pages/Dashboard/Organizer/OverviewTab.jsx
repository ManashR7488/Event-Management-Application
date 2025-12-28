import { useEffect } from 'react';
import { FaUsers, FaUserCheck, FaUtensils, FaPercentage, FaChartLine, FaUserFriends } from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import useOrganizerStore from '../../../store/organizerStore';
import StatsCard from '../../../components/Dashboard/StatsCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';
import { formatNumber, calculatePercentage } from '../../../utils/dashboardHelpers';

const OverviewTab = ({ eventId }) => {
  const { stats, isLoading, errors, fetchStats } = useOrganizerStore();

  useEffect(() => {
    if (eventId) {
      fetchStats(eventId);
    }
  }, [eventId, fetchStats]);

  if (isLoading.stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (errors.stats) {
    return (
      <ErrorMessage
        message={errors.stats}
        onRetry={() => fetchStats(eventId)}
      />
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 glass-card">
        <p className="text-slate-400">Select an event to view statistics</p>
      </div>
    );
  }

  const checkInPercentage = stats.checkInPercentage || calculatePercentage(stats.checkedInCount || stats.totalCheckedIn, stats.totalMembers || stats.totalMembersRegistered);
  
  // Prepare data for check-in status pie chart
  const checkedIn = stats.checkedInCount || stats.totalCheckedIn || 0;
  const totalMembers = stats.totalMembers || stats.totalMembersRegistered || 0;
  const checkInStatusData = [
    { name: 'Checked In', value: checkedIn, color: '#06b6d4' }, // Cyan-500
    { name: 'Not Checked In', value: totalMembers - checkedIn, color: '#334155' }, // Slate-700
  ];

  // Prepare data for check-in trends (if available in stats)
  const checkInTrendsData = stats.checkInTrends || [];

  // Prepare data for food distribution over time (if available in stats)
  const foodDistributionData = stats.foodDistribution || [];

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatsCard
          icon={<FaUsers className="text-2xl" />}
          label="Total Teams"
          value={formatNumber(stats.totalTeams || stats.totalTeamsRegistered || 0)}
          color="blue"
        />
        <StatsCard
          icon={<FaUserFriends className="text-2xl" />}
          label="Total Members"
          value={formatNumber(stats.totalMembers || stats.totalMembersRegistered || 0)}
          color="purple"
        />
        <StatsCard
          icon={<FaUserCheck className="text-2xl" />}
          label="Checked In"
          value={formatNumber(stats.checkedInCount || stats.totalCheckedIn || 0)}
          color="green"
        />
        <StatsCard
          icon={<FaPercentage className="text-2xl" />}
          label="Check-in Rate"
          value={`${checkInPercentage}%`}
          color="orange"
          percentage={checkInPercentage}
          trend={checkInPercentage > 50 ? 'up' : checkInPercentage < 50 ? 'down' : 'neutral'}
        />
        <StatsCard
          icon={<FaUtensils className="text-2xl" />}
          label="Food Distributed"
          value={formatNumber(stats.foodDistributed || stats.totalFoodDistributed || 0)}
          color="cyan"
        />
        <StatsCard
          icon={<FaChartLine className="text-2xl" />}
          label="Avg Members/Team"
          value={((stats.totalMembers || stats.totalMembersRegistered || 0) / (stats.totalTeams || stats.totalTeamsRegistered || 1)).toFixed(1)}
          color="pink"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in Status Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Check-in Status Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={checkInStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                >
                  {checkInStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Distribution by Team */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Summary Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors">
              <span className="text-slate-300 font-medium">Total Registrations</span>
              <span className="text-2xl font-bold text-blue-400">{formatNumber(stats.totalTeams)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-colors">
              <span className="text-slate-300 font-medium">Total Participants</span>
              <span className="text-2xl font-bold text-purple-400">{formatNumber(stats.totalMembers)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/20 transition-colors">
              <span className="text-slate-300 font-medium">Active Check-ins</span>
              <span className="text-2xl font-bold text-cyan-400">{formatNumber(stats.checkedInCount)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-xl hover:bg-slate-700/50 transition-colors">
              <span className="text-slate-300 font-medium">Pending Check-ins</span>
              <span className="text-2xl font-bold text-slate-400">
                {formatNumber(stats.totalMembers - stats.checkedInCount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Check-in Trends Bar Chart (if data available) */}
      {checkInTrendsData.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Check-in Trends Over Time
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkInTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Check-ins" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Food Distribution Line Chart (if data available) */}
      {foodDistributionData.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Food Distribution Over Time
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={foodDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#06b6d4" 
                  name="Meals Distributed" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
