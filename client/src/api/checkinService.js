import api from './axios';

// Scan member QR code for check-in
export const scanMemberQR = async (qrToken, eventId) => {
  try {
    const response = await api.post('/checkin/scan', { qrToken, eventId });
    return { 
      success: true, 
      data: response.data.data,
      alreadyCheckedIn: response.data.alreadyCheckedIn || false,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to scan QR code',
    };
  }
};

// Get check-in status by QR token
export const getCheckInStatus = async (qrToken) => {
  try {
    const response = await api.get(`/checkin/status/${qrToken}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch check-in status',
    };
  }
};
