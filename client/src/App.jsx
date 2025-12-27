import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Home/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import useAuthStore from './store/authStore';
import TeamLeadDashboard from './pages/Dashboard/TeamLead/TeamLeadDashboard';
import TeamDetails from './pages/Dashboard/TeamLead/TeamDetails';
import StaffDashboard from './pages/Dashboard/Staff/StaffDashboard';
import OrganizerDashboard from './pages/Dashboard/Organizer/OrganizerDashboard';
import AdminDashboard from './pages/Dashboard/Admin/AdminDashboard';
import FoodEligibility from './pages/FoodEligibility/FoodEligibility';

const App = () => {
  const { checkAuth, isLoading } = useAuthStore();

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/organizer"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/staff"
          element={
            <ProtectedRoute allowedRoles={['staff', 'organizer', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/team-lead"
          element={
            <ProtectedRoute allowedRoles={['teamLead', 'staff', 'organizer', 'admin']}>
              <TeamLeadDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/team-lead/team/:teamId"
          element={
            <ProtectedRoute allowedRoles={['teamLead', 'staff', 'organizer', 'admin']}>
              <TeamDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/food-eligibility"
          element={
            <ProtectedRoute allowedRoles={['participant', 'teamLead', 'staff', 'organizer', 'admin']}>
              <FoodEligibility />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800">404</h1>
                <p className="text-xl text-gray-600 mt-4">Page not found</p>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default App;