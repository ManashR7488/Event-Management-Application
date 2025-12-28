const LoadingSpinner = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className={`animate-spin rounded-full border-4 border-slate-800 ${sizeClasses[size]}`}></div>
        <div className={`absolute top-0 left-0 animate-spin rounded-full border-t-4 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] ${sizeClasses[size]}`}></div>
      </div>
      {message && <p className="mt-4 text-slate-400 font-medium tracking-wide animate-pulse">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
