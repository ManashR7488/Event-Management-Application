/**
 * Camera permission and utility helpers
 */

/**
 * Check if camera permission is granted
 * @returns {Promise<string>} 'granted', 'denied', 'prompt', or 'unsupported'
 */
export const checkCameraPermission = async () => {
  if (!navigator.permissions || !navigator.permissions.query) {
    return 'unsupported';
  }

  try {
    const result = await navigator.permissions.query({ name: 'camera' });
    return result.state;
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return 'unsupported';
  }
};

/**
 * Request camera permission explicitly
 * @returns {Promise<boolean>} true if granted, false otherwise
 */
export const requestCameraPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Stop the stream immediately after permission is granted
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Camera permission denied:', error);
    return false;
  }
};

/**
 * Get list of available camera devices
 * @returns {Promise<Array>} List of camera devices
 */
export const getCameraDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('Error getting camera devices:', error);
    return [];
  }
};

/**
 * Check if browser supports camera API
 * @returns {boolean} true if supported
 */
export const isCameraSupported = () => {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
};

/**
 * Get browser name for specific instructions
 * @returns {string} Browser name
 */
export const getBrowserName = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return 'Unknown';
};

/**
 * Get browser-specific permission instructions
 * @returns {string} Instructions text
 */
export const getPermissionInstructions = () => {
  const browser = getBrowserName();
  
  const instructions = {
    Chrome: 'Click the lock icon in the address bar, then allow camera access.',
    Firefox: 'Click the camera icon in the address bar, then select "Allow".',
    Safari: 'Go to Safari > Preferences > Websites > Camera, then allow access.',
    Edge: 'Click the lock icon in the address bar, then allow camera access.',
    Opera: 'Click the lock icon in the address bar, then allow camera access.',
    Unknown: 'Check your browser settings to allow camera access for this site.'
  };
  
  return instructions[browser] || instructions.Unknown;
};

/**
 * Check if page is served over HTTPS or localhost
 * @returns {boolean} true if secure context
 */
export const isSecureContext = () => {
  return window.isSecureContext || window.location.hostname === 'localhost';
};

/**
 * Get error message for camera errors
 * @param {Error} error - Camera error
 * @returns {Object} { title, message, instruction }
 */
export const getCameraErrorDetails = (error) => {
  const errorName = error?.name || '';
  const errorMessage = error?.message || '';
  
  // Permission denied
  if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
    return {
      title: 'Camera Permission Denied',
      message: 'You denied camera access. Please enable it to scan QR codes.',
      instruction: getPermissionInstructions(),
    };
  }
  
  // No camera found
  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return {
      title: 'No Camera Detected',
      message: 'No camera was found on your device.',
      instruction: 'Please connect a camera or use manual input instead.',
    };
  }
  
  // Camera in use
  if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
    return {
      title: 'Camera In Use',
      message: 'Camera is being used by another application.',
      instruction: 'Close other apps using the camera and try again.',
    };
  }
  
  // Insecure context
  if (errorName === 'NotSupportedError' && !isSecureContext()) {
    return {
      title: 'Insecure Connection',
      message: 'Camera access requires a secure connection (HTTPS).',
      instruction: 'Please use HTTPS or localhost to access the camera.',
    };
  }
  
  // Generic error
  return {
    title: 'Camera Error',
    message: errorMessage || 'Unable to access camera.',
    instruction: 'Please try again or use manual input instead.',
  };
};
