import { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import useOrganizerStore from '../../../store/organizerStore';
import DataTable from '../../../components/Dashboard/DataTable';
import FilterPanel from '../../../components/Dashboard/FilterPanel';
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

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && key !== 'limit') {
        params.set(key, value);
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

  const columns = [
    {
      header: 'Team Name',
      accessor: 'teamName',
      minWidth: '200px',
      render: (row) => (
        <div className="font-semibold text-gray-800">{row.teamName}</div>
      ),
    },
    {
      header: 'Team Lead',
      accessor: 'leadEmail',
      minWidth: '200px',
      render: (row) => (
        <div className="text-gray-600">{row.leadEmail}</div>
      ),
    },
    {
      header: 'Members',
      accessor: 'memberCount',
      render: (row) => (
        <div className="text-center">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
            {row.members?.length || 0}
          </span>
        </div>
      ),
    },
    {
      header: 'Checked In',
      accessor: 'checkedInCount',
      render: (row) => {
        const checkedInCount = row.members?.filter(m => m.isCheckedIn).length || 0;
        const totalMembers = row.members?.length || 0;
        return (
          <div className="text-center">
            <span className="text-gray-800 font-medium">
              {checkedInCount} / {totalMembers}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Check-in Status',
      accessor: 'checkInStatus',
      render: (row) => {
        const checkedInCount = row.members?.filter(m => m.isCheckedIn).length || 0;
        const totalMembers = row.members?.length || 0;
        const status = getCheckInStatus(checkedInCount, totalMembers);
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
            {formatCheckInStatus(status)}
          </span>
        );
      },
    },
    {
      header: 'Payment Status',
      accessor: 'paymentStatus',
      render: (row) => {
        const status = row.paymentStatus || row.paymentMetadata?.status || 'pending';
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      render: (row) => (
        <div className="text-sm text-gray-600">
          {formatDate(row.createdAt)}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => toggleTeamExpansion(row._id)}
          className="px-3 py-1 text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
        >
          {expandedTeam === row._id ? (
            <>
              <FaChevronUp /> Hide
            </>
          ) : (
            <>
              <FaChevronDown /> View
            </>
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        filterOptions={{
          search: true,
          paymentStatus: true,
          checkInStatus: true,
          dateRange: false,
        }}
      />

      {/* Teams Table */}
      <div className="space-y-4">
        {!Array.isArray(teams) || teams.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No teams found for this event</p>
          </div>
        ) : (
          teams.map((team) => (
            <div key={team._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50 transition-colors">
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 text-sm text-gray-800">
                        {column.render ? column.render(team) : team[column.accessor]}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Expanded Member Details */}
            {expandedTeam === team._id && (
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Team Members ({team.members?.length || 0})
                </h4>
                {team.members && team.members.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.members.map((member, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-semibold text-gray-800">{member.name}</div>
                          {member.isCheckedIn ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              Checked In
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                              Not Checked In
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{member.email}</div>
                          <div>{member.phone}</div>
                          {member.collegeName && (
                            <div className="text-xs text-gray-500">{member.collegeName}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No members found</p>
                )}
              </div>
            )}
          </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {teamsPagination && teamsPagination.totalPages > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {((teamsPagination.currentPage - 1) * teamsPagination.limit) + 1} to{' '}
              {Math.min(teamsPagination.currentPage * teamsPagination.limit, teamsPagination.total)} of{' '}
              {teamsPagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(teamsPagination.currentPage - 1)}
                disabled={teamsPagination.currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
                          <span className="text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === teamsPagination.currentPage
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
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
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
        <div className="bg-white rounded-xl border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Loading teams...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading.teams && teams.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No teams found</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {errors.teams && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {errors.teams}
        </div>
      )}
    </div>
  );
};

export default TeamsTab;
