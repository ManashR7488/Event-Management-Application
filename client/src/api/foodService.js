import api from './axios';

// Check food eligibility with event canteen QR and member QR
export const checkFoodEligibility = async (eventCanteenQR, memberQRToken) => {
  try {
    const response = await api.post('/food/check-eligibility', {
      eventCanteenQR,
      memberQRToken,
    });
    
    return {
      success: response.data.success,
      eligible: response.data.eligible,
      data: response.data.data,
      message: response.data.message,
      error: response.data.error,
    };
  } catch (error) {
    return {
      success: false,
      eligible: false,
      error: error.response?.data?.error || 'Failed to check food eligibility',
    };
  }
};
