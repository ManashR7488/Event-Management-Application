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
    <div className="min-h-screen bg-slate-950 relative  pt-20">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animate-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <div className="glass-card border-b border-white/10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Title and User Info */}
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <FaUserCircle className="text-cyan-400" />
                    <span className="text-sm text-slate-300">{user?.name}</span>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-medium rounded-full">
                      Admin
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-white/5 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
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
        <div className="flex-1 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Tab Content */}
            <div className="transition-all duration-300 animate-fade-in-up">
              {activeTab === 'users' && <UsersTab />}
              {activeTab === 'events' && <AdminEventsTab />}
              {activeTab === 'settings' && <PlatformSettingsTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
