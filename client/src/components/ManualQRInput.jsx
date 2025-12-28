import { useState } from 'react';
import { FaKeyboard, FaQrcode, FaArrowRight } from 'react-icons/fa';

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
    <div className="glass-card p-6 border border-white/10 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <FaKeyboard className="text-blue-400 text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Manual Entry</h3>
          <p className="text-xs text-slate-400">Type the QR token below</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="relative group">
            <FaQrcode className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              placeholder="Enter QR token..."
              value={qrToken}
              onChange={(e) => {
                setQrToken(e.target.value);
                if (error) setError('');
              }}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className={`w-full pl-12 pr-4 py-4 bg-slate-900/50 border ${
                error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-slate-500 transition-all duration-300`}
            />
          </div>
          {error && <p className="text-red-400 text-xs mt-2 ml-1 animate-fade-in">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || !qrToken.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 font-bold tracking-wide"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              Check In <FaArrowRight />
            </>
          )}
        </button>

        <p className="text-xs text-slate-500 text-center">
          Press <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Enter</kbd> to submit
        </p>
      </form>
    </div>
  );
};

export default ManualQRInput;
