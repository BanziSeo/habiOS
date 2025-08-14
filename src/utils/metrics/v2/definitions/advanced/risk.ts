import { Decimal } from 'decimal.js';
import type { MetricDefinition } from '../../core/types';

/**
 * Risk 관련 메트릭
 */

// 1. Average Risk per Trade (거래당 평균 리스크)
export const avgRiskPerTradeMetric: MetricDefinition<number> = {
  id: 'avg-risk-per-trade',
  name: 'Avg Risk/Trade',
  category: 'risk',
  priority: 60,
  
  calculate: (context) => {
    const { totalPositions } = context.aggregates;
    
    if (totalPositions === 0) return 0;
    
    // 전체 포지션의 평균 리스크를 계산
    const totalRisk = context.positions.reduce((sum, pos) => {
      const riskAmount = pos.maxRiskAmount;
      if (riskAmount && riskAmount.gt(0)) {
        return sum.plus(riskAmount);
      }
      return sum;
    }, new Decimal(0));
    
    const avgRisk = totalRisk.div(totalPositions);
    
    // 총자산 대비 퍼센트로 변환
    return context.totalAssets.gt(0) 
      ? avgRisk.div(context.totalAssets).times(100).toNumber()
      : 0;
  },
  
  format: (value) => `${value.toFixed(2)}%`,
  
  style: {
    color: (value) => {
      if (value <= 1) return '#52c41a';
      if (value <= 2) return '#faad14';
      return '#ff4d4f';
    },
    trend: 'lower-better'
  },
  
  description: '총 자산 대비 거래당 평균 리스크'
};

// 2. Average Size per Trade (거래당 평균 규모)
export const avgSizePerTradeMetric: MetricDefinition<number> = {
  id: 'avg-size-per-trade',
  name: 'Avg Size/Trade',
  category: 'risk',
  priority: 61,
  
  calculate: (context) => {
    const { totalPositions } = context.aggregates;
    
    if (totalPositions === 0) return 0;
    
    // 전체 포지션의 평균 투자금액을 계산
    const totalSize = context.positions.reduce((sum, pos) => {
      // 평균 매수가 * 총 주식수 = 투자금액
      const entryAmount = pos.avgBuyPrice.times(pos.totalShares);
      if (entryAmount.gt(0)) {
        return sum.plus(entryAmount);
      }
      return sum;
    }, new Decimal(0));
    
    const avgSize = totalSize.div(totalPositions);
    
    // 총자산 대비 퍼센트로 변환
    return context.totalAssets.gt(0) 
      ? avgSize.div(context.totalAssets).times(100).toNumber()
      : 0;
  },
  
  format: (value) => `${value.toFixed(2)}%`,
  
  style: {
    color: () => '#1890ff',
    trend: 'neutral'
  },
  
  description: '총 자산 대비 거래당 평균 투자 규모'
};

// 3. Standard Deviation of Returns (수익률 표준편차)
export const stdDevReturnsMetric: MetricDefinition<number> = {
  id: 'std-dev-returns',
  name: 'Std Dev',
  category: 'risk',
  priority: 70,
  
  calculate: (context) => {
    const positions = context.positions.filter(p => p.status === 'CLOSED');
    
    if (positions.length < 2) return 0;
    
    // 각 포지션의 수익률 계산 (%)
    const returns = positions.map(pos => {
      const pnl = pos.realizedPnl || new Decimal(0);
      const entryAmount = pos.avgBuyPrice.times(pos.totalShares);
      return entryAmount.gt(0) ? pnl.div(entryAmount).times(100).toNumber() : 0;
    });
    
    // 평균 수익률
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    
    // 표준편차 계산
    const variance = returns.reduce((sum, ret) => {
      const diff = ret - avgReturn;
      return sum + (diff * diff);
    }, 0) / returns.length;
    
    return Math.sqrt(variance);
  },
  
  format: (value) => `${value.toFixed(2)}%`,
  
  style: {
    color: (value) => {
      if (value <= 10) return '#52c41a';
      if (value <= 20) return '#faad14';
      return '#ff4d4f';
    },
    trend: 'lower-better'
  },
  
  description: '수익률의 변동성'
};

// 4. Downside Deviation (하방 편차)
export const downsideDeviationMetric: MetricDefinition<number> = {
  id: 'downside-deviation',
  name: 'Downside Dev',
  category: 'risk',
  priority: 71,
  
  calculate: (context) => {
    const positions = context.positions.filter(p => p.status === 'CLOSED');
    
    if (positions.length < 2) return 0;
    
    // 각 포지션의 수익률 계산 (%)
    const returns = positions.map(pos => {
      const pnl = pos.realizedPnl || new Decimal(0);
      const entryAmount = pos.avgBuyPrice.times(pos.totalShares);
      return entryAmount.gt(0) ? pnl.div(entryAmount).times(100).toNumber() : 0;
    });
    
    // 음수 수익률만 필터링
    const negativeReturns = returns.filter(ret => ret < 0);
    
    if (negativeReturns.length === 0) return 0;
    
    // 하방 편차 계산
    const sumSquaredNegative = negativeReturns.reduce((sum, ret) => {
      return sum + (ret * ret);
    }, 0);
    
    return Math.sqrt(sumSquaredNegative / positions.length);
  },
  
  format: (value) => `${value.toFixed(2)}%`,
  
  style: {
    color: (value) => {
      if (value <= 5) return '#52c41a';
      if (value <= 10) return '#faad14';
      return '#ff4d4f';
    },
    trend: 'lower-better'
  },
  
  description: '손실 수익률의 변동성'
};

// 5. Sharpe Ratio (샤프 지수)
export const sharpeRatioMetric: MetricDefinition<number> = {
  id: 'sharpe-ratio',
  name: 'Sharpe Ratio',
  category: 'risk',
  priority: 80,
  
  calculate: (context) => {
    const positions = context.positions.filter(p => p.status === 'CLOSED');
    
    if (positions.length < 2) return 0;
    
    // 각 포지션의 수익률 계산 (%)
    const returns = positions.map(pos => {
      const pnl = pos.realizedPnl || new Decimal(0);
      const entryAmount = pos.avgBuyPrice.times(pos.totalShares);
      return entryAmount.gt(0) ? pnl.div(entryAmount).times(100).toNumber() : 0;
    });
    
    // 평균 수익률
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    
    // 표준편차 계산
    const variance = returns.reduce((sum, ret) => {
      const diff = ret - avgReturn;
      return sum + (diff * diff);
    }, 0) / returns.length;
    
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 0;
    
    // Sharpe Ratio = (평균 수익률 - 무위험 수익률) / 표준편차
    // 무위험 수익률은 0으로 가정
    return avgReturn / stdDev;
  },
  
  format: (value) => value.toFixed(2),
  
  style: {
    color: (value) => {
      if (value >= 1.5) return '#52c41a';
      if (value >= 0.5) return '#faad14';
      return '#ff4d4f';
    },
    trend: 'higher-better'
  },
  
  description: '위험 대비 수익률'
};

// 6. RAROC (Risk-Adjusted Return on Capital)
export const rarocMetric: MetricDefinition<number> = {
  id: 'raroc',
  name: 'RAROC',
  category: 'risk',
  priority: 90,
  
  calculate: (context) => {
    // 총 수익 계산
    const positions = context.positions.filter(p => p.status === 'CLOSED');
    const totalReturn = positions.reduce((sum, pos) => {
      return sum.plus(pos.realizedPnl || new Decimal(0));
    }, new Decimal(0));
    
    if (positions.length < 5) return 0;
    
    // 손실만 추출하여 정렬
    const losses = positions
      .map(pos => pos.realizedPnl || new Decimal(0))
      .filter(pnl => pnl.lt(0))
      .map(pnl => pnl.abs().toNumber())
      .sort((a, b) => b - a);
    
    if (losses.length === 0) return 0;
    
    // 95% VaR (상위 5% 손실의 평균)
    const varIndex = Math.floor(losses.length * 0.05);
    const var95 = losses.slice(0, Math.max(1, varIndex))
      .reduce((sum, loss) => sum + loss, 0) / Math.max(1, varIndex);
    
    if (var95 === 0) return 0;
    
    // RAROC = 총 수익률 / VaR
    return (totalReturn.toNumber() / var95) * 100;
  },
  
  format: (value) => `${value.toFixed(1)}%`,
  
  style: {
    color: (value) => {
      if (value >= 100) return '#52c41a';
      if (value >= 50) return '#faad14';
      return '#ff4d4f';
    },
    trend: 'higher-better'
  },
  
  description: '리스크 자본 대비 수익률'
};