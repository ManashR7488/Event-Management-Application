import { FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const FoodEligibilityStatus = ({ eligible, memberData, eventData, checkInTime, error }) => {
  if (eligible) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 shadow-lg">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-500 rounded-full p-6">
            <FaCheckCircle className="text-white text-6xl" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-green-800 mb-2">
            Eligible for Food!
          </h2>
          <p className="text-green-700 text-lg">
            You are authorized to receive meal
          </p>
        </div>

        {/* Member Details */}
        {memberData && (
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <FaUser className="text-green-600 text-xl" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Member Name</p>
                <p className="text-lg font-semibold text-gray-800">
                  {memberData.name || memberData.memberName || 'N/A'}
                </p>
              </div>
            </div>

            {memberData.teamName && (
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="text-green-600 text-xl">👥</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Team Name</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {memberData.teamName}
                  </p>
                </div>
              </div>
            )}

            {eventData?.name && (
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <FaCalendarAlt className="text-green-600 text-xl" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Event</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {eventData.name}
                  </p>
                </div>
              </div>
            )}

            {eventData?.venue && (
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <FaMapMarkerAlt className="text-green-600 text-xl" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Venue</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {eventData.venue}
                  </p>
                </div>
              </div>
            )}

            {checkInTime && (
              <div className="flex items-center gap-3">
                <FaClock className="text-green-600 text-xl" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Checked In At</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(checkInTime).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Ineligible or Error State
  return (
    <div className="bg-red-50 border-2 border-red-500 rounded-xl p-8 shadow-lg">
      {/* Error Icon */}
      <div className="flex justify-center mb-6">
        <div className="bg-red-500 rounded-full p-6">
          <FaTimesCircle className="text-white text-6xl" />
        </div>
      </div>

      {/* Error Message */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-red-800 mb-2">
          Not Eligible
        </h2>
        <p className="text-red-700 text-lg">
          {error || 'You are not authorized to receive food at this time'}
        </p>
      </div>

      {/* Member Details (if available) */}
      {memberData && (
        <div className="bg-white rounded-lg p-6 space-y-3">
          {memberData.memberName && (
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <FaUser className="text-red-600 text-xl" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Member</p>
                <p className="text-lg font-semibold text-gray-800">
                  {memberData.memberName}
                </p>
              </div>
            </div>
          )}

          {memberData.teamName && (
            <div className="flex items-center gap-3">
              <div className="text-red-600 text-xl">👥</div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Team</p>
                <p className="text-lg font-semibold text-gray-800">
                  {memberData.teamName}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-red-100 rounded-lg p-4">
        <p className="text-sm text-red-800 font-medium">
          📋 Common reasons for ineligibility:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-red-700">
          <li>• Not checked in at the event gate</li>
          <li>• QR code is for a different event</li>
          <li>• Event is not currently active</li>
          <li>• Invalid or expired QR code</li>
        </ul>
      </div>
    </div>
  );
};

export default FoodEligibilityStatus;
