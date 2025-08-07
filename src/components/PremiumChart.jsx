import { useState, useEffect } from 'react';

const PremiumChart = ({ data, title, type = 'bar', gradient = 'blue' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const gradients = {
    blue: 'from-blue-500 to-cyan-400',
    purple: 'from-purple-500 to-pink-400',
    green: 'from-green-500 to-emerald-400',
    orange: 'from-orange-500 to-yellow-400'
  };

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="glass-dark rounded-2xl p-8 shadow-executive hover-luxury group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white group-hover:holographic transition-all duration-500">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400 font-medium">Real-time</span>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="group/item">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-200 group-hover/item:text-white transition-colors">
                {item.label}
              </span>
              <span className="text-sm font-bold text-blue-400">{item.value}</span>
            </div>
            <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradients[gradient]} rounded-full transition-all duration-1000 ease-out chart-glow`}
                style={{
                  width: isVisible ? `${(item.value / maxValue) * 100}%` : '0%',
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Holographic scanning line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-data-stream" 
             style={{ animationDuration: '3s' }} />
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, subtitle, trend, icon }) => {
  return (
    <div className="metric-card glass-dark rounded-2xl p-6 shadow-luxury hover-luxury group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 group-hover:animate-glow-pulse">
          <span className="text-2xl">{icon}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <svg className={`w-3 h-3 ${trend > 0 ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
          {title}
        </h3>
        <div className="text-3xl font-black text-white group-hover:holographic transition-all duration-500">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-white/70 group-hover:text-white/90 transition-colors">
            {subtitle}
          </p>
        )}
      </div>

      {/* Animated progress indicator */}
      <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-quantum-ripple" />
      </div>
    </div>
  );
};

const RadialChart = ({ data, title, size = 120 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = isVisible ? (data.percentage / 100) * circumference : 0;

  return (
    <div className="glass-dark rounded-2xl p-6 text-center shadow-luxury hover-luxury group">
      <h3 className="text-lg font-bold text-white mb-4 group-hover:holographic transition-all duration-500">
        {title}
      </h3>
      
      <div className="relative inline-block">
        <svg width={size} height={size} className="transform -rotate-90 group-hover:animate-ai-processing">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgb(55, 65, 81)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${strokeDasharray} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-2000 ease-out chart-glow"
            style={{ transitionDelay: '500ms' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" />
              <stop offset="50%" stopColor="rgb(147, 51, 234)" />
              <stop offset="100%" stopColor="rgb(236, 72, 153)" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-black text-white group-hover:holographic transition-all duration-500">
              {data.percentage}%
            </div>
            <div className="text-xs text-gray-400">
              {data.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PremiumChart, MetricCard, RadialChart };