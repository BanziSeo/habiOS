import { Decimal } from 'decimal.js';
import type { EquityCurve } from '../../../../types';
import type { EquityStatistics } from '../types';

/**
 * Equity Curve 통계 계산
 */
export function calculateStatistics(data: EquityCurve[]): EquityStatistics {
  if (data.length === 0) {
    return {
      currentValue: 0,
      initialValue: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      sharpeRatio: 0,
    };
  }

  const initial = new Decimal(data[0].total_value);
  const current = new Decimal(data[data.length - 1].total_value);
  const returnValue = current.minus(initial);
  const returnPercent = initial.isZero() 
    ? new Decimal(0) 
    : returnValue.dividedBy(initial).times(100);

  // Max Drawdown 계산
  const { maxDrawdown, maxDrawdownPercent } = calculateMaxDrawdown(data);

  // TODO: Sharpe Ratio 계산 구현
  const sharpeRatio = 0;

  return {
    currentValue: current.toNumber(),
    initialValue: initial.toNumber(),
    totalReturn: returnValue.toNumber(),
    totalReturnPercent: returnPercent.toNumber(),
    maxDrawdown: maxDrawdown.toNumber(),
    maxDrawdownPercent: maxDrawdownPercent.toNumber(),
    sharpeRatio,
  };
}

/**
 * 최대 손실폭(Max Drawdown) 계산
 */
export function calculateMaxDrawdown(data: EquityCurve[]): {
  maxDrawdown: Decimal;
  maxDrawdownPercent: Decimal;
} {
  let maxValue = new Decimal(0);
  let maxDrawdown = new Decimal(0);
  let maxDrawdownPercent = new Decimal(0);

  data.forEach(item => {
    const value = new Decimal(item.total_value);
    
    // 새로운 최고점 갱신
    if (value.greaterThan(maxValue)) {
      maxValue = value;
    }
    
    // 현재 최고점 대비 손실 계산
    const drawdown = maxValue.minus(value);
    const drawdownPercent = maxValue.isZero() 
      ? new Decimal(0) 
      : drawdown.dividedBy(maxValue).times(100);
    
    // 최대 손실 갱신
    if (drawdown.greaterThan(maxDrawdown)) {
      maxDrawdown = drawdown;
      maxDrawdownPercent = drawdownPercent;
    }
  });

  return { maxDrawdown, maxDrawdownPercent };
}

/**
 * 샤프 비율(Sharpe Ratio) 계산
 * TODO: 구현 필요
 * 공식: (포트폴리오 수익률 - 무위험 수익률) / 포트폴리오 수익률의 표준편차
 */
export function calculateSharpeRatio(
  _returns: number[],
  _riskFreeRate: number = 0.02 // 연 2% 기본값
): number {
  // TODO: 구현
  return 0;
}