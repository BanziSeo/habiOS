import type { MetricDefinition, AnyMetricDefinition } from '../core/types';

/**
 * Risk Management 메트릭 정의
 */

export const openPositionsMetric: MetricDefinition<number> = {
  id: 'open-positions',
  name: 'Open Positions',
  category: 'risk',
  priority: 20,
  
  calculate: (context) => {
    return context.classified.active.length;
  },
  
  format: (value) => {
    return value.toString();
  },
  
  style: {
    trend: 'neutral'
  },
  
  description: '현재 보유 중인 포지션 수'
};

export const portfolioOpenRiskMetric: MetricDefinition<number> = {
  id: 'portfolio-open-risk',
  name: 'Portfolio Open Risk',
  category: 'risk',
  priority: 21,
  
  calculate: (context) => {
    // Open Risk: 모든 스탑로스 체결 시 예상 손실률 (%)
    const openRisk = context.aggregates.totalPureRisk;
    // 이미 퍼센트로 계산되어 있음
    return openRisk.toNumber();
  },
  
  format: (value) => {
    return value.toFixed(2);
  },
  
  style: {
    color: (value) => value > 0 ? '#ff4d4f' : '#52c41a',
    trend: 'lower-better'
  },
  
  description: '모든 스탑로스 체결 시 예상 손실률'
};

export const portfolioNetRiskMetric: MetricDefinition<number> = {
  id: 'portfolio-net-risk',
  name: 'Portfolio Net Risk',
  category: 'risk',
  priority: 22,
  
  calculate: (context) => {
    // Net Risk: Open Risk - 실현손익률 (%)
    const netRisk = context.aggregates.totalRisk;
    // 이미 퍼센트로 계산되어 있음
    return netRisk.toNumber();
  },
  
  format: (value) => {
    return value.toFixed(2);
  },
  
  style: {
    color: (value) => value > 0 ? '#ff4d4f' : '#52c41a',
    trend: 'lower-better'
  },
  
  description: '실현손익을 고려한 실제 리스크'
};

// 추가 메타데이터를 위한 복합 메트릭
export const openPositionsDetailMetric: MetricDefinition<{
  total: number;
  freeroll: number;
  risky: number;
}> = {
  id: 'open-positions-detail',
  name: 'Open Positions Detail',
  category: 'risk',
  priority: 23,
  
  calculate: (context) => {
    return {
      total: context.classified.active.length,
      freeroll: context.classified.freeroll.length,
      risky: context.classified.risky.length
    };
  },
  
  format: (value) => {
    return `${value.total} (${value.freeroll}F / ${value.risky}R)`;
  },
  
  style: {
    trend: 'neutral'
  },
  
  description: '오픈 포지션 상세 (Freeroll/Risky)'
};

export const winLossDetailMetric: MetricDefinition<{
  wins: number;
  losses: number;
  winRate: number;
}> = {
  id: 'win-loss-detail',
  name: 'Win/Loss Detail',
  category: 'risk',
  priority: 24,
  
  calculate: (context) => {
    const wins = context.aggregates.winCount;
    const losses = context.aggregates.lossCount;
    const total = wins + losses;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    
    return { wins, losses, winRate };
  },
  
  format: (value) => {
    return `${value.wins}W / ${value.losses}L (${value.winRate.toFixed(1)}%)`;
  },
  
  style: {
    color: (value) => value.winRate >= 50 ? '#4ADE80' : '#EF4444',
    trend: 'higher-better'
  },
  
  description: '승/패 통계'
};

// 달러 버전 리스크 메트릭
export const portfolioOpenRiskDollarMetric: MetricDefinition<number> = {
  id: 'portfolio-open-risk-dollar',
  name: 'Portfolio Open Risk ($)',
  category: 'risk',
  priority: 25,
  
  calculate: (context) => {
    // 달러 합산 값 그대로 반환
    const openRiskDollar = context.aggregates.totalPureRiskDollar;
    return openRiskDollar.toNumber();
  },
  
  format: (value) => {
    return `$${value.toFixed(2)}`;
  },
  
  style: {
    color: (value) => value > 0 ? '#ff4d4f' : '#52c41a',
    trend: 'lower-better'
  },
  
  description: '모든 스탑로스 체결 시 예상 손실 금액'
};

export const portfolioNetRiskDollarMetric: MetricDefinition<number> = {
  id: 'portfolio-net-risk-dollar',
  name: 'Portfolio Net Risk ($)',
  category: 'risk',
  priority: 26,
  
  calculate: (context) => {
    // 달러 합산 값 그대로 반환
    const netRiskDollar = context.aggregates.totalRiskDollar;
    return netRiskDollar.toNumber();
  },
  
  format: (value) => {
    return `$${value.toFixed(2)}`;
  },
  
  style: {
    color: (value) => value > 0 ? '#ff4d4f' : '#52c41a',
    trend: 'lower-better'
  },
  
  description: '실현손익을 고려한 실제 리스크 금액'
};

/**
 * 모든 Risk 메트릭
 */
export const riskMetrics: AnyMetricDefinition[] = [
  openPositionsMetric,
  portfolioOpenRiskMetric,
  portfolioNetRiskMetric,
  portfolioOpenRiskDollarMetric,
  portfolioNetRiskDollarMetric,
  openPositionsDetailMetric,
  winLossDetailMetric
];