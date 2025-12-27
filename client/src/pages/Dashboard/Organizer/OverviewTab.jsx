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
      <div className="text-center py-12">
        <p className="text-gray-500">Select an event to view statistics</p>
      </div>
    );
  }

  const checkInPercentage = stats.checkInPercentage || calculatePercentage(stats.checkedInCount || stats.totalCheckedIn, stats.totalMembers || stats.totalMembersRegistered);
  
  // Prepare data for check-in status pie chart
  const checkedIn = stats.checkedInCount || stats.totalCheckedIn || 0;
  const totalMembers = stats.totalMembers || stats.totalMembersRegistered || 0;
  const checkInStatusData = [
    { name: 'Checked In', value: checkedIn, color: '#10b981' },
    { name: 'Not Checked In', value: totalMembers - checkedIn, color: '#ef4444' },
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
          color="green"
        />
        <StatsCard
          icon={<FaChartLine className="text-2xl" />}
          label="Avg Members/Team"
          value={((stats.totalMembers || stats.totalMembersRegistered || 0) / (stats.totalTeams || stats.totalTeamsRegistered || 1)).toFixed(1)}
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in Status Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Check-in Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={checkInStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {checkInStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Member Distribution by Team */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Summary Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-700 font-medium">Total Registrations</span>
              <span className="text-2xl font-bold text-blue-600">{formatNumber(stats.totalTeams)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-gray-700 font-medium">Total Participants</span>
              <span className="text-2xl font-bold text-green-600">{formatNumber(stats.totalMembers)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <span className="text-gray-700 font-medium">Active Check-ins</span>
              <span className="text-2xl font-bold text-purple-600">{formatNumber(stats.checkedInCount)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <span className="text-gray-700 font-medium">Pending Check-ins</span>
              <span className="text-2xl font-bold text-orange-600">
                {formatNumber(stats.totalMembers - stats.checkedInCount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Check-in Trends Bar Chart (if data available) */}
      {checkInTrendsData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Check-in Trends Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={checkInTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Check-ins" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Food Distribution Line Chart (if data available) */}
      {foodDistributionData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Food Distribution Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={foodDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#10b981" name="Meals Distributed" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
