import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change }) => {
  return (
    <div className="stat-card group relative overflow-hidden">
      {/* Glassy ray effect overlay */}
      <div className="absolute -inset-full h-[200%] w-[200%] rotate-45 translate-x-[-100%] transition-all duration-700 bg-gradient-to-tr from-transparent via-white/10 to-transparent group-hover:translate-x-[100%] z-20 pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="text-sm sm:text-base text-muted-foreground mb-2">{title}</h3>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{value}</div>
        {change && (
          <div className={`text-sm sm:text-base mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
};