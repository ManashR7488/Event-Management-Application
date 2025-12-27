import { FaTrash, FaClock, FaUsers, FaUser } from 'react-icons/fa';
import { formatCheckInTime } from '../utils/staffHelpers';

const CheckInHistory = ({ checkIns, onClear }) => {
  if (checkIns.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <FaClock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No Check-ins Yet</h3>
        <p className="text-gray-500 text-sm">
          Recent check-in history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FaClock className="text-blue-600" />
          Recent Check-ins ({checkIns.length})
        </h3>
        {onClear && (
          <button
            onClick={onClear}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
          >
            <FaTrash className="text-xs" />
            Clear History
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Member
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {checkIns.map((checkIn) => (
              <tr key={checkIn.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400 text-sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {checkIn.member?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {checkIn.member?.email || ''}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-gray-400 text-sm" />
                    <span className="text-sm text-gray-700">
                      {checkIn.team?.teamName || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {checkIn.alreadyCheckedIn ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Already Checked In
                    </span>
                  ) : checkIn.success ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ✗ Failed
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatCheckInTime(checkIn.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {checkIns.map((checkIn) => (
          <div key={checkIn.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {checkIn.member?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500">
                  {checkIn.member?.email || ''}
                </p>
              </div>
              {checkIn.alreadyCheckedIn ? (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Already
                </span>
              ) : checkIn.success ? (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  ✗
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {checkIn.team?.teamName || 'N/A'}
              </span>
              <span className="text-gray-500 text-xs">
                {formatCheckInTime(checkIn.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckInHistory;
