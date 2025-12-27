import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaCog, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import useAuthStore from '../../../store/authStore';
import UsersTab from './UsersTab';
import AdminEventsTab from './AdminEventsTab';
import PlatformSettingsTab from './PlatformSettingsTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('users');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: <FaUsers /> },
    { id: 'events', label: 'Events Overview', icon: <FaCalendarAlt /> },
    { id: 'settings', label: 'Platform Settings', icon: <FaCog /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Title and User Info */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className="flex items-center gap-2 mt-1">
                  <FaUserCircle className="text-gray-400" />
                  <span className="text-sm text-gray-600">{user?.name}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Admin
                  </span>
                </div>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'events' && <AdminEventsTab />}
          {activeTab === 'settings' && <PlatformSettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
