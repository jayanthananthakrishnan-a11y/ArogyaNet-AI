import React from 'react';

const MiniBarChart = ({ data, color = '#8b5cf6', height = 60 }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  
  return (
    <div className="flex items-end justify-between w-full gap-[2px] mt-2" style={{ height: `${height}px` }}>
      {data.map((value, idx) => {
        const heightPct = (value / max) * 100;
        return (
          <div key={idx} className="w-full flex justify-center h-full items-end group relative">
            <div 
              className="w-full rounded-t-sm transition-all duration-500 ease-out opacity-70 group-hover:opacity-100 relative"
              style={{ 
                height: `${heightPct}%`, 
                backgroundColor: color,
                boxShadow: `0 -2px 5px ${color}60`
              }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute -top-8 bg-slate-900 border border-white/10 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 font-mono shadow-xl transition-opacity">
               {value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MiniBarChart;
