import { useState } from 'react';
import { FaUtensils, FaQrcode, FaRedo, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import QRScanner from '../../components/QRScanner';
import ManualQRInput from '../../components/ManualQRInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import FoodEligibilityStatus from '../../components/FoodEligibilityStatus';
import { checkFoodEligibility } from '../../api/foodService';
import useAuthStore from '../../store/authStore';

const FoodEligibility = () => {
  const { user } = useAuthStore();
  const [eventCanteenQR, setEventCanteenQR] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkTimestamp, setCheckTimestamp] = useState(null);

  const handleCanteenQRScan = async (qrToken) => {
    if (!qrToken || qrToken.trim().length === 0) {
      toast.error('Invalid QR code');
      return;
    }

    setEventCanteenQR(qrToken);
    setIsLoading(true);
    setError('');

    try {
      const result = await checkFoodEligibility(qrToken);

      if (result.success) {
        setEligibilityResult(result);
        setCheckTimestamp(new Date());
        
        if (result.eligible) {
          toast.success('You are eligible for food!');
        } else {
          toast.error(result.error || result.message || 'Not eligible');
        }
      } else {
        setError(result.error || result.message);
        setEligibilityResult(result);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      toast.error('Failed to check eligibility');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEventCanteenQR('');
    setEligibilityResult(null);
    setError('');
    setCheckTimestamp(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner message="Checking food eligibility..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-20">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-x-1/2"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-4 shadow-lg shadow-blue-500/30">
              <FaUtensils className="text-white text-4xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Food Eligibility Check
          </h1>
          <p className="text-slate-400">
            Scan the canteen QR code to verify your food eligibility
          </p>
          {user && (
            <p className="text-sm text-cyan-400 mt-2">
              Logged in as: <span className="font-semibold">{user.name}</span>
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="glass-cad rounded-2xl shadow-2xl border border-white/10 relative h-fit">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
           
          {/* Account Not Linked Warning */}
          {(!user?.teamId || user?.memberIndex == null) && !eligibilityResult && (
            <div className="p-6 md:p-8 animate-fade-in">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <FaInfoCircle className="text-3xl text-yellow-400" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Account Not Linked
                </h3>
                <p className="text-slate-300 text-sm mb-4">
                  Your account is not linked to a team member. Please contact your team lead or link your account to continue.
                </p>
                <div className="mt-4 text-xs text-slate-400">
                  <p>Need help? Contact your team lead for assistance.</p>
                </div>
              </div>
            </div>
          )}

          {/* Scan Canteen QR */}
          {!eligibilityResult && user?.teamId && user?.memberIndex != null && (
            <div className="p-6 md:p-8 animate-fade-in">
              <div className="mb-6 relative z-10">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <FaQrcode />
                  </div>
                  Scan Canteen QR Code
                </h2>
                <p className="text-slate-400 text-sm">
                  Scan the event canteen QR code displayed at the food counter
                </p>
              </div>

              <div className="mb-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 relative z-10">
                <p className="text-sm text-blue-300">
                  Click "Start Scanning" to activate camera and scan the canteen QR code. Camera permission will be requested automatically.
                </p>
              </div>

              <div className="relative z-10">
                <QRScanner
                  onScanSuccess={handleCanteenQRScan}
                  onScanError={(err) => console.error('Scan error:', err)}
                />

                <div className="mt-6">
                  <ManualQRInput
                    onSubmit={handleCanteenQRScan}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Display Result */}
          {eligibilityResult && (
            <div className="p-6 md:p-8 animate-fade-in relative z-10 h-fit">
              <FoodEligibilityStatus
                eligible={eligibilityResult.eligible}
                memberData={eligibilityResult.data?.member}
                eventData={eligibilityResult.data?.event}
                checkInTime={eligibilityResult.data?.checkInTime}
                error={eligibilityResult.error || eligibilityResult.message || error}
                onScanAgain={handleReset}
              />

              {/* Timestamp */}
              {checkTimestamp && (
                <div className="mt-6 text-center text-xs text-slate-500 font-medium uppercase tracking-wide">
                  Checked at: {checkTimestamp.toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
                >
                  <FaRedo />
                  Scan Again
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {!eligibilityResult && error && (
            <div className="p-6 md:p-8 relative z-10">
              <ErrorMessage
                message={error}
                onRetry={handleReset}
              />
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-slate-900/50 border border-white/5 rounded-xl p-5 backdrop-blur-sm">
          <p className="text-sm text-blue-400 font-bold mb-3 flex items-center gap-2">
            <span className="text-lg">ℹ️</span> How it works:
          </p>
          <p className="text-sm text-slate-400">
            Scan the event canteen QR code displayed at the food counter. The system will automatically verify your eligibility based on your login and check-in status.
          </p>
        </div>

        {/* Troubleshooting Section */}
        <details className="mt-4 group">
          <summary className="cursor-pointer p-4 font-medium text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-xl hover:bg-yellow-500/20 transition-all flex items-center gap-2 select-none">
             <FaExclamationTriangle /> Troubleshooting: Camera Not Working?
          </summary>
          <div className="mt-2 p-5 bg-slate-900/80 border border-white/10 rounded-xl backdrop-blur-md space-y-4 shadow-xl">
            <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
              <p className="font-bold text-sm text-white mb-3">Common Issues:</p>
              <ul className="text-sm text-slate-400 space-y-3">
                <li className="flex items-start gap-2.5">
                  <span className="text-yellow-500 mt-1">•</span>
                  <div>
                    <strong className="text-slate-200">Permission Denied:</strong> Click the lock icon in your browser's address bar and allow camera access for this site.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-yellow-500 mt-1">•</span>
                  <div>
                    <strong className="text-slate-200">Camera In Use:</strong> Close other apps or browser tabs that might be using your camera.
                  </div>
                </li>
                 <li className="flex items-start gap-2.5">
                  <span className="text-yellow-500 mt-1">•</span>
                  <div>
                    <strong className="text-slate-200">HTTPS Required:</strong> Camera access requires a secure connection. Use HTTPS or localhost.
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
              <p className="font-bold text-sm text-white mb-3">Browser-Specific Instructions:</p>
              <div className="text-sm text-slate-400 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span><strong className="text-blue-400">Chrome/Edge:</strong> Address bar Lock icon → Site settings → Camera → Allow</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                   <span><strong className="text-orange-400">Firefox:</strong> Address bar Camera icon → Allow camera access</span>
                </div>
                 <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                   <span><strong className="text-purple-400">Safari:</strong> Preferences → Websites → Camera → Allow</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
              <p className="text-sm text-blue-300">
                <strong>💡 Pro Tip:</strong> If camera still doesn't work, try using the "Manual Input" option.
              </p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default FoodEligibility;
