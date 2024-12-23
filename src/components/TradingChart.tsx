import React, { useState } from 'react';
import { Line, Bar } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend } from 'recharts';
import { Button } from './ui/button';

interface TradingChartProps {
  coinValue: number;
  showLine?: boolean;
}

export const TradingChart: React.FC<TradingChartProps> = ({ coinValue, showLine = true }) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  
  const generateData = () => {
    let dataPoints;
    let format;
    
    switch(timeframe) {
      case '1m':
        dataPoints = 60;
        format = 'sec';
        break;
      case '5m':
        dataPoints = 12;
        format = 'min';
        break;
      case '15m':
        dataPoints = 16;
        format = 'min';
        break;
      case '30m':
        dataPoints = 24;
        format = 'min';
        break;
      case '1h':
        dataPoints = 60;
        format = 'min';
        break;
      case '1D':
        dataPoints = 24;
        format = 'hour';
        break;
      case '1W':
        dataPoints = 7;
        format = 'day';
        break;
      case '1M':
        dataPoints = 30;
        format = 'day';
        break;
      default:
        dataPoints = 30;
        format = 'day';
    }

    const data = [];
    let value = 0;
    let volatility = coinValue * 0.02; // 2% volatility
    
    for (let i = 0; i < dataPoints; i++) {
      // Ensure price only increases
      value += volatility * (1 + Math.random() * 0.5);
      
      let label;
      if (format === 'sec') {
        label = `${i}s`;
      } else if (format === 'min') {
        label = `${i * parseInt(timeframe)}m`;
      } else if (format === 'hour') {
        label = `${i}h`;
      } else {
        label = `${i + 1}d`;
      }
      
      const volume = Math.floor(Math.random() * 1000) + 100;
      
      data.push({
        time: label,
        value: showLine ? Number(value.toFixed(3)) : 0, // Limit to 3 decimal places
        volume: volume,
        high: value + volatility * 0.5,
        low: value - volatility * 0.5,
        open: value - volatility * 0.2,
        close: value + volatility * 0.2
      });
    }
    return data;
  };

  const formatYAxisTick = (value: number): string => {
    return value.toFixed(3); // Format Y-axis ticks to 3 decimal places
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
    <div className="chart-container">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {['1m', '5m', '15m', '30m', '1h', '1D', '1W', '1M'].map(time => (
              <Button
                key={time}
                variant={timeframe === time ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(time)}
                className="text-xs"
              >
                {time}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'line' ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartType('line')}
              className="text-xs"
            >
              Line
            </Button>
            <Button
              variant={chartType === 'candle' ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartType('candle')}
              className="text-xs"
            >
              Candle
            </Button>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={generateData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            yAxisId="price"
            orientation="right"
            domain={['auto', 'auto']}
            tickFormatter={formatYAxisTick}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            yAxisId="volume"
            orientation="left"
            domain={[0, 'dataMax']}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {chartType === 'line' ? (
            <Line 
              yAxisId="price"
              type="monotone" 
              dataKey="value" 
              stroke="hsl(var(--primary))"
              dot={false}
              strokeWidth={2}
            />
          ) : (
            <Bar
              yAxisId="price"
              dataKey="value"
              fill="hsl(var(--primary))"
              opacity={0.8}
            />
          )}
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill="hsl(var(--muted))"
            opacity={0.3}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
