import api from './axios';

// Get aggregate statistics for dashboard
export const getStats = async (eventId) => {
  try {
    const params = eventId ? { eventId } : {};
    const response = await api.get('/dashboard/stats', { params });
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch statistics',
    };
  }
};

// Get teams list with pagination and filters
export const getTeams = async (eventId, filters = {}) => {
  try {
    const params = {
      eventId,
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...(filters.search && { search: filters.search }),
      ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      ...(filters.checkInStatus && { checkInStatus: filters.checkInStatus }),
    };
    
    const response = await api.get('/dashboard/teams', { params });
    
    return {
      success: true,
      data: response.data.data.teams,
      pagination: response.data.data.pagination,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch teams',
    };
  }
};

// Get attendance logs with pagination and filters
export const getAttendanceLogs = async (eventId, filters = {}) => {
  try {
    const params = {
      eventId,
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...(filters.teamId && { teamId: filters.teamId }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      ...(filters.search && { search: filters.search }),
    };
    
    const response = await api.get('/dashboard/attendance', { params });
    
    return {
      success: true,
      data: response.data.data.logs,
      pagination: response.data.data.pagination,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch attendance logs',
    };
  }
};

// Get food distribution logs with pagination and filters
export const getFoodLogs = async (eventId, filters = {}) => {
  try {
    const params = {
      eventId,
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...(filters.teamId && { teamId: filters.teamId }),
      ...(filters.eligible !== undefined && { eligible: filters.eligible }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      ...(filters.search && { search: filters.search }),
    };
    
    const response = await api.get('/dashboard/food', { params });
    
    return {
      success: true,
      data: response.data.data.logs,
      pagination: response.data.data.pagination,
      summary: response.data.data.summary,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch food logs',
    };
  }
};

// Export attendance logs as CSV
export const exportAttendanceCSV = async (eventId, filters = {}) => {
  try {
    const params = {
      eventId,
      ...(filters.teamId && { teamId: filters.teamId }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    };
    
    const response = await api.get('/dashboard/export/attendance', {
      params,
      responseType: 'blob',
    });
    
    // Create blob and download
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: 'Attendance CSV exported successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to export attendance CSV',
    };
  }
};

// Export food logs as CSV
export const exportFoodCSV = async (eventId, filters = {}) => {
  try {
    const params = {
      eventId,
      ...(filters.teamId && { teamId: filters.teamId }),
      ...(filters.eligible !== undefined && { eligible: filters.eligible }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    };
    
    const response = await api.get('/dashboard/export/food', {
      params,
      responseType: 'blob',
    });
    
    // Create blob and download
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `food-logs-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: 'Food logs CSV exported successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to export food CSV',
    };
  }
};
