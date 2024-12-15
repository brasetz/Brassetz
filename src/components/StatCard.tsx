import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change }) => {
  return (
    <div className="stat-card">
      <h3 className="text-sm text-muted-foreground">{title}</h3>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {change && (
        <div className={`text-sm ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </div>
      )}
    </div>
  );
};