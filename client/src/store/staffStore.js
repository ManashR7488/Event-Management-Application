import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStaffStore = create(
  persist(
    (set, get) => ({
      // State
      recentCheckIns: [],
      todayStats: {
        totalScans: 0,
        successfulCheckIns: 0,
        alreadyCheckedIn: 0,
        errors: 0,
      },
      isScanning: false,
      selectedEvent: null, // { _id, name, canteenQRToken, etc. }

      // Actions
      setSelectedEvent: (event) => {
        set({ selectedEvent: event });
      },

      addCheckIn: (checkInData) => {
        const recentCheckIns = get().recentCheckIns;
        const newCheckIn = {
          ...checkInData,
          timestamp: new Date().toISOString(),
          id: Date.now(),
        };
        
        // Keep only last 20 check-ins
        const updatedCheckIns = [newCheckIn, ...recentCheckIns].slice(0, 20);
        
        set({ recentCheckIns: updatedCheckIns });
      },

      updateStats: (type = 'success') => {
        const stats = get().todayStats;
        const updatedStats = {
          ...stats,
          totalScans: stats.totalScans + 1,
        };

        if (type === 'success') {
          updatedStats.successfulCheckIns = stats.successfulCheckIns + 1;
        } else if (type === 'alreadyCheckedIn') {
          updatedStats.alreadyCheckedIn = stats.alreadyCheckedIn + 1;
        } else if (type === 'error') {
          updatedStats.errors = stats.errors + 1;
        }

        set({ todayStats: updatedStats });
      },

      clearRecentCheckIns: () => {
        set({ recentCheckIns: [] });
      },

      setScanning: (status) => {
        set({ isScanning: status });
      },

      resetDailyStats: () => {
        set({
          todayStats: {
            totalScans: 0,
            successfulCheckIns: 0,
            alreadyCheckedIn: 0,
            errors: 0,
          },
        });
      },
    }),
    {
      name: 'staff-storage',
      partialize: (state) => ({
        recentCheckIns: state.recentCheckIns,
        todayStats: state.todayStats,
        selectedEvent: state.selectedEvent,
      }),
    }
  )
);

export default useStaffStore;
