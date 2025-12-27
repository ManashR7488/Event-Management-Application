import { useState } from 'react';
import { FaFilter, FaTimes, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FilterPanel = ({ filters, onFilterChange, onReset, filterOptions = {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleInputChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleResetFilters = () => {
    onReset();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FaFilter className="text-blue-600" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
        </div>
        <button className="text-gray-600 hover:text-gray-800">
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Input */}
            {filterOptions.search !== false && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search || ''}
                    onChange={(e) => handleInputChange('search', e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Team Filter */}
            {filterOptions.teams && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team
                </label>
                <select
                  value={filters.teamId || ''}
                  onChange={(e) => handleInputChange('teamId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Teams</option>
                  {filterOptions.teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.teamName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment Status Filter */}
            {filterOptions.paymentStatus !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={filters.paymentStatus || ''}
                  onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            )}

            {/* Check-in Status Filter */}
            {filterOptions.checkInStatus !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Status
                </label>
                <select
                  value={filters.checkInStatus || ''}
                  onChange={(e) => handleInputChange('checkInStatus', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="completed">Completed</option>
                  <option value="partial">Partial</option>
                  <option value="none">None</option>
                </select>
              </div>
            )}

            {/* Eligible Filter */}
            {filterOptions.eligible !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Eligibility
                </label>
                <select
                  value={filters.eligible === undefined ? '' : filters.eligible}
                  onChange={(e) => handleInputChange('eligible', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="true">Eligible</option>
                  <option value="false">Ineligible</option>
                </select>
              </div>
            )}

            {/* Start Date Filter */}
            {filterOptions.dateRange !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* End Date Filter */}
            {filterOptions.dateRange !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Reset Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FaTimes />
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
