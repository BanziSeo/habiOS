import { Decimal } from 'decimal.js';
import type { EquityCurve } from '../../../types';
import type { EquityStats } from '../types';

/**
 * Equity 통계 계산
 */
export const calculateEquityStats = (equityData: EquityCurve[]): EquityStats => {
  if (!equityData || equityData.length === 0) {
    return {
      currentValue: 0,
      initialValue: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      tradingDays: 0
    };
  }

  // 초기값과 현재값
  const initial = new Decimal(equityData[0].total_value);
  const current = new Decimal(equityData[equityData.length - 1].total_value);
  
  // 수익률 계산
  const returnValue = current.minus(initial);
  const returnPercent = initial.isZero() 
    ? new Decimal(0) 
    : returnValue.dividedBy(initial).times(100);
  
  // Max Drawdown 계산
  const { maxDrawdown, maxDrawdownPercent } = calculateMaxDrawdown(equityData);
  
  return {
    currentValue: current.toNumber(),
    initialValue: initial.toNumber(),
    totalReturn: returnValue.toNumber(),
    totalReturnPercent: returnPercent.toNumber(),
    maxDrawdown: maxDrawdown.toNumber(),
    maxDrawdownPercent: maxDrawdownPercent.toNumber(),
    tradingDays: equityData.length
  };
};

/**
 * 최대 손실폭(Max Drawdown) 계산
 */
export const calculateMaxDrawdown = (
  equityData: EquityCurve[]
): { maxDrawdown: Decimal; maxDrawdownPercent: Decimal } => {
  let maxValue = new Decimal(0);
  let maxDrawdown = new Decimal(0);
  let maxDrawdownPercent = new Decimal(0);
  
  equityData.forEach(item => {
    const value = new Decimal(item.total_value);
    
    // 새로운 최고점 갱신
    if (value.greaterThan(maxValue)) {
      maxValue = value;
    }
    
    // 현재 drawdown 계산
    const drawdown = maxValue.minus(value);
    const drawdownPercent = maxValue.isZero() 
      ? new Decimal(0) 
      : drawdown.dividedBy(maxValue).times(100);
    
    // 최대 drawdown 갱신
    if (drawdown.greaterThan(maxDrawdown)) {
      maxDrawdown = drawdown;
      maxDrawdownPercent = drawdownPercent;
    }
  });
  
  return { maxDrawdown, maxDrawdownPercent };
};

/**
 * 최신 총 자산 가져오기
 */
export const getLatestTotalAssets = (equityData: EquityCurve[]): Decimal | null => {
  if (!equityData || equityData.length === 0) return null;
  
  const latestEquity = equityData[equityData.length - 1];
  return new Decimal(latestEquity.total_value);
};