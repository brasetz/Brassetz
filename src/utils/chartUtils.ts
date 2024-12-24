import moment from 'moment';

export const generateTimePoints = (timeframe: string) => {
  const points = {
    '1m': 60,
    '5m': 60,
    '15m': 40,
    '30m': 30,
    '1h': 24,
    '1D': 24,
    '1W': 7,
    '1M': 30
  }[timeframe] || 60;

  const unit = timeframe.includes('m') ? 'minutes' : 
              timeframe.includes('h') ? 'hours' : 
              timeframe === '1D' ? 'hours' :
              timeframe === '1W' ? 'days' : 'days';

  return Array.from({ length: points }, (_, i) => {
    return moment().subtract(points - i - 1, unit as moment.unitOfTime.DurationConstructor);
  });
};

export const generateChartData = (timeframe: string, coinValue: number) => {
  const timePoints = generateTimePoints(timeframe);
  const data = [];
  const targetValue = coinValue;
  const volatility = coinValue * 0.01; // 1% volatility

  for (let i = 0; i < timePoints.length; i++) {
    const time = timePoints[i];
    const progress = i / (timePoints.length - 1); // Progress from 0 to 1
    
    // Ensure price trends upward with slight fluctuations
    const baseValue = targetValue * progress;
    const randomFactor = Math.random() * volatility * progress;
    const value = Math.max(0, baseValue + randomFactor);
    
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
};