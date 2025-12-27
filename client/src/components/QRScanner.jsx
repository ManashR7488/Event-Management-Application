import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { FaCamera, FaStop } from 'react-icons/fa';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [error, setError] = useState(null);

  const handleScan = (detectedCodes) => {
    // Extract the first detected QR code
    if (detectedCodes && detectedCodes.length > 0) {
      const qrText = detectedCodes[0].rawValue;
      if (qrText && onScanSuccess) {
        setScanCount(prev => prev + 1);
        onScanSuccess(qrText);
        console.log(qrText);
      }
    }
  };

  const handleError = (error) => {
    console.error('QR Scan Error:', error);
    setIsScanning(false);
    setError(error);
    if (onScanError) {
      onScanError(error);
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setError(null);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 border-b transition-colors ${
        isScanning && !error 
          ? 'bg-green-50 border-green-200' 
          : error
          ? 'bg-red-50 border-red-200'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isScanning && !error && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-800 font-medium">Camera Active</span>
              </div>
            )}
            {!isScanning && !error && (
              <p className="text-sm text-blue-800 font-medium">
                📷 Click below to activate camera
              </p>
            )}
            {error && (
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Camera Error
              </p>
            )}
          </div>
          {scanCount > 0 && (
            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
              Scanned: {scanCount}
            </span>
          )}
        </div>
      </div>

      {/* Camera View / Start Button / Error State */}
      <div className="relative">
        {!isScanning && !error && (
          // Start Scanning Button
          <div className="p-8 flex flex-col items-center justify-center space-y-4 bg-gray-50">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <FaCamera className="text-5xl text-blue-600" />
            </div>
            <button
              onClick={handleStartScanning}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
            >
              <FaCamera />
              Start Scanning
            </button>
            <p className="text-sm text-gray-600 text-center max-w-xs">
              Camera permission will be requested automatically by your browser
            </p>
          </div>
        )}

        {isScanning && !error && (
          // Camera Feed with Scanner
          <div className="relative">
            <div className="relative bg-black">
              <Scanner
                onScan={handleScan}
                onError={handleError}
                paused={!isScanning}
                constraints={{
                  facingMode: 'environment',
                }}
                scanDelay={7000}
                allowMultiple={false}
                formats={['qr_code']}
                styles={{
                  container: {
                    width: '100%',
                    paddingTop: '',
                    position: 'relative',
                  },
                  video: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  },
                }}
              />

              {/* Scanning Corner Indicators */}
              <div className="absolute inset-4 pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
              </div>

              {/* Scanning Status */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="inline-block w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="inline-block w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="inline-block w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-sm">Scanning</span>
              </div>
            </div>

            {/* Stop Button */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleStopScanning}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaStop />
                Stop Scanning
              </button>
            </div>
          </div>
        )}

        {error && (
          // Error State with Retry
          <div className="p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-red-800 mb-2">
                Camera Error
              </h3>
              <p className="text-sm text-red-600 mb-3">
                {error?.message || 'Unable to access camera. Please check permissions.'}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-xs font-semibold text-yellow-800 mb-1">
                💡 Common Solutions:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Click the camera/lock icon in your browser's address bar and allow camera access</li>
                <li>Close other apps that might be using your camera</li>
                <li>Make sure your device has a working camera connected</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setError(null);
                  handleStartScanning();
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  setIsScanning(false);
                  setError(null);
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      {!isScanning && !error && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Position the QR code within the frame. Scanning happens automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
