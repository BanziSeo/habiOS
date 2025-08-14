import { portfolioMetrics } from './portfolio';
import { performanceMetrics } from './performance';
import { riskMetrics } from './risk';
import { advancedMetrics } from './advanced';
import type { AnyMetricDefinition } from '../core/types';

/**
 * 모든 기본 메트릭 정의
 */
export const defaultMetrics: AnyMetricDefinition[] = [
  ...portfolioMetrics,
  ...performanceMetrics,
  ...riskMetrics,
  ...advancedMetrics
];

/**
 * 메트릭 ID 상수 (타입 안정성)
 */
export const METRIC_IDS = {
  // Portfolio
  CURRENT_VALUE: 'current-value',
  TOTAL_RETURN: 'total-return',
  MAX_DRAWDOWN: 'max-drawdown',
  TRADING_DAYS: 'trading-days',
  STOCK_CASH: 'stock-cash',
  
  // Performance
  WIN_RATE: 'win-rate',
  AVG_WIN_R: 'avg-win-r',
  AVG_LOSS_R: 'avg-loss-r',
  AVG_POSITIONS_DAY: 'avg-positions-day',
  AVG_HOLDING_TIME: 'avg-holding-time',
  AVG_WINNER_HOLDING_TIME: 'avg-winner-holding-time',
  AVG_LOSER_HOLDING_TIME: 'avg-loser-holding-time',
  
  // Risk
  OPEN_POSITIONS: 'open-positions',
  PORTFOLIO_PURE_RISK: 'portfolio-pure-risk',
  PORTFOLIO_RISK: 'portfolio-risk',
  OPEN_POSITIONS_DETAIL: 'open-positions-detail',
  WIN_LOSS_DETAIL: 'win-loss-detail',
  
  // Advanced (Phase 2)
  EXPECTANCY: 'expectancy',
  EXPECTANCY_R: 'expectancy-r',
  PAYOFF_RATIO: 'payoff-ratio',
  AVG_RISK_PER_TRADE: 'avg-risk-per-trade',
  AVG_SIZE_PER_TRADE: 'avg-size-per-trade',
  STD_DEV_RETURNS: 'std-dev-returns',
  DOWNSIDE_DEVIATION: 'downside-deviation',
  SHARPE_RATIO: 'sharpe-ratio',
  MAX_CONSECUTIVE_WINS: 'max-consecutive-wins',
  MAX_CONSECUTIVE_LOSSES: 'max-consecutive-losses',
  RAROC: 'raroc'
} as const;

export type MetricId = typeof METRIC_IDS[keyof typeof METRIC_IDS];

// 개별 메트릭도 export
export * from './portfolio';
export * from './performance';
export * from './risk';
export * from './advanced';