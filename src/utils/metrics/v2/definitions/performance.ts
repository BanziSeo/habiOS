import type { MetricDefinition, AnyMetricDefinition } from '../core/types';

/**
 * Performance 메트릭 정의
 */

export const winRateMetric: MetricDefinition<number> = {
  id: 'win-rate',
  name: 'Win Rate',
  category: 'performance',
  priority: 10,
  
  calculate: (context) => {
    const { winCount, lossCount } = context.aggregates;
    const total = winCount + lossCount;
    
    if (total === 0) return 0;
    return (winCount / total) * 100;
  },
  
  format: (value) => {
    return `${value.toFixed(1)}%`;
  },
  
  style: {
    color: (value) => value >= 50 ? '#4ADE80' : '#EF4444',
    trend: 'higher-better'
  },
  
  description: '수익 거래의 비율 (본전 거래 제외)'
};

export const avgWinRMetric: MetricDefinition<number> = {
  id: 'avg-win-r',
  name: 'Avg Win R',
  category: 'performance',
  priority: 11,
  
  calculate: (context) => {
    return context.aggregates.avgWinR;
  },
  
  format: (value) => {
    return `${value.toFixed(2)}R`;
  },
  
  style: {
    color: () => '#4ADE80', // 항상 녹색
    trend: 'higher-better'
  },
  
  description: '수익 거래의 평균 R배수'
};

export const avgLossRMetric: MetricDefinition<number> = {
  id: 'avg-loss-r',
  name: 'Avg Loss R',
  category: 'performance',
  priority: 12,
  
  calculate: (context) => {
    return context.aggregates.avgLossR;
  },
  
  format: (value) => {
    return `${value.toFixed(2)}R`;
  },
  
  style: {
    color: () => '#EF4444', // 항상 빨강
    trend: 'higher-better' // 덜 나쁜게 좋음 (예: -0.5R이 -1R보다 좋음)
  },
  
  description: '손실 거래의 평균 R배수'
};

export const avgPositionsPerDayMetric: MetricDefinition<number> = {
  id: 'avg-positions-day',
  name: 'Daily Trades',
  category: 'performance',
  priority: 13,
  
  calculate: (context) => {
    return context.aggregates.avgPositionsPerDay;
  },
  
  format: (value) => {
    return value.toFixed(2);
  },
  
  style: {
    trend: 'neutral'
  },
  
  description: '하루 평균 오픈한 포지션 수'
};

export const avgHoldingTimeMetric: MetricDefinition<number> = {
  id: 'avg-holding-time',
  name: 'Avg Hold',
  category: 'performance',
  priority: 14,
  
  calculate: (context) => {
    return context.aggregates.avgHoldingTime;
  },
  
  format: (value) => {
    return `${value.toFixed(1)} days`;
  },
  
  style: {
    trend: 'neutral'
  },
  
  description: '모든 청산 포지션의 평균 보유 기간'
};

export const avgWinnerHoldingTimeMetric: MetricDefinition<number> = {
  id: 'avg-winner-holding-time',
  name: 'Winner Hold',
  category: 'performance',
  priority: 15,
  
  calculate: (context) => {
    return context.aggregates.avgWinnerHoldingTime;
  },
  
  format: (value) => {
    return `${value.toFixed(1)} days`;
  },
  
  style: {
    trend: 'neutral'
  },
  
  description: '수익 포지션의 평균 보유 기간'
};

export const avgLoserHoldingTimeMetric: MetricDefinition<number> = {
  id: 'avg-loser-holding-time',
  name: 'Loser Hold',
  category: 'performance',
  priority: 16,
  
  calculate: (context) => {
    return context.aggregates.avgLoserHoldingTime;
  },
  
  format: (value) => {
    return `${value.toFixed(1)} days`;
  },
  
  style: {
    trend: 'lower-better' // 손실은 빨리 자르는게 좋음
  },
  
  description: '손실 포지션의 평균 보유 기간'
};

/**
 * 모든 Performance 메트릭
 */
export const performanceMetrics: AnyMetricDefinition[] = [
  winRateMetric,
  avgWinRMetric,
  avgLossRMetric,
  avgPositionsPerDayMetric,
  avgHoldingTimeMetric,
  avgWinnerHoldingTimeMetric,
  avgLoserHoldingTimeMetric
];