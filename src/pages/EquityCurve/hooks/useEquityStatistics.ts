import { useMemo } from 'react';
import type { EquityCurve } from '../../../types';
import type { EquityStatistics } from '../types';
import { calculateStatistics } from '../utils';

/**
 * Equity Curve 통계 계산 훅
 */
export function useEquityStatistics(equityCurveData: EquityCurve[]): EquityStatistics {
  const statistics = useMemo(() => {
    return calculateStatistics(equityCurveData);
  }, [equityCurveData]);

  return statistics;
}