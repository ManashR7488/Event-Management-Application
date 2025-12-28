import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useTeamStore from '../../../store/teamStore';
import TeamDetailsView from '../../../components/TeamDetailsView';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { selectedTeam, getTeamById, isLoading } = useTeamStore();

  useEffect(() => {
    if (teamId) {
      getTeamById(teamId);
    }
  }, [teamId]);

  const handleBack = () => {
    navigate('/dashboard/team-lead');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner message="Loading team details..." />
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            message="Team not found or you don't have permission to view it."
            onRetry={() => getTeamById(teamId)}
          />
          <button
            onClick={handleBack}
            className="mt-4 w-full px-4 py-3 bg-slate-800 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-slate-700 hover:text-white transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-20 ">
        {/* Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px]"></div>
        </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <TeamDetailsView team={selectedTeam} onBack={handleBack} />
      </div>
    </div>
  );
};

export default TeamDetails;
