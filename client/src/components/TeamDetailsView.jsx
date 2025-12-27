import { useState } from 'react';
import { FaUsers, FaDollarSign, FaDownload, FaPlus, FaChevronDown, FaChevronUp, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import QRCodeDisplay from './QRCodeDisplay';
import MemberInput from './MemberInput';
import { downloadAllQRCodes } from '../utils/qrHelpers';
import useTeamStore from '../store/teamStore';

const TeamDetailsView = ({ team, onBack }) => {
  const { addMembersToTeam, removeMemberFromTeam, updateTeam, isLoading } = useTeamStore();
  
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [newMembers, setNewMembers] = useState([]);
  const [errors, setErrors] = useState({});
  const [expandedMembers, setExpandedMembers] = useState(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [editedTeamName, setEditedTeamName] = useState(team.teamName);
  const [editedLeadPhone, setEditedLeadPhone] = useState(team.leadPhone || '');

  const eventDetails = team.eventId || {};
  const canAddMembers = 
    eventDetails.registrationOpen && 
    team.members.length < eventDetails.maxTeamSize;

  const toggleMemberExpansion = (index) => {
    const newExpanded = new Set(expandedMembers);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedMembers(newExpanded);
  };

  const handleDownloadAll = () => {
    downloadAllQRCodes(team.members, team.teamName);
  };

  const handleAddMembers = async () => {
    if (newMembers.length === 0) {
      setErrors({ members: 'Please add at least one member' });
      return;
    }

    const totalAfterAdd = team.members.length + newMembers.length;
    if (totalAfterAdd > eventDetails.maxTeamSize) {
      setErrors({ 
        members: `Cannot add ${newMembers.length} members. Maximum team size is ${eventDetails.maxTeamSize}. Current: ${team.members.length}` 
      });
      return;
    }

    // Check for duplicate emails against existing team members
    const existingEmails = team.members.map(m => m.email.toLowerCase());
    const duplicateEmails = newMembers.filter(m => 
      existingEmails.includes(m.email.toLowerCase())
    );
    
    if (duplicateEmails.length > 0) {
      setErrors({ 
        members: `The following email(s) are already in the team: ${duplicateEmails.map(m => m.email).join(', ')}` 
      });
      return;
    }

    const result = await addMembersToTeam(team._id, newMembers);
    
    if (result.success) {
      setNewMembers([]);
      setShowAddMembers(false);
      setErrors({});
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    // Check if removing would go below minimum team size
    if (team.members.length <= eventDetails.minTeamSize) {
      toast.error(`Cannot remove member. Minimum team size is ${eventDetails.minTeamSize}`);
      return;
    }

    if (window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      const result = await removeMemberFromTeam(team._id, memberId);
      
      if (result.success) {
        // Close expanded view if this member was expanded
        setExpandedMembers(prev => {
          const newSet = new Set(prev);
          const memberIndex = team.members.findIndex(m => m._id === memberId);
          newSet.delete(memberIndex);
          return newSet;
        });
      }
    }
  };

  const handleUpdateTeam = async () => {
    // Validate team name
    if (!editedTeamName.trim()) {
      toast.error('Team name cannot be empty');
      return;
    }

    const result = await updateTeam(team._id, {
      teamName: editedTeamName.trim(),
      leadPhone: editedLeadPhone.trim(),
    });

    if (result.success) {
      setIsEditing(false);
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '⏳', label: 'Payment Pending' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓', label: 'Payment Completed' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', icon: '✗', label: 'Payment Failed' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 ${config.bg} ${config.text} rounded-lg font-medium`}>
        <span>{config.icon}</span>
        {config.label}
      </div>
    );
  };

  const checkedInCount = team.members.filter(m => m.isCheckedIn).length;
  const totalMembers = team.members.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-lg">
        <button
          onClick={onBack}
          className="mb-4 text-blue-100 hover:text-white transition-colors text-sm flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        
        <h1 className="text-3xl font-bold mb-2">{team.teamName}</h1>
        <p className="text-blue-100 text-lg">{eventDetails.name || 'Event'}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-blue-100 text-sm">Total Members</p>
            <p className="text-3xl font-bold mt-1">{totalMembers}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-blue-100 text-sm">Checked In</p>
            <p className="text-3xl font-bold mt-1">{checkedInCount}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-blue-100 text-sm">Total Fee</p>
            <p className="text-3xl font-bold mt-1">₹{team.paymentMetadata?.totalAmount || 0}</p>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Payment Status</h2>
            <p className="text-sm text-gray-600">
              {team.paymentMetadata?.paidAt 
                ? `Paid on ${new Date(team.paymentMetadata.paidAt).toLocaleDateString()}`
                : 'Complete payment to receive full access'}
            </p>
          </div>
          {getPaymentStatusBadge(team.paymentMetadata?.status)}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <FaEdit />
          Edit Team Info
        </button>
      </div>

      {/* Edit Team Section */}
      {isEditing && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Team Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editedTeamName}
                onChange={(e) => setEditedTeamName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter team name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Phone Number
              </label>
              <input
                type="tel"
                value={editedLeadPhone}
                onChange={(e) => setEditedLeadPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpdateTeam}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedTeamName(team.teamName);
                setEditedLeadPhone(team.leadPhone || '');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <button
          onClick={handleDownloadAll}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaDownload />
          Download All QR Codes
        </button>
        
        {canAddMembers && (
          <button
            onClick={() => setShowAddMembers(!showAddMembers)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaPlus />
            Add More Members
          </button>
        )}
      

      {/* Add Members Section */}
      {showAddMembers && canAddMembers && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Members</h3>
          <MemberInput
            members={newMembers}
            setMembers={setNewMembers}
            maxTeamSize={eventDetails.maxTeamSize - team.members.length}
            minTeamSize={1}
            errors={errors}
            setErrors={setErrors}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddMembers}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? 'Adding...' : `Add ${newMembers.length} Member${newMembers.length !== 1 ? 's' : ''}`}
            </button>
            <button
              onClick={() => {
                setShowAddMembers(false);
                setNewMembers([]);
                setErrors({});
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Members List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaUsers className="text-blue-600" />
            Team Members ({totalMembers})
          </h2>
          <span className="text-sm text-gray-600">
            {checkedInCount} of {totalMembers} checked in
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.members.map((member, index) => (
            <div key={member._id || index}>
              {expandedMembers.has(index) ? (
                <div className="relative">
                  <QRCodeDisplay
                    member={member}
                    teamName={team.teamName}
                    eventName={eventDetails.name}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {!member.isCheckedIn && eventDetails.registrationOpen && team.members.length > eventDetails.minTeamSize && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMember(member._id, member.name);
                        }}
                        className="p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                        title="Remove member"
                        disabled={isLoading}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleMemberExpansion(index)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      title="Collapse"
                    >
                      <FaChevronUp className="text-gray-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => toggleMemberExpansion(index)}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    <FaChevronDown className="text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>{member.college}</p>
                    <p>Roll: {member.rollNumber}</p>
                  </div>
                  {member.isCheckedIn ? (
                    <div className="mt-3 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full inline-block">
                      ✓ Checked In
                    </div>
                  ) : (
                    <div className="mt-3 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full inline-block">
                      Pending Check-in
                    </div>
                  )}
                  <p className="text-xs text-blue-600 mt-2">Click to view QR code</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Lead Info */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Team Lead Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Name:</span>
            <p className="text-gray-800 font-medium">{team.leadName}</p>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>
            <p className="text-gray-800 font-medium">{team.leadEmail}</p>
          </div>
          {team.leadPhone && (
            <div>
              <span className="text-gray-600">Phone:</span>
              <p className="text-gray-800 font-medium">{team.leadPhone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetailsView;
