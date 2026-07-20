import React from 'react';

const Sparkline = ({ data, color = '#06b6d4', className = '' }) => {
  if (!data || data.length === 0) return null;

  const validData = data.filter(d => typeof d === 'number' && !isNaN(d));
  if (!validData || validData.length === 0) return null;

  const min = Math.min(...validData);
  const max = Math.max(...validData);
  const range = max - min || 1;
  const width = 100;
  const height = 30;

  const points = validData.map((d, i) => {
    const x = (i / (validData.length - 1 || 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`w-full h-10 mt-auto pt-2 opacity-60 group-hover:opacity-100 transition-opacity ${className}`}>
      <svg viewBox={`0 -5 ${width} ${height + 10}`} className="w-full h-full overflow-visible preserve-aspect-ratio=none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          style={{ filter: `drop-shadow(0px 0px 4px ${color}40)` }}
        />
      </svg>
    </div>
  );
};

export default Sparkline;
