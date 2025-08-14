import type { MetricDefinition, AnyMetricDefinition } from '../core/types';
import { Decimal } from 'decimal.js';

/**
 * Portfolio Overview 메트릭 정의
 */

export const currentValueMetric: MetricDefinition<number> = {
  id: 'current-value',
  name: 'Current Value',
  category: 'portfolio',
  priority: 1,
  
  calculate: (context) => {
    // 현재 자산 = 초기자산 + 실현손익
    const totalRealizedPnl = context.positions.reduce((sum, pos) => {
      return sum.plus(pos.realizedPnl || 0);
    }, new Decimal(0));
    
    return context.totalAssets.plus(totalRealizedPnl).toNumber();
  },
  
  format: (value, formatter) => {
    const prefix = formatter?.prefix || '';
    const precision = formatter?.precision ?? 2;
    
    return `${prefix}${value.toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    })}`;
  },
  
  formatter: {
    prefix: '₩', // 기본값, 실제로는 설정에서
    precision: 0
  },
  
  description: '계좌의 현재 총 자산 가치'
};

export const totalReturnMetric: MetricDefinition<number> = {
  id: 'total-return',
  name: 'Total Return',
  category: 'portfolio',
  priority: 2,
  
  calculate: (context) => {
    // 총 수익률 = 총실현손익 / 초기자산 * 100
    const totalRealizedPnl = context.positions.reduce((sum, pos) => {
      return sum.plus(pos.realizedPnl || 0);
    }, new Decimal(0));
    
    if (context.totalAssets.isZero()) return 0;
    
    return totalRealizedPnl.div(context.totalAssets).times(100).toNumber();
  },
  
  format: (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  },
  
  style: {
    color: (value) => value >= 0 ? '#52c41a' : '#ff4d4f',
    trend: 'higher-better'
  },
  
  description: '계좌 개설 이후 총 수익률'
};

export const maxDrawdownMetric: MetricDefinition<number> = {
  id: 'max-drawdown',
  name: 'Max Drawdown',
  category: 'portfolio',
  priority: 3,
  
  calculate: (context) => {
    // 최대 낙폭 계산 - 날짜순으로 정렬된 포지션의 누적 손익 추적
    const sortedPositions = [...context.positions]
      .filter(p => p.closeDate)
      .sort((a, b) => new Date(a.closeDate!).getTime() - new Date(b.closeDate!).getTime());
    
    if (sortedPositions.length === 0) return 0;
    
    let cumulativePnl = new Decimal(0);
    let maxValue = new Decimal(0);
    let maxDrawdown = new Decimal(0);
    
    sortedPositions.forEach(position => {
      cumulativePnl = cumulativePnl.plus(position.realizedPnl || 0);
      
      // 최고점 갱신
      if (cumulativePnl.greaterThan(maxValue)) {
        maxValue = cumulativePnl;
      }
      
      // 현재 낙폭 계산
      const currentDrawdown = cumulativePnl.minus(maxValue);
      if (currentDrawdown.lessThan(maxDrawdown)) {
        maxDrawdown = currentDrawdown;
      }
    });
    
    // 낙폭을 퍼센트로 변환 (초기자산 + 최고점 대비)
    if (maxValue.isZero() && context.totalAssets.isZero()) return 0;
    
    const denominator = context.totalAssets.plus(maxValue);
    return maxDrawdown.div(denominator).times(100).toNumber();
  },
  
  format: (value) => {
    return `${value.toFixed(2)}%`;
  },
  
  style: {
    color: () => '#ff4d4f', // 항상 빨강
    trend: 'lower-better'
  },
  
  description: '최고점 대비 최대 하락률'
};

export const tradingDaysMetric: MetricDefinition<number> = {
  id: 'trading-days',
  name: 'Trading Days',
  category: 'portfolio',
  priority: 4,
  
  calculate: (context) => {
    return context.aggregates.tradingDays;
  },
  
  format: (value) => {
    return value.toString();
  },
  
  style: {
    trend: 'neutral'
  },
  
  description: '실제 거래가 발생한 일수'
};

export const stockCashRatioMetric: MetricDefinition<string> = {
  id: 'stock-cash',
  name: 'Stock / Cash',
  category: 'portfolio',
  priority: 5,
  
  calculate: (context) => {
    const { stockRatio, cashRatio } = context.aggregates;
    return `${stockRatio.toFixed(1)}% / ${cashRatio.toFixed(1)}%`;
  },
  
  format: (value) => value,
  
  style: {
    trend: 'neutral'
  },
  
  description: '현재 주식과 현금의 비율'
};

// 개별 stock ratio 메트릭 (facade에서 사용)
export const stockRatioMetric: MetricDefinition<number> = {
  id: 'stock-ratio',
  name: 'Stock Ratio',
  category: 'portfolio',
  priority: 6,
  
  calculate: (context) => {
    return context.aggregates.stockRatio;
  },
  
  format: (value) => `${value.toFixed(1)}%`,
  
  style: {
    trend: 'neutral'
  },
  
  description: 'Percentage of total assets in stocks'
};

// 개별 cash ratio 메트릭 (facade에서 사용)
export const cashRatioMetric: MetricDefinition<number> = {
  id: 'cash-ratio',
  name: 'Cash Ratio',
  category: 'portfolio',
  priority: 7,
  
  calculate: (context) => {
    return context.aggregates.cashRatio;
  },
  
  format: (value) => `${value.toFixed(1)}%`,
  
  style: {
    trend: 'neutral'
  },
  
  description: 'Percentage of total assets in cash'
};

/**
 * 모든 Portfolio 메트릭
 */
export const portfolioMetrics: AnyMetricDefinition[] = [
  currentValueMetric,
  totalReturnMetric,
  maxDrawdownMetric,
  tradingDaysMetric,
  stockCashRatioMetric,
  stockRatioMetric,
  cashRatioMetric
];