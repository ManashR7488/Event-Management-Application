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
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-700">Team Members</h3>
        <p className="text-sm text-gray-500">
          {minTeamSize === maxTeamSize 
            ? `Required: ${minTeamSize} members`
            : `Required: ${minTeamSize}-${maxTeamSize} members`}
        </p>
      </div>

      {/* Current Member Input */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Add New Member</h4>
        
        {/* Name */}
        <div>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={currentMember.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border ${
                fieldErrors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          {fieldErrors.name && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={currentMember.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* College */}
        <div>
          <div className="relative">
            <FaUniversity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="College/University"
              value={currentMember.college}
              onChange={(e) => handleInputChange('college', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border ${
                fieldErrors.college ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          {fieldErrors.college && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.college}</p>
          )}
        </div>

        {/* Roll Number */}
        <div>
          <div className="relative">
            <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Roll Number"
              value={currentMember.rollNumber}
              onChange={(e) => handleInputChange('rollNumber', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border ${
                fieldErrors.rollNumber ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          {fieldErrors.rollNumber && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.rollNumber}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddMember}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="text-sm" />
          Add Member
        </button>
      </div>

      {/* Members List */}
      {members.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Added Members ({members.length}/{maxTeamSize})</h4>
            {members.length < minTeamSize && (
              <span className="text-xs text-orange-600">
                {minTeamSize - members.length} more required
              </span>
            )}
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {members.map((member, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 bg-white border border-gray-200 rounded-md hover:border-blue-300 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <p className="text-xs text-gray-500">{member.college} • {member.rollNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
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
        <p className="text-red-500 text-sm">{errors.members}</p>
      )}

      {/* Progress Indicator */}
      {members.length > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{members.length}/{maxTeamSize}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                members.length >= minTeamSize ? 'bg-green-500' : 'bg-blue-500'
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
