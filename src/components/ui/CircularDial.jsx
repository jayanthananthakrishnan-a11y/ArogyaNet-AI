import React from 'react';

const CircularDial = ({ percentage, color = '#14b8a6', title, subtitle }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-md"
            style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
          />
        </svg>
        {/* Center Text */}
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-bold text-slate-100 leading-none">{percentage}%</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">{title}</h4>
        {subtitle && <p className="text-[10px] text-slate-500 uppercase">{subtitle}</p>}
      </div>
    </div>
  );
};

export default CircularDial;
