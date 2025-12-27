import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUsers, FaTrophy } from 'react-icons/fa';
import { getAllEvents } from '../api/eventService';
import { validateTeamName, validateMemberArray } from '../utils/validation';
import { calculateTotalFee, formatDate } from '../utils/qrHelpers';
import MemberInput from './MemberInput';
import LoadingSpinner from './LoadingSpinner';
import useTeamStore from '../store/teamStore';

const TeamRegistrationForm = ({ onSuccess }) => {
  const { createTeam, isLoading: teamLoading } = useTeamStore();
  
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    const result = await getAllEvents({ isActive: true, registrationOpen: true });
    
    if (result.success) {
      setEvents(Array.isArray(result.data) ? result.data : []);
    } else {
      setEvents([]);
    }
    setIsLoadingEvents(false);
  };

  const handleEventChange = (eventId) => {
    const event = events.find(e => e._id === eventId);
    setSelectedEvent(event);
    setMembers([]); // Reset members when event changes
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedEvent) {
      newErrors.event = 'Please select an event';
    }

    const teamNameError = validateTeamName(teamName);
    if (teamNameError) {
      newErrors.teamName = teamNameError;
    }

    if (selectedEvent) {
      const membersError = validateMemberArray(
        members,
        selectedEvent.minTeamSize,
        selectedEvent.maxTeamSize
      );
      if (membersError) {
        newErrors.members = membersError;
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const teamData = {
      eventId: selectedEvent._id,
      teamName: teamName.trim(),
      members: members,
    };

    const result = await createTeam(teamData);
    
    if (result.success) {
      // Reset form
      setTeamName('');
      setMembers([]);
      setSelectedEvent(null);
      setErrors({});
      
      if (onSuccess) {
        onSuccess(result.data);
      }
    }
  };

  if (isLoadingEvents) {
    return <LoadingSpinner message="Loading events..." />;
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Events Available</h3>
        <p className="text-gray-600">There are currently no events with open registration.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event *
        </label>
        <div className="relative">
          <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={selectedEvent?._id || ''}
            onChange={(e) => handleEventChange(e.target.value)}
            className={`w-full pl-10 pr-3 py-2 border ${
              errors.event ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white`}
          >
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name} - {formatDate(event.startDate)}
              </option>
            ))}
          </select>
        </div>
        {errors.event && <p className="text-red-500 text-sm mt-1">{errors.event}</p>}
      </div>

      {/* Event Details */}
      {selectedEvent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <FaTrophy className="text-blue-600" />
            Event Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Dates:</span>
              <p className="text-blue-900">
                {formatDate(selectedEvent.startDate)} - {formatDate(selectedEvent.endDate)}
              </p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Venue:</span>
              <p className="text-blue-900">{selectedEvent.venue}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Team Size:</span>
              <p className="text-blue-900">
                {selectedEvent.minTeamSize === selectedEvent.maxTeamSize
                  ? `${selectedEvent.minTeamSize} members`
                  : `${selectedEvent.minTeamSize}-${selectedEvent.maxTeamSize} members`}
              </p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Fee per Member:</span>
              <p className="text-blue-900">₹{selectedEvent.registrationFeePerMember}</p>
            </div>
          </div>
          {selectedEvent.description && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-blue-800">{selectedEvent.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Team Name */}
      {selectedEvent && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Name *
          </label>
          <div className="relative">
            <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter your team name"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                if (errors.teamName) {
                  setErrors((prev) => ({ ...prev, teamName: null }));
                }
              }}
              className={`w-full pl-10 pr-3 py-2 border ${
                errors.teamName ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          {errors.teamName && <p className="text-red-500 text-sm mt-1">{errors.teamName}</p>}
        </div>
      )}

      {/* Members Section */}
      {selectedEvent && (
        <MemberInput
          members={members}
          setMembers={setMembers}
          maxTeamSize={selectedEvent.maxTeamSize}
          minTeamSize={selectedEvent.minTeamSize}
          errors={errors}
          setErrors={setErrors}
        />
      )}

      {/* Fee Summary */}
      {selectedEvent && members.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-green-700">Total Registration Fee</p>
              <p className="text-xs text-green-600 mt-1">
                {members.length} members × ₹{selectedEvent.registrationFeePerMember}
              </p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              ₹{calculateTotalFee(members.length, selectedEvent.registrationFeePerMember)}
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={teamLoading || !selectedEvent}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {teamLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            Creating Team...
          </>
        ) : (
          <>
            <FaUsers />
            Register Team
          </>
        )}
      </button>

      {/* Info Note */}
      <div className="text-xs text-gray-600 text-center">
        <p>By registering, you agree to the event terms and conditions.</p>
        <p className="mt-1">QR codes will be generated automatically for all team members.</p>
      </div>
    </form>
  );
};

export default TeamRegistrationForm;
