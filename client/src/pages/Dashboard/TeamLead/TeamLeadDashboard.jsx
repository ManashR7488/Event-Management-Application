import { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import useAuthStore from '../../../store/authStore';
import useTeamStore from '../../../store/teamStore';
import TeamCard from '../../../components/TeamCard';
import TeamRegistrationForm from '../../../components/TeamRegistrationForm';
import TeamDetailsView from '../../../components/TeamDetailsView';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';

const TeamLeadDashboard = () => {
  const { user, logout } = useAuthStore();
  const { teams: teamsData, fetchMyTeams, selectTeam, selectedTeam, isLoading } = useTeamStore();
  const teams = Array.isArray(teamsData) ? teamsData : [];
  
  const [activeTab, setActiveTab] = useState('myTeams');
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'details'

  useEffect(() => {
    fetchMyTeams();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleTeamClick = (team) => {
    selectTeam(team);
    setView('details');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    selectTeam(null);
  };

  const handleRegistrationSuccess = (newTeam) => {
    setActiveTab('myTeams');
  };

  // If viewing team details
  if (view === 'details' && selectedTeam) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <TeamDetailsView team={selectedTeam} onBack={handleBackToDashboard} />
        </div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Team Lead Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your teams and registrations</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <FaUserCircle className="text-2xl text-blue-600" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('myTeams')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'myTeams'
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <FaUsers />
              My Teams
              {teams.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                  {teams.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('registerTeam')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'registerTeam'
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <FaPlus />
              Register Team
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'myTeams' && (
          <div>
            {isLoading ? (
              <LoadingSpinner message="Loading your teams..." />
            ) : teams.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 max-w-md mx-auto">
                  <FaUsers className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Teams Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't registered any teams. Get started by creating your first team!
                  </p>
                  <button
                    onClick={() => setActiveTab('registerTeam')}
                    className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaPlus />
                    Register Your First Team
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Your Teams ({teams.length})
                  </h2>
                  <button
                    onClick={() => fetchMyTeams()}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Refresh
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map((team) => (
                    <TeamCard
                      key={team._id}
                      team={team}
                      onClick={() => handleTeamClick(team)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'registerTeam' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Register New Team</h2>
                <p className="text-gray-600">
                  Fill in the details below to register your team for an event.
                </p>
              </div>
              <TeamRegistrationForm onSuccess={handleRegistrationSuccess} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeadDashboard;
