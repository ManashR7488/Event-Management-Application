import { useState } from 'react';
import { FaUtensils, FaQrcode, FaArrowLeft, FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import QRScanner from '../../components/QRScanner';
import ManualQRInput from '../../components/ManualQRInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import FoodEligibilityStatus from '../../components/FoodEligibilityStatus';
import { checkFoodEligibility } from '../../api/foodService';

const FoodEligibility = () => {
  const [step, setStep] = useState(1); // 1: event QR, 2: member QR, 3: result
  const [eventCanteenQR, setEventCanteenQR] = useState('');
  const [memberQRToken, setMemberQRToken] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [checkTimestamp, setCheckTimestamp] = useState(null);

  const handleEventQRScan = (qrToken) => {
    if (!qrToken || qrToken.trim().length === 0) {
      toast.error('Invalid QR code');
      return;
    }

    setEventCanteenQR(qrToken);
    setStep(2);
    toast.success('Event QR scanned successfully!');
  };

  const handleMemberQRScan = async (qrToken) => {
    if (!qrToken || qrToken.trim().length === 0) {
      toast.error('Invalid QR code');
      return;
    }

    setMemberQRToken(qrToken);
    setIsLoading(true);
    setError('');

    try {
      const result = await checkFoodEligibility(eventCanteenQR, qrToken);

      if (result.success) {
        setEligibilityResult(result);
        setCheckTimestamp(new Date());
        setStep(3);
        
        if (result.eligible) {
          toast.success('Eligibility check complete!');
        } else {
          toast.error(result.error || result.message || 'Not eligible');
        }
      } else {
        setError(result.error || result.message);
        setEligibilityResult(result);
        setStep(3);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      toast.error('Failed to check eligibility');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setEventCanteenQR('');
    setMemberQRToken('');
    setEligibilityResult(null);
    setError('');
    setScanMode('camera');
    setCheckTimestamp(null);
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setEventCanteenQR('');
    setMemberQRToken('');
    setError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Checking food eligibility..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 rounded-full p-4">
              <FaUtensils className="text-white text-4xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Food Eligibility Check
          </h1>
          <p className="text-gray-600">
            Scan QR codes to verify your food eligibility
          </p>
        </div>

        {/* Step Indicator */}
        {step < 3 && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </span>
              <div className={`flex-1 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </span>
            </div>
            <p className="text-center text-sm text-gray-600">
              Step {step} of 2
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Step 1: Scan Event Canteen QR */}
          {step === 1 && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FaQrcode className="text-blue-600" />
                  Scan Event Canteen QR
                </h2>
                <p className="text-gray-600">
                  Scan the event canteen QR code displayed at the food counter
                </p>
              </div>

              <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Step 1:</strong> Click "Start Scanning" - camera permission will be requested automatically.
                </p>
              </div>

              <QRScanner
                onScanSuccess={handleEventQRScan}
                onScanError={(err) => console.error('Scan error:', err)}
              />

              <div className="mt-4">
                <ManualQRInput
                  onSubmit={handleEventQRScan}
                  isLoading={false}
                />
              </div>
            </div>
          )}

          {/* Step 2: Scan Member QR */}
          {step === 2 && (
            <div className="p-6">
              <button
                onClick={handleBackToStep1}
                className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <FaArrowLeft />
                Back to Event QR
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FaQrcode className="text-blue-600" />
                  Scan Your Member QR
                </h2>
                <p className="text-gray-600">
                  Now scan your personal member QR code
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="mb-4 flex gap-3">
                <button
                  onClick={() => setScanMode('camera')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    scanMode === 'camera'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📷 Camera
                </button>
                <button
                  onClick={() => setScanMode('manual')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    scanMode === 'manual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⌨️ Manual
                </button>
              </div>

              {scanMode === 'camera' ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Step 2:</strong> Click "Start Scanning" to scan member QR and check eligibility.
                    </p>
                  </div>
                  <QRScanner
                    onScanSuccess={handleMemberQRScan}
                    onScanError={(err) => console.error('Scan error:', err)}
                  />
                </div>
              ) : (
                <ManualQRInput
                  onSubmit={handleMemberQRScan}
                  isLoading={isLoading}
                />
              )}
            </div>
          )}

          {/* Step 3: Display Result */}
          {step === 3 && eligibilityResult && (
            <div className="p-6">
              <FoodEligibilityStatus
                eligible={eligibilityResult.eligible}
                memberData={eligibilityResult.data?.member}
                eventData={eligibilityResult.data?.event}
                checkInTime={eligibilityResult.data?.checkInTime}
                error={eligibilityResult.error || eligibilityResult.message || error}
              />

              {/* Timestamp */}
              {checkTimestamp && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  Checked at: {checkTimestamp.toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <FaRedo />
                  Scan Again
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {step === 3 && error && !eligibilityResult && (
            <div className="p-6">
              <ErrorMessage
                message={error}
                onRetry={handleReset}
              />
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">
            ℹ️ How it works:
          </p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>First, scan the event canteen QR code at the food counter</li>
            <li>Then, scan your personal member QR code</li>
            <li>The system will verify your eligibility and display the result</li>
          </ol>
        </div>

        {/* Troubleshooting Section */}
        <details className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <summary className="cursor-pointer p-4 font-medium text-yellow-800 hover:bg-yellow-100 transition-colors">
            🛠️ Troubleshooting: Camera Not Working?
          </summary>
          <div className="p-4 pt-0 space-y-3">
            <div className="bg-white rounded-lg p-3 border border-yellow-200">
              <p className="font-semibold text-sm text-gray-800 mb-2">Common Issues:</p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <div>
                    <strong>Permission Denied:</strong> Click the lock icon in your browser's address bar and allow camera access for this site.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <div>
                    <strong>Camera In Use:</strong> Close other apps or browser tabs that might be using your camera.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <div>
                    <strong>No Camera Found:</strong> Make sure your device has a working camera connected.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <div>
                    <strong>HTTPS Required:</strong> Camera access requires a secure connection. Use HTTPS or localhost.
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-3 border border-yellow-200">
              <p className="font-semibold text-sm text-gray-800 mb-2">Browser-Specific Instructions:</p>
              <div className="text-sm text-gray-700 space-y-2">
                <div>
                  <strong className="text-blue-600">Chrome/Edge:</strong> Click the lock or camera icon in the address bar → Site settings → Camera → Allow
                </div>
                <div>
                  <strong className="text-orange-600">Firefox:</strong> Click the camera icon in the address bar → Select "Allow" for camera access
                </div>
                <div>
                  <strong className="text-purple-600">Safari:</strong> Safari menu → Preferences → Websites → Camera → Allow for this website
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>💡 Pro Tip:</strong> If camera still doesn't work, try using the "Manual Input" option below the camera scanner.
              </p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default FoodEligibility;
