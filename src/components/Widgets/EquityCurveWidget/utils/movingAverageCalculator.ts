/**
 * 이동평균선 계산 유틸리티
 */

/**
 * 단순 이동평균(SMA) 계산
 */
export function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  
  return result;
}

/**
 * 지수 이동평균(EMA) 계산
 */
export function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      // 첫 번째 EMA는 SMA로 계산
      const sum = data.slice(0, period).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    } else {
      // EMA = (현재값 - 이전 EMA) * multiplier + 이전 EMA
      const previousEMA = result[i - 1] as number;
      const ema = (data[i] - previousEMA) * multiplier + previousEMA;
      result.push(ema);
    }
  }
  
  return result;
}

/**
 * 이동평균 계산 (타입에 따라 SMA 또는 EMA 계산)
 */
export function calculateMovingAverage(
  data: number[], 
  period: number, 
  type: 'SMA' | 'EMA'
): (number | null)[] {
  if (type === 'EMA') {
    return calculateEMA(data, period);
  }
  return calculateSMA(data, period);
}