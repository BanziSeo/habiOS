// @ts-ignore
import type { Candle } from 'chart-0714';

// 간단한 리샘플링 함수 (chart가 아직 초기화되지 않았을 때 사용)
export const resampleCandles = (candles: Candle[], groupSize: number): Candle[] => {
  const resampled: Candle[] = [];
  
  for (let i = 0; i < candles.length; i += groupSize) {
    const group = candles.slice(i, Math.min(i + groupSize, candles.length));
    if (group.length === 0) continue;
    
    resampled.push({
      time: group[0].time,
      open: group[0].open,
      high: Math.max(...group.map(c => c.high)),
      low: Math.min(...group.map(c => c.low)),
      close: group[group.length - 1].close,
      volume: group.reduce((sum, c) => sum + c.volume, 0)
    });
  }
  
  return resampled;
};