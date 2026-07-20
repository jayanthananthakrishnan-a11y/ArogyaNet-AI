import React from 'react';

const GlowCard = ({ children, className = '', accent = 'default', title, icon: Icon, trend }) => {
  // Determine classes based on accent
  const isDefault = accent === 'default';
  
  const accentClasses = {
    cyan: { container: 'border-neon-cyan/30 shadow-glow-cyan', icon: 'text-neon-cyan bg-neon-cyan/10', bar: 'bg-neon-cyan' },
    teal: { container: 'border-neon-teal/30 shadow-glow-teal', icon: 'text-neon-teal bg-neon-teal/10', bar: 'bg-neon-teal' },
    rose: { container: 'border-neon-rose/30 shadow-glow-rose', icon: 'text-neon-rose bg-neon-rose/10', bar: 'bg-neon-rose' },
    purple: { container: 'border-neon-purple/30 shadow-glow-purple', icon: 'text-neon-purple bg-neon-purple/10', bar: 'bg-neon-purple' },
    default: { container: 'border-white/10', icon: 'text-slate-400 bg-white/5', bar: '' }
  };

  const style = accentClasses[accent] || accentClasses.default;

  return (
    <div className={`bg-cyber-card backdrop-blur-xl border ${style.container} rounded-2xl p-5 flex flex-col relative overflow-hidden group ${className}`}>
      {/* Optional Top-Left Accent Flare */}
      {!isDefault && (
        <div className={`absolute top-0 left-4 w-12 h-1 ${style.bar} rounded-b-md opacity-50`}></div>
      )}
      
      {(title || Icon) && (
        <div className="flex justify-between items-start mb-4 z-10">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2 rounded-lg ${style.icon} transition-all duration-300 group-hover:scale-110`}>
                <Icon size={20} />
              </div>
            )}
            {title && <h3 className="text-slate-300 font-medium tracking-wide text-sm uppercase">{title}</h3>}
          </div>
          {trend && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${trend.startsWith('+') ? 'bg-neon-teal/10 text-neon-teal border border-neon-teal/20' : 'bg-neon-rose/10 text-neon-rose border border-neon-rose/20'}`}>
              {trend}
            </span>
          )}
        </div>
      )}
      
      <div className="relative z-10 flex-1 flex flex-col min-h-0 w-full">
        {children}
      </div>
    </div>
  );
};

export default GlowCard;
