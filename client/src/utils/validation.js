// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email is required';
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  return null;
};

// Phone validation (Indian format)
export const validatePhone = (phone) => {
  if (!phone) {
    return null; // Phone is optional
  }
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid 10-digit Indian phone number';
  }
  return null;
};

// Required field validation
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

// Password match validation
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

// Event validation functions
export const validateEventName = (name) => {
  if (!name || (typeof name === 'string' && name.trim() === '')) {
    return 'Event name is required';
  }
  return null;
};

export const validateEventSlug = (slug) => {
  if (!slug || (typeof slug === 'string' && slug.trim() === '')) {
    return 'Event slug is required';
  }
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return 'Slug must be lowercase with only letters, numbers, and hyphens';
  }
  return null;
};

export const validateEventDescription = (description) => {
  if (!description || (typeof description === 'string' && description.trim() === '')) {
    return 'Event description is required';
  }
  return null;
};

export const validateEventDates = (startDate, endDate) => {
  if (!startDate) {
    return 'Start date is required';
  }
  if (!endDate) {
    return 'End date is required';
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end <= start) {
    return 'End date must be after start date';
  }
  return null;
};

export const validateVenue = (venue) => {
  if (!venue || (typeof venue === 'string' && venue.trim() === '')) {
    return 'Venue is required';
  }
  return null;
};

export const validateRegistrationFee = (fee) => {
  if (fee === undefined || fee === null || fee === '') {
    return 'Registration fee is required';
  }
  const feeNum = Number(fee);
  if (isNaN(feeNum) || feeNum < 0) {
    return 'Registration fee must be a number greater than or equal to 0';
  }
  return null;
};

export const validateTeamSize = (minSize, maxSize) => {
  if (minSize === undefined || minSize === null || minSize === '') {
    return 'Minimum team size is required';
  }
  if (maxSize === undefined || maxSize === null || maxSize === '') {
    return 'Maximum team size is required';
  }
  const min = Number(minSize);
  const max = Number(maxSize);
  if (isNaN(min) || min < 1) {
    return 'Minimum team size must be at least 1';
  }
  if (isNaN(max) || max < 1) {
    return 'Maximum team size must be at least 1';
  }
  if (max < min) {
    return 'Maximum team size must be greater than or equal to minimum team size';
  }
  return null;
};

export const validateMaxTeams = (maxTeams) => {
  if (!maxTeams && maxTeams !== 0) {
    return null; // Optional field
  }
  const max = Number(maxTeams);
  if (isNaN(max) || max < 1) {
    return 'Maximum teams must be at least 1';
  }
  return null;
};

// Name validation
export const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters long';
  }
  return null;
};

// Roll number validation
export const validateRollNumber = (rollNumber) => {
  if (!rollNumber || rollNumber.trim() === '') {
    return 'Roll number is required';
  }
  return null;
};

// College validation
export const validateCollege = (college) => {
  if (!college || college.trim() === '') {
    return 'College is required';
  }
  return null;
};

// Team name validation
export const validateTeamName = (teamName) => {
  if (!teamName) {
    return 'Team name is required';
  }
  if (teamName.trim().length < 3) {
    return 'Team name must be at least 3 characters long';
  }
  return null;
};

// Member array validation
export const validateMemberArray = (members, minSize, maxSize) => {
  if (!members || members.length === 0) {
    return `At least ${minSize} member${minSize > 1 ? 's' : ''} required`;
  }
  if (members.length < minSize) {
    return `Minimum ${minSize} member${minSize > 1 ? 's' : ''} required`;
  }
  if (members.length > maxSize) {
    return `Maximum ${maxSize} member${maxSize > 1 ? 's' : ''} allowed`;
  }
  
  // Check for duplicate emails
  const emails = members.map(m => m.email?.toLowerCase());
  const uniqueEmails = new Set(emails);
  if (emails.length !== uniqueEmails.size) {
    return 'Duplicate member emails are not allowed';
  }
  
  return null;
};
