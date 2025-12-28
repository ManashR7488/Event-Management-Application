import { useState } from 'react';
import { FaUsers, FaDollarSign, FaDownload, FaPlus, FaChevronDown, FaChevronUp, FaTrash, FaEdit, FaCheckCircle, FaTimes, FaPhone, FaEnvelope } from 'react-icons/fa';
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
      pending: { bg: 'bg-orange-500/20', border: 'border-orange-500/20', text: 'text-orange-300', icon: '⏳', label: 'Payment Pending' },
      completed: { bg: 'bg-green-500/20', border: 'border-green-500/20', text: 'text-green-300', icon: '✓', label: 'Payment Completed' },
      failed: { bg: 'bg-red-500/20', border: 'border-red-500/20', text: 'text-red-300', icon: '✗', label: 'Payment Failed' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 ${config.bg} border ${config.border} ${config.text} rounded-lg font-medium backdrop-blur-sm`}>
        <span>{config.icon}</span>
        {config.label}
      </div>
    );
  };

  const checkedInCount = team.members.filter(m => m.isCheckedIn).length;
  const totalMembers = team.members.length;

  return (
    <div className="space-y-8 animate-fade-in pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          <button
            onClick={onBack}
            className="mb-6 text-blue-100 hover:text-white transition-colors text-sm flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 w-fit backdrop-blur-sm"
          >
            ← Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">{team.teamName}</h1>
              <p className="text-blue-100 text-lg flex items-center gap-2">
                <FaUsers className="text-cyan-300" />
                {eventDetails.name || 'Event'}
              </p>
            </div>
            
            <div className="flex gap-3">
               {canAddMembers && (
                <button
                  onClick={() => setShowAddMembers(!showAddMembers)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md transition-all font-medium flex items-center gap-2 border border-white/10"
                >
                  <FaPlus /> <span className="hidden sm:inline">Add Member</span>
                </button>
               )}
               <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-black/20 hover:bg-black/30 text-white rounded-xl backdrop-blur-md transition-all font-medium flex items-center gap-2 border border-white/5"
              >
                <FaEdit /> <span className="hidden sm:inline">Edit Team</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10">
              <p className="text-blue-100 text-xs uppercase tracking-wider font-medium">Total Members</p>
              <p className="text-3xl font-bold mt-1">{totalMembers}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10">
              <p className="text-blue-100 text-xs uppercase tracking-wider font-medium">Checked In</p>
              <p className="text-3xl font-bold mt-1">{checkedInCount}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10">
              <p className="text-blue-100 text-xs uppercase tracking-wider font-medium">Total Fee</p>
              <p className="text-3xl font-bold mt-1">₹{team.paymentMetadata?.totalAmount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="glass-card rounded-xl p-6 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Payment Status</h2>
          <p className="text-sm text-slate-400">
            {team.paymentMetadata?.paidAt 
              ? `Paid on ${new Date(team.paymentMetadata.paidAt).toLocaleDateString()}`
              : 'Complete payment to receive full access'}
          </p>
        </div>
        {getPaymentStatusBadge(team.paymentMetadata?.status)}
      </div>

      {/* Edit Team Section */}
      {isEditing && (
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6 shadow-xl animate-fade-in-up">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
             <FaEdit className="text-purple-400" /> Edit Team Information
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Team Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={editedTeamName}
                onChange={(e) => setEditedTeamName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-slate-600 transition-all"
                placeholder="Enter team name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lead Phone Number
              </label>
              <input
                type="tel"
                value={editedLeadPhone}
                onChange={(e) => setEditedLeadPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-slate-600 transition-all"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleUpdateTeam}
              disabled={isLoading}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-500 disabled:bg-slate-700 transition-colors font-medium shadow-lg shadow-purple-500/20"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedTeamName(team.teamName);
                setEditedLeadPhone(team.leadPhone || '');
              }}
              className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition-colors font-medium border border-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Download All Button */}
      {!isEditing && (
        <button
           onClick={handleDownloadAll}
           className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-slate-200 border border-slate-700 hover:border-blue-500 hover:text-white rounded-xl transition-all"
        >
           <FaDownload />
           Download All QR Codes
        </button>
      )}

      {/* Add Members Section */}
      {showAddMembers && canAddMembers && (
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6 shadow-xl animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaPlus className="text-green-400" /> Add New Members
             </h3>
             <button onClick={() => setShowAddMembers(false)} className="text-slate-400 hover:text-white"><FaTimes /></button>
          </div>
          
          <MemberInput
            members={newMembers}
            setMembers={setNewMembers}
            maxTeamSize={eventDetails.maxTeamSize - team.members.length}
            minTeamSize={1}
            errors={errors}
            setErrors={setErrors}
          />
          <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
            <button
              onClick={handleAddMembers}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 transition-all font-bold shadow-lg shadow-green-500/20"
            >
              {isLoading ? 'Adding...' : `Add ${newMembers.length} Member${newMembers.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Members List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaUsers className="text-blue-500" />
            Team Members
            <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
               {totalMembers}
            </span>
          </h2>
          <span className="text-sm font-medium text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5">
            {checkedInCount} / {totalMembers} Checked In
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.members.map((member, index) => (
            <div key={member._id || index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              {expandedMembers.has(index) ? (
                <div className="glass-card border border-blue-500/30 rounded-xl overflow-hidden shadow-2xl relative">
                  <div className="p-4 bg-slate-950/50 flex justify-between items-center border-b border-white/5">
                     <span className="font-bold text-white truncate">{member.name}</span>
                     <div className="flex gap-2">
                        {!member.isCheckedIn && eventDetails.registrationOpen && team.members.length > eventDetails.minTeamSize && (
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleRemoveMember(member._id, member.name);
                             }}
                             className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                             title="Remove member"
                             disabled={isLoading}
                           >
                             <FaTrash size={12} />
                           </button>
                        )}
                        <button
                           onClick={() => toggleMemberExpansion(index)}
                           className="p-1.5 bg-white/10 text-slate-300 rounded-lg hover:bg-white/20 transition-colors"
                        >
                           <FaChevronUp size={12} />
                        </button>
                     </div>
                  </div>
                  <div className="p-6 flex justify-center bg-white">
                      <QRCodeDisplay
                        member={member}
                        teamName={team.teamName}
                        eventName={eventDetails.name}
                      />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => toggleMemberExpansion(index)}
                  className="glass-card border border-white/5 rounded-xl p-5 hover:border-cyan-500/30 transition-all cursor-pointer group hover:bg-slate-800/40"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{member.name}</h3>
                      <p className="text-sm text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                         <FaEnvelope className="text-[10px]" /> {member.email}
                      </p>
                    </div>
                    <div className="ml-2 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all">
                       <FaChevronDown size={12} />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                     <span className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-white/10 text-slate-400">
                        {member.rollNumber}
                     </span>
                     <span className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-white/10 text-slate-400 truncate max-w-[120px]">
                        {member.college}
                     </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                     {member.isCheckedIn ? (
                       <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                         <FaCheckCircle /> Checked In
                       </div>
                     ) : (
                       <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium bg-slate-800 px-2.5 py-1 rounded-full border border-white/5">
                         <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Pending
                       </div>
                     )}
                     <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">View QR →</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Lead Info */}
      <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs">Lead</span>
            Team Lead Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="bg-slate-950 p-4 rounded-lg border border-white/5">
            <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">Name</span>
            <p className="text-white font-medium text-base">{team.leadName}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-white/5">
            <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">Email</span>
            <p className="text-white font-medium text-base">{team.leadEmail}</p>
          </div>
          {team.leadPhone && (
            <div className="bg-slate-950 p-4 rounded-lg border border-white/5">
              <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">Phone</span>
              <p className="text-white font-medium text-base flex items-center gap-2">
                 <FaPhone className="text-slate-600 text-xs" /> {team.leadPhone}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetailsView;
