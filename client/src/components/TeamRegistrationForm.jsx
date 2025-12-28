import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUsers, FaTrophy, FaInfoCircle, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
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
      <div className="text-center p-8 bg-slate-900 border border-white/10 rounded-xl">
        <FaCalendarAlt className="mx-auto h-12 w-12 text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Events Available</h3>
        <p className="text-slate-400">There are currently no events with open registration.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {/* Event Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">
          Select Event <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <select
            value={selectedEvent?._id || ''}
            onChange={(e) => handleEventChange(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 bg-slate-900/50 border ${
              errors.event ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
            } rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500/50 appearance-none text-white transition-all cursor-pointer`}
          >
            <option value="" className="bg-slate-900">Choose an event...</option>
            {events.map((event) => (
              <option key={event._id} value={event._id} className="bg-slate-900">
                {event.name} - {formatDate(event.startDate)}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
        </div>
        {errors.event && <p className="text-red-400 text-sm mt-1">{errors.event}</p>}
      </div>

      {/* Event Details */}
      {selectedEvent && (
        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-xl p-5 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

          <h3 className="font-bold text-white mb-4 flex items-center gap-2 relative z-10">
            <FaTrophy className="text-cyan-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Event Details</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm relative z-10">
            <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5">
              <span className="text-slate-400 text-xs uppercase tracking-wide font-medium block mb-1">Dates</span>
              <p className="text-white font-medium">
                {formatDate(selectedEvent.startDate)} - {formatDate(selectedEvent.endDate)}
              </p>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5">
              <span className="text-slate-400 text-xs uppercase tracking-wide font-medium block mb-1">Venue</span>
              <p className="text-white font-medium">{selectedEvent.venue}</p>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5">
              <span className="text-slate-400 text-xs uppercase tracking-wide font-medium block mb-1">Team Size</span>
              <p className="text-white font-medium">
                {selectedEvent.minTeamSize === selectedEvent.maxTeamSize
                  ? `${selectedEvent.minTeamSize} members`
                  : `${selectedEvent.minTeamSize}-${selectedEvent.maxTeamSize} members`}
              </p>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5">
              <span className="text-slate-400 text-xs uppercase tracking-wide font-medium block mb-1">Fee per Member</span>
              <p className="text-cyan-300 font-bold">₹{selectedEvent.registrationFeePerMember}</p>
            </div>
          </div>
          {selectedEvent.description && (
            <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
              <p className="text-sm text-slate-300 leading-relaxed">{selectedEvent.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Team Name */}
      {selectedEvent && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Team Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <FaUsers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" />
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
              className={`w-full pl-11 pr-4 py-3 bg-slate-900/50 border ${
                errors.teamName ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
              } rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-slate-600 transition-all`}
            />
          </div>
          {errors.teamName && <p className="text-red-400 text-sm mt-1">{errors.teamName}</p>}
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
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm text-emerald-300 font-medium flex items-center gap-2">
                 <FaMoneyBillWave /> Total Registration Fee
              </p>
              <p className="text-xs text-emerald-400/70">
                {members.length} members × ₹{selectedEvent.registrationFeePerMember}
              </p>
            </div>
            <p className="text-3xl font-bold text-emerald-400 shadow-emerald-500/20 drop-shadow-sm">
              ₹{calculateTotalFee(members.length, selectedEvent.registrationFeePerMember)}
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={teamLoading || !selectedEvent}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-[0.98]"
      >
        {teamLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            Creating Team...
          </>
        ) : (
          <>
            <FaCheckCircle />
            Register Team
          </>
        )}
      </button>

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-900/20 border border-blue-500/20 text-xs text-blue-300">
         <FaInfoCircle className="text-base shrink-0 mt-0.5" />
         <div>
            <p className="font-medium mb-1">Registration Information</p>
            <p className="opacity-80 leading-relaxed">By registering, you agree to the event terms. Individual QR codes will be generated automatically for all team members upon successful registration.</p>
         </div>
      </div>
    </form>
  );
};

export default TeamRegistrationForm;
