import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { StatCard } from './StatCard';

export const Analytics = () => {
  const buyersSellers = [
    { name: 'Buyers', value: 91 },
    { name: 'Sellers', value: 9 },
  ];

  const COLORS = ['#4caf50', '#f44336'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Visitors" value="12,453" change="+12.3%" />
        <StatCard title="Transactions" value="8,234" change="+5.7%" />
        <StatCard title="Community Members" value="15,678" change="+8.9%" />
        <StatCard title="Owners" value="120" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="stat-card">
          <h3 className="text-lg font-semibold mb-4">Buyers vs Sellers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={buyersSellers}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {buyersSellers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {buyersSellers.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span>{entry.name}: {entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="stat-card">
          <h3 className="text-lg font-semibold mb-4">Mining Groups</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Active Miners</h4>
              <div className="text-2xl">20+</div>
            </div>
            <div>
              <h4 className="font-medium">Mining Power</h4>
              <div className="text-2xl">1.2 TH/s</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};