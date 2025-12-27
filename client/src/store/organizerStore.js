import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as dashboardService from '../api/dashboardService';

const useOrganizerStore = create(
  persist(
    (set, get) => ({
      // State
      selectedEvent: null,
      stats: null,
      teams: [],
      teamsPagination: null,
      attendanceLogs: [],
      attendancePagination: null,
      foodLogs: [],
      foodPagination: null,
      foodSummary: null,
      isLoading: {
        stats: false,
        teams: false,
        attendance: false,
        food: false,
      },
      errors: {
        stats: null,
        teams: null,
        attendance: null,
        food: null,
      },

      // Actions
      setSelectedEvent: (event) => {
        set({ selectedEvent: event });
      },

      fetchStats: async (eventId) => {
        set((state) => ({
          isLoading: { ...state.isLoading, stats: true },
          errors: { ...state.errors, stats: null },
        }));

        const result = await dashboardService.getStats(eventId);

        // console.log(result.data)

        if (result.success) {
          set((state) => ({
            stats: result.data,
            isLoading: { ...state.isLoading, stats: false },
          }));
        } else {
          set((state) => ({
            errors: { ...state.errors, stats: result.error },
            isLoading: { ...state.isLoading, stats: false },
          }));
        }

        return result;
      },

      fetchTeams: async (eventId, filters = {}) => {
        set((state) => ({
          isLoading: { ...state.isLoading, teams: true },
          errors: { ...state.errors, teams: null },
        }));

        const result = await dashboardService.getTeams(eventId, filters);

        if (result.success) {
          set((state) => ({
            teams: result.data,
            teamsPagination: result.pagination,
            isLoading: { ...state.isLoading, teams: false },
          }));
        } else {
          set((state) => ({
            errors: { ...state.errors, teams: result.error },
            isLoading: { ...state.isLoading, teams: false },
          }));
        }

        return result;
      },

      fetchAttendanceLogs: async (eventId, filters = {}) => {
        set((state) => ({
          isLoading: { ...state.isLoading, attendance: true },
          errors: { ...state.errors, attendance: null },
        }));

        const result = await dashboardService.getAttendanceLogs(eventId, filters);

        if (result.success) {
          set((state) => ({
            attendanceLogs: result.data,
            attendancePagination: result.pagination,
            isLoading: { ...state.isLoading, attendance: false },
          }));
        } else {
          set((state) => ({
            errors: { ...state.errors, attendance: result.error },
            isLoading: { ...state.isLoading, attendance: false },
          }));
        }

        return result;
      },

      fetchFoodLogs: async (eventId, filters = {}) => {
        set((state) => ({
          isLoading: { ...state.isLoading, food: true },
          errors: { ...state.errors, food: null },
        }));

        const result = await dashboardService.getFoodLogs(eventId, filters);

        if (result.success) {
          set((state) => ({
            foodLogs: result.data,
            foodPagination: result.pagination,
            foodSummary: result.summary,
            isLoading: { ...state.isLoading, food: false },
          }));
        } else {
          set((state) => ({
            errors: { ...state.errors, food: result.error },
            isLoading: { ...state.isLoading, food: false },
          }));
        }

        return result;
      },

      exportAttendanceCSV: async (eventId, filters = {}) => {
        const result = await dashboardService.exportAttendanceCSV(eventId, filters);
        return result;
      },

      exportFoodCSV: async (eventId, filters = {}) => {
        const result = await dashboardService.exportFoodCSV(eventId, filters);
        return result;
      },

      clearData: () => {
        set({
          stats: null,
          teams: [],
          teamsPagination: null,
          attendanceLogs: [],
          attendancePagination: null,
          foodLogs: [],
          foodPagination: null,
          errors: {
            stats: null,
            teams: null,
            attendance: null,
            food: null,
          },
        });
      },
    }),
    {
      name: 'organizer-store',
      partialize: (state) => ({
        selectedEvent: state.selectedEvent,
      }),
    }
  )
);

export default useOrganizerStore;
