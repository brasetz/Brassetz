import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Line, Bar } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend } from 'recharts';
import { Button } from './ui/button';
import moment from 'moment';

interface TradingChartProps {
  coinValue: number;
  showLine?: boolean;
}

export const TradingChart: React.FC<TradingChartProps> = ({ coinValue, showLine = true }) => {
  const [timeframe, setTimeframe] = useState('1m');
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [chartData, setChartData] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const generateTimePoints = useCallback((tf: string) => {
    const points = {
      '1m': 60,
      '5m': 60,
      '15m': 40,
      '30m': 30,
      '1h': 24,
      '1D': 24,
      '1W': 7,
      '1M': 30
    }[tf] || 60;

    const unit = tf.includes('m') ? 'minutes' : 
                tf.includes('h') ? 'hours' : 
                tf === '1D' ? 'hours' :
                tf === '1W' ? 'days' : 'days';

    return Array.from({ length: points }, (_, i) => {
      return moment().subtract(points - i - 1, unit as moment.unitOfTime.DurationConstructor);
    });
  }, []);

  const generateData = useCallback(() => {
    const timePoints = generateTimePoints(timeframe);
    const data = [];
    let baseValue = coinValue * 0.7; // Start at 70% of coin value
    let volatility = coinValue * 0.02; // 2% volatility

    for (let i = 0; i < timePoints.length; i++) {
      const time = timePoints[i];
      
      // Ensure price trends upward but with realistic fluctuations
      baseValue += volatility * (Math.random() - 0.3); // Bias towards positive movement
      const value = Math.max(0, baseValue);
      
      const volume = Math.floor(Math.random() * 1000) + 100;
      
      data.push({
        time: time.format(timeframe.includes('m') ? 'HH:mm' : 
              timeframe.includes('h') ? 'HH:mm' : 
              timeframe === '1D' ? 'HH:mm' :
              'MM-DD'),
        value: Number(value.toFixed(3)),
        volume,
        high: value + volatility * 0.5,
        low: value - volatility * 0.5,
        open: value - volatility * 0.2,
        close: value + volatility * 0.2
      });
    }
    return data;
  }, [timeframe, coinValue]);

  useEffect(() => {
    // Initial data generation
    setChartData(generateData());

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set update interval based on timeframe
    const updateInterval = timeframe.includes('m') ? 1000 : // 1 second for minute views
                         timeframe.includes('h') ? 5000 : // 5 seconds for hour views
                         10000; // 10 seconds for day/week/month views

    intervalRef.current = setInterval(() => {
      setChartData(generateData());
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeframe, generateData]);

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
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 bg-[#2a2e39] p-1 rounded-md">
            {['1m', '5m', '15m', '30m', '1h', '1D', '1W', '1M'].map(time => (
              <Button
                key={time}
                variant={timeframe === time ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(time)}
                className={`text-xs ${
                  timeframe === time 
                    ? 'bg-[#363a45] text-[#d1d4dc]' 
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
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
            domain={['auto', 'auto']}
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