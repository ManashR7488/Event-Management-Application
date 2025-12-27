import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaUtensils } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useOrganizerStore from '../../../store/organizerStore';
import DataTable from '../../../components/Dashboard/DataTable';
import FilterPanel from '../../../components/Dashboard/FilterPanel';
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

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
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

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      minWidth: '180px',
      render: (row) => (
        <div className="text-sm text-gray-800 font-medium">
          {formatDate(row.timestamp || row.createdAt)}
        </div>
      ),
    },
    {
      header: 'Member Name',
      accessor: 'memberName',
      minWidth: '200px',
      render: (row) => (
        <div className="font-semibold text-gray-800">
          {row.member?.name || row.memberName || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      minWidth: '220px',
      render: (row) => (
        <div className="text-sm text-gray-600">
          {row.member?.email || row.email || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Team',
      accessor: 'teamName',
      minWidth: '180px',
      render: (row) => (
        <div className="text-sm text-gray-800">
          {row.team?.teamName || row.teamName || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Eligible',
      accessor: 'eligible',
      render: (row) => (
        <div className="flex items-center justify-center">
          {row.eligible ? (
            <FaCheckCircle className="text-green-600 text-xl" />
          ) : (
            <FaTimesCircle className="text-red-600 text-xl" />
          )}
        </div>
      ),
    },
    {
      header: 'Reason',
      accessor: 'reason',
      minWidth: '250px',
      render: (row) => (
        <div className="text-sm text-gray-600">
          {row.eligible ? 'Eligible for meal' : (row.error || row.reason || 'Not eligible')}
        </div>
      ),
    },
    {
      header: 'Meal Type',
      accessor: 'mealType',
      render: (row) => (
        <div className="text-sm text-gray-600">
          {row.mealType || row.event?.name || 'N/A'}
        </div>
      ),
    },
  ];

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
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Eligibility Rate</h3>
              <p className="text-sm text-gray-600">Percentage of eligible scans</p>
            </div>
            <div className="text-4xl font-bold text-purple-600">{eligibilityRate}%</div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${eligibilityRate}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Food Distribution Logs</h2>
          {foodPagination && (
            <p className="text-sm text-gray-600 mt-1">
              Total: {foodPagination.total} records
            </p>
          )}
        </div>
        <ExportButton
          onExport={handleExportCSV}
          isLoading={isExporting}
          label="Export Food CSV"
        />
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        filterOptions={{
          search: true,
          teams: teams,
          eligible: true,
          dateRange: true,
          paymentStatus: false,
          checkInStatus: false,
        }}
      />

      {/* Team Aggregation Chart */}
      {teamAggregation.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Food Distribution by Team
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamAggregation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="teamName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="eligible" fill="#10b981" name="Eligible" />
              <Bar dataKey="ineligible" fill="#ef4444" name="Ineligible" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Food Logs Table */}
      <DataTable
        columns={columns}
        data={foodLogs}
        pagination={foodPagination}
        onPageChange={handlePageChange}
        isLoading={isLoading.food}
        emptyMessage="No food distribution records found"
      />

      {/* Error Message */}
      {errors.food && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {errors.food}
        </div>
      )}
    </div>
  );
};

export default FoodReportsTab;
