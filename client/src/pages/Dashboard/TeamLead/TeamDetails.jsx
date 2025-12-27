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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading team details..." />
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md">
          <ErrorMessage
            message="Team not found or you don't have permission to view it."
            onRetry={() => getTeamById(teamId)}
          />
          <button
            onClick={handleBack}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <TeamDetailsView team={selectedTeam} onBack={handleBack} />
      </div>
    </div>
  );
};

export default TeamDetails;
