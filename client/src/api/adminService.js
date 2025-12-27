import api from './axios';

// Get all users with filters and pagination
export const getAllUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);

    const response = await api.get(`/admin/users?${params.toString()}`);
    return { 
      success: true, 
      data: response.data.data.users,
      pagination: response.data.data.pagination
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch users',
    };
  }
};

// Activate user account
export const activateUser = async (userId) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/activate`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to activate user',
    };
  }
};

// Deactivate user account
export const deactivateUser = async (userId) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/deactivate`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to deactivate user',
    };
  }
};

// Update user role
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update user role',
    };
  }
};

// Delete user permanently
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to delete user',
    };
  }
};

// Get platform statistics
export const getPlatformStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch platform statistics',
    };
  }
};
