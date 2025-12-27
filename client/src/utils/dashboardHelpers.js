// Format ISO date string to readable format
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

// Calculate percentage with 2 decimal places
export const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0;
  return ((part / total) * 100).toFixed(2);
};

// Format number with thousand separators
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-US');
};

// Get Tailwind color class based on status
export const getStatusColor = (status) => {
  const statusColors = {
    // Payment statuses
    paid: 'bg-green-100 text-green-800 border-green-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    
    // Check-in statuses
    completed: 'bg-green-100 text-green-800 border-green-300',
    partial: 'bg-orange-100 text-orange-800 border-orange-300',
    none: 'bg-red-100 text-red-800 border-red-300',
    
    // Eligibility statuses
    eligible: 'bg-green-100 text-green-800 border-green-300',
    ineligible: 'bg-red-100 text-red-800 border-red-300',
    
    // Success/failure
    success: 'bg-green-100 text-green-800 border-green-300',
    failed: 'bg-red-100 text-red-800 border-red-300',
    
    // Default
    default: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  
  return statusColors[status?.toLowerCase()] || statusColors.default;
};

// Download CSV file from blob
export const downloadCSV = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Debounce function for search inputs
export const debounce = (func, delay = 500) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

// Get check-in status based on checked-in count and total members
export const getCheckInStatus = (checkedInCount, totalMembers) => {
  if (checkedInCount === 0) return 'none';
  if (checkedInCount === totalMembers) return 'completed';
  return 'partial';
};

// Format check-in status display text
export const formatCheckInStatus = (status) => {
  const statusText = {
    completed: 'All Checked In',
    partial: 'Partially Checked In',
    none: 'Not Checked In',
  };
  return statusText[status] || 'Unknown';
};
