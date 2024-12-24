import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend } from 'recharts';
import { generateChartData } from '../utils/chartUtils';
import { ChartControls } from './ChartControls';

interface TradingChartProps {
  coinValue: number;
  showLine?: boolean;
}

export const TradingChart: React.FC<TradingChartProps> = ({ coinValue, showLine = true }) => {
  const [timeframe, setTimeframe] = useState('1m');
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [chartData, setChartData] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial data generation
    setChartData(generateChartData(timeframe, coinValue));

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set update interval based on timeframe
    const updateInterval = timeframe.includes('m') ? 1000 : // 1 second for minute views
                         timeframe.includes('h') ? 5000 : // 5 seconds for hour views
                         10000; // 10 seconds for day/week/month views

    intervalRef.current = setInterval(() => {
      setChartData(generateChartData(timeframe, coinValue));
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeframe, coinValue]);

  const formatYAxisTick = (value: number): string => {
    return value.toFixed(3);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
          <p className="text-sm font-medium">{`Time: ${label}`}</p>
          <p className="text-sm text-green-500">{`Price: $${payload[0].value}`}</p>
          <p className="text-sm text-muted-foreground">{`Volume: ${payload[1]?.value || 0}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container bg-[#131722] text-[#d1d4dc]">
      <ChartControls
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        chartType={chartType}
        setChartType={setChartType}
      />
      
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="#787b86"
            tick={{ fill: '#787b86' }}
          />
          <YAxis 
            yAxisId="price"
            orientation="right"
            domain={[0, 'auto']}
            tickFormatter={formatYAxisTick}
            stroke="#787b86"
            tick={{ fill: '#787b86' }}
          />
          <YAxis 
            yAxisId="volume"
            orientation="left"
            domain={[0, 'dataMax']}
            stroke="#787b86"
            tick={{ fill: '#787b86' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {chartType === 'line' ? (
            <Line 
              yAxisId="price"
              type="monotone" 
              dataKey="value" 
              stroke="#2962FF"
              dot={false}
              strokeWidth={2}
              fill="rgba(41, 98, 255, 0.1)"
            />
          ) : (
            <Bar
              yAxisId="price"
              dataKey="value"
              fill="#2962FF"
              opacity={0.8}
            />
          )}
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill="#363a45"
            opacity={0.3}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};