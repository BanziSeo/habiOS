import type { AnyMetricDefinition } from '../../core/types';

// Performance 메트릭
export {
  expectancyMetric,
  expectancyRMetric,
  payoffRatioMetric
} from './performance';

// Risk 메트릭
export {
  avgRiskPerTradeMetric,
  avgSizePerTradeMetric,
  stdDevReturnsMetric,
  downsideDeviationMetric,
  sharpeRatioMetric,
  rarocMetric
} from './risk';

// Streak 메트릭
export {
  maxConsecutiveWinsMetric,
  maxConsecutiveLossesMetric
} from './streak';

// 모든 메트릭 import
import { expectancyMetric, expectancyRMetric, payoffRatioMetric } from './performance';
import { 
  avgRiskPerTradeMetric, 
  avgSizePerTradeMetric, 
  stdDevReturnsMetric, 
  downsideDeviationMetric, 
  sharpeRatioMetric, 
  rarocMetric 
} from './risk';
import { maxConsecutiveWinsMetric, maxConsecutiveLossesMetric } from './streak';

/**
 * 모든 Advanced 메트릭
 */
export const advancedMetrics: AnyMetricDefinition[] = [
  // Performance
  expectancyMetric,
  expectancyRMetric,
  payoffRatioMetric,
  // Risk
  avgRiskPerTradeMetric,
  avgSizePerTradeMetric,
  stdDevReturnsMetric,
  downsideDeviationMetric,
  sharpeRatioMetric,
  rarocMetric,
  // Streak
  maxConsecutiveWinsMetric,
  maxConsecutiveLossesMetric
];