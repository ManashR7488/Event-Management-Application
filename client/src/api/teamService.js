import api from './axios';

// Create a new team
export const createTeam = async (teamData) => {
  try {
    const response = await api.post('/teams', teamData);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create team',
    };
  }
};

// Get all teams for current user
export const getMyTeams = async () => {
  try {
    const response = await api.get('/teams/my');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch teams',
    };
  }
};

// Get team by ID
export const getTeamById = async (teamId) => {
  try {
    const response = await api.get(`/teams/${teamId}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch team details',
    };
  }
};

// Add members to existing team
export const addMembers = async (teamId, members) => {
  try {
    const response = await api.patch(`/teams/${teamId}/members`, { members });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to add members',
    };
  }
};

// Remove member from team
export const removeMember = async (teamId, memberId) => {
  try {
    const response = await api.delete(`/teams/${teamId}/members/${memberId}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to remove member',
    };
  }
};

// Update team information
export const updateTeam = async (teamId, updates) => {
  try {
    const response = await api.patch(`/teams/${teamId}`, updates);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update team',
    };
  }
};
