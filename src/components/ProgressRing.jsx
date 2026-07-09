import React from 'react';

const ProgressRing = ({ percentage, size = 120, strokeWidth = 10, colorClass = 'text-primary-500' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track Ring */}
        <circle
          className="text-slate-100 dark:text-slate-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Animated Progress Ring */}
        <circle
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Center Percentage Text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold font-sans text-slate-800 dark:text-slate-100">{percentage}</span>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
};

export default ProgressRing;
