// Format check-in time for display
export const formatCheckInTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
};

// Calculate success rate percentage
export const calculateSuccessRate = (total, successful) => {
  if (total === 0) return 0;
  return Math.round((successful / total) * 100);
};

// Validate QR token before API call
export const validateQRToken = (token) => {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'QR token is required' };
  }
  
  if (token.trim().length === 0) {
    return { valid: false, error: 'QR token cannot be empty' };
  }
  
  if (token.length < 10) {
    return { valid: false, error: 'Invalid QR token format' };
  }
  
  return { valid: true };
};

// Play success sound (optional audio feedback)
export const playSuccessSound = () => {
  try {
    const audio = new Audio('/sounds/success.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Silently fail if sound doesn't exist or can't play
    });
  } catch (error) {
    // Silently fail
  }
};

// Play error sound (optional audio feedback)
export const playErrorSound = () => {
  try {
    const audio = new Audio('/sounds/error.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Silently fail if sound doesn't exist or can't play
    });
  } catch (error) {
    // Silently fail
  }
};

// Format date for history display
export const formatDateShort = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
