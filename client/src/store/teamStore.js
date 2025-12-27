import { create } from 'zustand';
import { createTeam as createTeamAPI, getMyTeams as getMyTeamsAPI, addMembers as addMembersAPI, getTeamById as getTeamByIdAPI, removeMember as removeMemberAPI, updateTeam as updateTeamAPI } from '../api/teamService';
import { toast } from 'react-toastify';

const useTeamStore = create((set, get) => ({
  // State
  teams: [],
  selectedTeam: null,
  isLoading: false,

  // Actions
  fetchMyTeams: async () => {
    set({ isLoading: true });
    const result = await getMyTeamsAPI();
    
    if (result.success) {
      set({ teams: Array.isArray(result.data.teams) ? result.data.teams : [], isLoading: false });
      return { success: true, data: result.data };
    } else {
      set({ teams: [], isLoading: false });
      toast.error(result.error);
      return { success: false, error: result.error };
    }
  },

  createTeam: async (teamData) => {
    set({ isLoading: true });
    const result = await createTeamAPI(teamData);
    
    if (result.success) {
      // Refresh teams list
      await get().fetchMyTeams();
      toast.success('Team created successfully!');
      return { success: true, data: result.data };
    } else {
      set({ isLoading: false });
      toast.error(result.error);
      return { success: false, error: result.error };
    }
  },

  addMembersToTeam: async (teamId, members) => {
    set({ isLoading: true });
    const result = await addMembersAPI(teamId, members);
    
    if (result.success) {
      // Update the selected team if it's the one being modified
      if (get().selectedTeam?._id === teamId) {
        set({ selectedTeam: result.data.team });
      }
      // Refresh teams list
      await get().fetchMyTeams();
      toast.success('Members added successfully!');
      return { success: true, data: result.data };
    } else {
      set({ isLoading: false });
      toast.error(result.error);
      return { success: false, error: result.error };
    }
  },

  removeMemberFromTeam: async (teamId, memberId) => {
    set({ isLoading: true });
    const result = await removeMemberAPI(teamId, memberId);
    
    if (result.success) {
      // Update the selected team if it's the one being modified
      if (get().selectedTeam?._id === teamId) {
        set({ selectedTeam: result.data.team });
      }
      // Refresh teams list
      await get().fetchMyTeams();
      toast.success('Member removed successfully!');
      return { success: true, data: result.data };
    } else {
      set({ isLoading: false });
      toast.error(result.error);
      return { success: false, error: result.error };
    }
  },

  updateTeam: async (teamId, updates) => {
    set({ isLoading: true });
    const result = await updateTeamAPI(teamId, updates);
    
    if (result.success) {
      // Update the selected team if it's the one being modified
      if (get().selectedTeam?._id === teamId) {
        set({ selectedTeam: result.data.team });
      }
      // Refresh teams list
      await get().fetchMyTeams();
      toast.success('Team updated successfully!');
      return { success: true, data: result.data };
    } else {
      set({ isLoading: false });
      toast.error(result.error);
      return { success: false, error: result.error };
    }
  },

  getTeamById: async (teamId) => {
    set({ isLoading: true });
    const result = await getTeamByIdAPI(teamId);
    
    if (result.success) {
      set({ selectedTeam: result.data.team, isLoading: false });
      return { success: true, data: result.data };
    } else {
      set({ isLoading: false });
      toast.error(result.error);
      return { success: false, error: result.error };
    }
  },

  selectTeam: (team) => {
    set({ selectedTeam: team });
  },

  clearTeams: () => {
    set({ teams: [], selectedTeam: null, isLoading: false });
  },
}));

export default useTeamStore;
