import { Decimal } from 'decimal.js';
import type { MetricDefinition } from '../../core/types';

/**
 * Performance 관련 메트릭
 */

// 1. Expectancy (기댓값 %)
export const expectancyMetric: MetricDefinition<number> = {
  id: 'expectancy',
  name: 'Expectancy',
  category: 'performance',
  priority: 50,
  
  calculate: (context) => {
    const { winCount, lossCount, avgWinAmount, avgLossAmount } = context.aggregates;
    const total = winCount + lossCount;
    
    if (total === 0) return 0;
    
    const winRate = winCount / total;
    const lossRate = lossCount / total;
    
    // (승률 × 평균수익률) - (패율 × 평균손실률)
    const expectancy = (winRate * avgWinAmount.toNumber()) - (lossRate * avgLossAmount.toNumber());
    
    // 총자산 대비 퍼센트로 변환
    return context.totalAssets.gt(0) 
      ? new Decimal(expectancy).div(context.totalAssets).times(100).toNumber()
      : 0;
  },
  
  format: (value) => `${value.toFixed(2)}%`,
  
  style: {
    color: (value) => value > 0 ? '#52c41a' : '#ff4d4f',
    trend: 'higher-better'
  },
  
  description: '평균적으로 한 번 거래할 때마다 기대할 수 있는 수익률'
};

// 2. Expectancy R (R 기댓값)
export const expectancyRMetric: MetricDefinition<number> = {
  id: 'expectancy-r',
  name: 'Expectancy R',
  category: 'performance',
  priority: 51,
  
  calculate: (context) => {
    const { winCount, lossCount, avgWinR, avgLossR } = context.aggregates;
    const total = winCount + lossCount;
    
    if (total === 0) return 0;
    
    const winRate = winCount / total;
    const lossRate = lossCount / total;
    
    // (승률 × 평균 Win R) + (패율 × 평균 Loss R)
    // Loss R은 음수이므로 더하기
    return (winRate * avgWinR) + (lossRate * avgLossR);
  },
  
  format: (value) => `${value.toFixed(2)}R`,
  
  style: {
    color: (value) => value > 0 ? '#52c41a' : '#ff4d4f',
    trend: 'higher-better'
  },
  
  description: 'R 기준 기댓값'
};

// 3. Payoff Ratio (손익비)
export const payoffRatioMetric: MetricDefinition<number> = {
  id: 'payoff-ratio',
  name: 'Payoff Ratio',
  category: 'performance',
  priority: 52,
  
  calculate: (context) => {
    const { avgWinAmount, avgLossAmount } = context.aggregates;
    
    if (avgLossAmount.eq(0)) return 0;
    
    // 평균수익 ÷ 평균손실
    return avgWinAmount.div(avgLossAmount).toNumber();
  },
  
  format: (value) => `${value.toFixed(2)}`,
  
  style: {
    color: (value) => {
      if (value >= 2) return '#52c41a';
      if (value >= 1) return '#faad14';
      return '#ff4d4f';
    },
    trend: 'higher-better'
  },
  
  description: '평균 수익이 평균 손실의 몇 배인지'
};