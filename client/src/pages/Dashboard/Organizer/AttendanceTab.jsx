import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useOrganizerStore from '../../../store/organizerStore';
import DataTable from '../../../components/Dashboard/DataTable';
import FilterPanel from '../../../components/Dashboard/FilterPanel';
import ExportButton from '../../../components/Dashboard/ExportButton';
import { formatDate, getStatusColor } from '../../../utils/dashboardHelpers';

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

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
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
      header: 'QR Token',
      accessor: 'qrToken',
      minWidth: '150px',
      render: (row) => (
        <div className="text-xs font-mono text-gray-600 truncate max-w-[150px]">
          {row.qrToken || row.memberQRToken || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Scanned By',
      accessor: 'scannedBy',
      minWidth: '180px',
      render: (row) => (
        <div className="text-sm text-gray-600">
          {row.staff?.name || row.scannedBy?.name || (typeof row.scannedBy === 'string' ? row.scannedBy : 'System')}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'success',
      render: (row) => {
        const status = row.success !== false ? 'success' : 'failed';
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
            {status.toUpperCase()}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Total Count and Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Attendance Logs</h2>
          {attendancePagination && (
            <p className="text-sm text-gray-600 mt-1">
              Total: {attendancePagination.total} records
            </p>
          )}
        </div>
        <ExportButton
          onExport={handleExportCSV}
          isLoading={isExporting}
          label="Export Attendance CSV"
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
          dateRange: true,
          paymentStatus: false,
          checkInStatus: false,
          eligible: false,
        }}
      />

      {/* Attendance Table */}
      <DataTable
        columns={columns}
        data={attendanceLogs}
        pagination={attendancePagination}
        onPageChange={handlePageChange}
        isLoading={isLoading.attendance}
        emptyMessage="No attendance records found"
      />

      {/* Error Message */}
      {errors.attendance && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {errors.attendance}
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;
