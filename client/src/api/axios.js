import axios from 'axios';
import { toast } from 'react-toastify';


const mobile = false;
const env = import.meta.env.NODE_ENV || 'development';

const url = env === "development" ? (mobile ? 'http://10.205.121.171:5000/api' : 'http://localhost:5000/api') : 'https://event-management-application-server.vercel.app/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: url,
  withCredentials: true, // Enable cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - session expired
    if (error.response?.status === 401) {
      // Check if not already on login page to avoid infinite loops
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please login again.');
        
        // Clear auth state if store is available
        if (window.authStore) {
          window.authStore.clearAuth();
        }
        
        // Redirect to login
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
