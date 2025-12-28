import { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaSignOutAlt, FaUserCircle, FaGem } from 'react-icons/fa';
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
      <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
         {/* Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px]"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <TeamDetailsView team={selectedTeam} onBack={handleBackToDashboard} />
        </div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden pt-20">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <FaGem className="text-white text-lg" />
               </div>
               <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Team Lead <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Hub</span></h1>
                  <p className="text-xs text-slate-400 hidden sm:block">Manage your teams and registrations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-1.5 border border-white/5">
                <FaUserCircle className="text-2xl text-cyan-400" />
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-white leading-none">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 hover:shadow-lg hover:shadow-red-500/20"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('myTeams')}
              className={`flex items-center gap-2 px-2 py-4 border-b-2 transition-all text-sm font-bold tracking-wide ${
                activeTab === 'myTeams'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FaUsers className={activeTab === 'myTeams' ? 'animate-pulse' : ''} />
              MY TEAMS
              {teams.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full ${activeTab === 'myTeams' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  {teams.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('registerTeam')}
              className={`flex items-center gap-2 px-2 py-4 border-b-2 transition-all text-sm font-bold tracking-wide ${
                activeTab === 'registerTeam'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FaPlus className={activeTab === 'registerTeam' ? 'animate-pulse' : ''} />
              REGISTER TEAM
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeTab === 'myTeams' && (
          <div className="animate-fade-in-up">
            {isLoading ? (
              <LoadingSpinner message="Loading your teams..." />
            ) : teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-slate-900/50 rounded-2xl p-10 shadow-xl border border-white/5 max-w-md mx-auto text-center backdrop-blur-sm">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                     <FaUsers className="h-10 w-10 text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No Teams Yet</h3>
                  <p className="text-slate-400 mb-8 leading-relaxed">
                    You haven't registered any teams yet. Get started by participating in upcoming events!
                  </p>
                  <button
                    onClick={() => setActiveTab('registerTeam')}
                    className="flex items-center gap-2 mx-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all font-bold shadow-lg shadow-cyan-500/20 hover:scale-105"
                  >
                    <FaPlus />
                    Register First Team
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                    <span className="w-1 h-8 bg-cyan-500 rounded-full"></span>
                    Your Teams
                  </h2>
                  <button
                    onClick={() => fetchMyTeams()}
                    className="text-sm text-cyan-400 hover:text-cyan-300 font-medium px-4 py-2 hover:bg-cyan-500/10 rounded-lg transition-colors border border-transparent hover:border-cyan-500/20"
                  >
                    Refresh List
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map((team, index) => (
                    <div key={team._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                       <TeamCard
                         team={team}
                         onClick={() => handleTeamClick(team)}
                       />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'registerTeam' && (
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="glass-card rounded-2xl shadow-xl border border-white/10 p-6 md:p-10 relative overflow-hidden">
               {/* Decorative Gradient */}
               <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
               
              <div className="mb-8 relative z-10">
                <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Register New Team</h2>
                <p className="text-slate-400 text-lg">
                  Fill in the details below to register your team for an event.
                </p>
              </div>
              <div className="relative z-10">
                 <TeamRegistrationForm onSuccess={handleRegistrationSuccess} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeadDashboard;
