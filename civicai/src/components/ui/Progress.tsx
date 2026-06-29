import React from 'react';

interface ProgressProps {
  value: number; // 0 to 100
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className = '',
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'bg-indigo-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500'
  };

  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full bg-white/10 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
