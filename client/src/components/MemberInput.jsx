import { useState } from 'react';
import { FaUser, FaEnvelope, FaUniversity, FaIdCard, FaPlus, FaTimes } from 'react-icons/fa';
import { validateEmail, validateName, validateRollNumber, validateCollege } from '../utils/validation';

const MemberInput = ({ members, setMembers, maxTeamSize, minTeamSize, errors, setErrors }) => {
  const [currentMember, setCurrentMember] = useState({
    name: '',
    email: '',
    college: '',
    rollNumber: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleInputChange = (field, value) => {
    setCurrentMember((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateCurrentMember = () => {
    const newErrors = {};
    
    const nameError = validateName(currentMember.name);
    if (nameError) newErrors.name = nameError;
    
    const emailError = validateEmail(currentMember.email);
    if (emailError) newErrors.email = emailError;
    
    const collegeError = validateCollege(currentMember.college);
    if (collegeError) newErrors.college = collegeError;
    
    const rollNumberError = validateRollNumber(currentMember.rollNumber);
    if (rollNumberError) newErrors.rollNumber = rollNumberError;

    // Check for duplicate email
    if (members.some(m => m.email.toLowerCase() === currentMember.email.toLowerCase())) {
      newErrors.email = 'This email is already added';
    }

    return newErrors;
  };

  const handleAddMember = () => {
    const validationErrors = validateCurrentMember();
    
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    if (members.length >= maxTeamSize) {
      setErrors((prev) => ({ ...prev, members: `Maximum ${maxTeamSize} members allowed` }));
      return;
    }

    setMembers([...members, { ...currentMember }]);
    setCurrentMember({ name: '', email: '', college: '', rollNumber: '' });
    setFieldErrors({});
    
    // Clear general members error if it exists
    if (errors?.members) {
      setErrors((prev) => ({ ...prev, members: null }));
    }
  };

  const handleRemoveMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      <div className="border-b border-white/10 pb-2 flex justify-between items-end">
        <div>
           <h3 className="text-lg font-bold text-white tracking-tight">Team Members</h3>
           <p className="text-sm text-slate-400 mt-0.5">
             Add members to your team
           </p>
        </div>
        <div className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
           {minTeamSize === maxTeamSize 
             ? `Required: ${minTeamSize}`
             : `Range: ${minTeamSize}-${maxTeamSize}`}
        </div>
      </div>

      {/* Current Member Input */}
      <div className="bg-slate-900/50 border border-white/10 p-5 rounded-xl space-y-4 backdrop-blur-sm shadow-inner group-focus-within:border-cyan-500/30 transition-colors">
        <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Add New Member</h4>
        
        {/* Name */}
        <div>
          <div className="relative">
            <FaUser className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Full Name"
              value={currentMember.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                fieldErrors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
              } rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-slate-600 transition-all`}
            />
          </div>
          {fieldErrors.name && (
            <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <div className="relative">
            <FaEnvelope className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              placeholder="Email Address"
              value={currentMember.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                fieldErrors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
              } rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-slate-600 transition-all`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* College */}
            <div>
            <div className="relative">
                <FaUniversity className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <input
                type="text"
                placeholder="College"
                value={currentMember.college}
                onChange={(e) => handleInputChange('college', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                    fieldErrors.college ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
                } rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-slate-600 transition-all`}
                />
            </div>
            {fieldErrors.college && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.college}</p>
            )}
            </div>

            {/* Roll Number */}
            <div>
            <div className="relative">
                <FaIdCard className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <input
                type="text"
                placeholder="Roll Number"
                value={currentMember.rollNumber}
                onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                    fieldErrors.rollNumber ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
                } rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-slate-600 transition-all`}
                />
            </div>
            {fieldErrors.rollNumber && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.rollNumber}</p>
            )}
            </div>
        </div>

        <button
          type="button"
          onClick={handleAddMember}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
        >
          <FaPlus className="text-sm" />
          Add Member
        </button>
      </div>

      {/* Members List */}
      {members.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-medium text-slate-300">Added Members ({members.length}/{maxTeamSize})</h4>
            {members.length < minTeamSize && (
              <span className="text-xs text-orange-400 flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                {minTeamSize - members.length} more required
              </span>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {members.map((member, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                     <p className="font-semibold text-white">{member.name}</p>
                     <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{member.rollNumber}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{member.email}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{member.college}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="ml-3 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Remove member"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Members Error */}
      {errors?.members && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
             <FaTimes className="text-xs" /> {errors.members}
        </div>
      )}

      {/* Progress Indicator */}
      {members.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1.5 uppercase font-medium tracking-wider">
            <span>Team Capacity</span>
            <span>{Math.round((members.length / maxTeamSize) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                members.length >= minTeamSize ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-blue-500'
              }`}
              style={{ width: `${(members.length / maxTeamSize) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberInput;
