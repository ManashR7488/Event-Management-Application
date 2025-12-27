import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";
import { toast } from "react-toastify";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/login", { email, password });
          // console.log(response.data.data.user)

          if (response.data.success) {
            set({
              user: response.data.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            toast.success("Login successful!");
            return { success: true, user: response.data.data.user };
          }
        } catch (error) {
          set({ isLoading: false });
          const errorMessage =
            error.response?.data?.error || "Login failed. Please try again.";
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/register", userData);

          if (response.data.success) {
            set({
              user: response.data.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            toast.success("Registration successful! Welcome aboard!");
            return { success: true, user: response.data.data.user };
          }
        } catch (error) {
          set({ isLoading: false });
          const errorMessage =
            error.response?.data?.error ||
            "Registration failed. Please try again.";
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post("/auth/logout");
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          toast.success("Logged out successfully");
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          // Even if logout fails on server, clear local state
          set({
            user: null,
            isAuthenticated: false,
          });
          toast.info("Logged out");
          return { success: true };
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get("/auth/me");

          if (response.data.success) {
            set({
              user: response.data.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true, user: response.data.data.user };
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return { success: false };
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Make store available globally for axios interceptor
if (typeof window !== "undefined") {
  window.authStore = useAuthStore.getState();
}

export default useAuthStore;
