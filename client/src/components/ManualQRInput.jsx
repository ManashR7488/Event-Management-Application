import { useState } from 'react';
import { FaKeyboard, FaQrcode } from 'react-icons/fa';

const ManualQRInput = ({ onSubmit, isLoading }) => {
  const [qrToken, setQrToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!qrToken.trim()) {
      setError('Please enter a QR token');
      return;
    }

    setError('');
    onSubmit(qrToken.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FaKeyboard className="text-blue-600 text-xl" />
        <h3 className="text-lg font-semibold text-gray-800">Manual Token Entry</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <FaQrcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter QR token manually..."
              value={qrToken}
              onChange={(e) => {
                setQrToken(e.target.value);
                if (error) setError('');
              }}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className={`w-full pl-10 pr-3 py-3 border ${
                error ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || !qrToken.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <FaQrcode />
              Check In
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Press Enter or click the button to submit
        </p>
      </form>
    </div>
  );
};

export default ManualQRInput;
