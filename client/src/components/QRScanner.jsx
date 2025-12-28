import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { FaCamera, FaStop, FaExclamationTriangle } from "react-icons/fa";

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(null);

  const handleScan = (detectedCodes) => {
    // Skip if already processing or in cooldown
    if (isProcessing) {
      return;
    }

    // Extract the first detected QR code
    if (detectedCodes && detectedCodes.length > 0) {
      const qrText = detectedCodes[0].rawValue;
      if (qrText && onScanSuccess) {
        // Set processing state to prevent multiple scans
        setIsProcessing(true);
        setScanCount((prev) => prev + 1);
        onScanSuccess(qrText);
        
        // Start 5-second cooldown
        const countdown = 1;
        setCooldownTimer(countdown);
        
        let remainingTime = countdown;
        const intervalId = setInterval(() => {
          remainingTime -= 1;
          setCooldownTimer(remainingTime);
          
          if (remainingTime <= 0) {
            clearInterval(intervalId);
            setCooldownTimer(null);
            setIsProcessing(false);
          }
        }, 1000);
      }
    }
  };

  const handleError = (error) => {
    console.error("QR Scan Error:", error);
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
    setIsProcessing(false);
    setCooldownTimer(null);
  };

  const highlightCodeOnCanvas = (detectedCodes, ctx) => {
    detectedCodes.forEach((detectedCode) => {
      const { boundingBox, cornerPoints } = detectedCode;

      // Save context for transformations
      ctx.save();

      // Draw outer glow effect
      ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 8;
      ctx.strokeRect(
        boundingBox.x - 2,
        boundingBox.y - 2,
        boundingBox.width + 4,
        boundingBox.height + 4
      );

      // Reset shadow for main box
      ctx.shadowBlur = 10;
      
      // Draw main bounding box with gradient effect
      ctx.strokeStyle = '#06B6D4'; // Cyan
      ctx.lineWidth = 4;
      ctx.strokeRect(
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height
      );

      // Draw stylish corner brackets
      const cornerLength = Math.min(boundingBox.width, boundingBox.height) * 0.15;
      const corners = [
        { x: boundingBox.x, y: boundingBox.y }, // Top-left
        { x: boundingBox.x + boundingBox.width, y: boundingBox.y }, // Top-right
        { x: boundingBox.x, y: boundingBox.y + boundingBox.height }, // Bottom-left
        { x: boundingBox.x + boundingBox.width, y: boundingBox.y + boundingBox.height } // Bottom-right
      ];

      ctx.strokeStyle = '#22D3EE'; // Brighter cyan
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
      ctx.shadowBlur = 15;

      corners.forEach((corner, index) => {
        ctx.beginPath();
        
        if (index === 0) { // Top-left
          ctx.moveTo(corner.x + cornerLength, corner.y);
          ctx.lineTo(corner.x, corner.y);
          ctx.lineTo(corner.x, corner.y + cornerLength);
        } else if (index === 1) { // Top-right
          ctx.moveTo(corner.x - cornerLength, corner.y);
          ctx.lineTo(corner.x, corner.y);
          ctx.lineTo(corner.x, corner.y + cornerLength);
        } else if (index === 2) { // Bottom-left
          ctx.moveTo(corner.x + cornerLength, corner.y);
          ctx.lineTo(corner.x, corner.y);
          ctx.lineTo(corner.x, corner.y - cornerLength);
        } else { // Bottom-right
          ctx.moveTo(corner.x - cornerLength, corner.y);
          ctx.lineTo(corner.x, corner.y);
          ctx.lineTo(corner.x, corner.y - cornerLength);
        }
        
        ctx.stroke();
      });

      // Draw animated corner points with rings
      ctx.shadowBlur = 20;
      cornerPoints.forEach((point, index) => {
        // Outer ring (pulsing effect)
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI);
        ctx.stroke();

        // Middle ring
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.stroke();

        // Inner filled circle
        ctx.shadowColor = 'rgba(34, 211, 238, 1)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#22D3EE';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Center dot
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw success indicator text
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        '✓ QR Code Detected',
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y - 15
      );

      ctx.restore();
    });
  };

  return (
    <div className="glass-card overflow-hidden border border-white/10">
      {/* Header */}
      <div
        className={`px-4 py-3 border-b transition-colors duration-300 ${
          isScanning && !error
            ? "bg-green-500/10 border-green-500/20"
            : error
            ? "bg-red-500/10 border-red-500/20"
            : "bg-white/5 border-white/10"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isScanning && !error && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                <span className="text-sm text-green-400 font-medium">
                  Camera Active
                </span>
              </div>
            )}
            {!isScanning && !error && (
              <p className="text-sm text-blue-300 font-medium flex items-center gap-2">
                <FaCamera /> Click below to activate camera
              </p>
            )}
            {error && (
              <p className="text-sm text-red-400 font-medium flex items-center gap-2">
                <FaExclamationTriangle /> Camera Error
              </p>
            )}
          </div>
          {scanCount > 0 && (
            <span className="text-xs text-white bg-white/10 px-2 py-1 rounded-full border border-white/10">
              Scanned: {scanCount}
            </span>
          )}
        </div>
      </div>

      {/* Camera View / Start Button / Error State */}
      <div className="relative min-h-[300px] flex flex-col justify-center">
        {!isScanning && !error && (
          // Start Scanning Button
          <div className="p-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-2 border border-blue-500/20 animate-pulse">
              <FaCamera className="text-5xl text-blue-400" />
            </div>
            <button
              onClick={handleStartScanning}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:-translate-y-1"
            >
              <FaCamera />
              Start Scanning
            </button>
            <p className="text-sm text-slate-400 text-center max-w-xs">
              Camera permission will be requested automatically by your browser
            </p>
          </div>
        )}

        {isScanning && !error && (
          // Camera Feed with Scanner
          <div className="relative  bg-black">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              paused={!isScanning}
              constraints={{
                facingMode: "environment",
                aspectRatio: 1, // Square aspect ratio
                // Advanced constraints
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              }}
              scanDelay={10000}
              allowMultiple={false}
              formats={["qr_code"]}
              styles={{
                container: {
                  width: "100%",
                  height: "100%",
                  padding: 0,
                },
                video: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                },
              }}
              components={{
                audio: true,
                onOff: true,
                torch: false,
                zoom: false,
                finder: false,
                tracker: highlightCodeOnCanvas,
              }}
            />

            {/* Scanning Corner Indicators */}
            <div className="absolute inset-8 pointer-events-none z-10">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-500 rounded-tl-lg shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-500 rounded-tr-lg shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-500 rounded-bl-lg shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-500 rounded-br-lg shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>

              {/* Scanning Laser Effect */}
              {/* <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-scan-line"></div> */}
            </div>

            {/* Scanning Status */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 z-20 border border-white/10">
              {isProcessing ? (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium tracking-wide uppercase">
                    Wait {cooldownTimer}s...
                  </span>
                </>
              ) : (
                <>
                  <div className="flex gap-1">
                    <span
                      className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                  <span className="text-xs font-medium tracking-wide uppercase">
                    Scanning
                  </span>
                </>
              )}
            </div>

            {/* Stop Button Overlay */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={handleStopScanning}
                className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                title="Stop Scanning"
              >
                <FaStop />
              </button>
            </div>
          </div>
        )}

        {error && (
          // Error State with Retry
          <div className="p-8 text-center bg-slate-900/50">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-500/20">
                <FaExclamationTriangle className="text-3xl text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Camera Error
              </h3>
              <p className="text-sm text-red-400 mb-3">
                {error?.message ||
                  "Unable to access camera. Please check permissions."}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-semibold text-yellow-500 mb-2 uppercase tracking-wide">
                💡 Troubleshooting:
              </p>
              <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                <li>Check browser camera permissions</li>
                <li>Ensure no other app is using the camera</li>
                <li>Refresh the page and try again</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setError(null);
                  handleStartScanning();
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  setIsScanning(false);
                  setError(null);
                }}
                className="w-full px-4 py-2 border border-white/10 text-slate-300 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Text */}
      {!isScanning && !error && (
        <div className="px-4 py-3 bg-white/5 border-t border-white/10">
          <p className="text-xs text-slate-400 text-center">
            Position the QR code within the frame to check in automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
