const StatsCard = ({ icon, label, value, color = 'blue', percentage, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500/40 shadow-lg shadow-blue-500/5',
    green: 'bg-green-500/10 text-green-400 border-green-500/20 hover:border-green-500/40 shadow-lg shadow-green-500/5',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/40 shadow-lg shadow-purple-500/5',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:border-orange-500/40 shadow-lg shadow-orange-500/5',
    red: 'bg-red-500/10 text-red-400 border-red-500/20 hover:border-red-500/40 shadow-lg shadow-red-500/5',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:border-yellow-500/40 shadow-lg shadow-yellow-500/5',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40 shadow-lg shadow-cyan-500/5',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20 hover:border-pink-500/40 shadow-lg shadow-pink-500/5',
  };

  // Fallback for unknown colors
  const activeColorClass = colorClasses[color] || colorClasses['blue'];

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  };

  return (
    <div className={`glass-card p-6 border transition-all duration-300 hover:transform hover:-translate-y-1 ${activeColorClass}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5`}>
          {icon}
        </div>
        {percentage !== undefined && trend && (
          <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full bg-white/5 border border-white/5 ${trendColors[trend]}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {percentage}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
