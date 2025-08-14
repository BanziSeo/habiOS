import { Decimal } from 'decimal.js';
import type { Position } from '../../../../../types';
import type { PositionMetrics } from './types';

/**
 * 개별 포지션 메트릭 계산
 * v1에서 가져온 로직을 그대로 유지
 */
export function calculatePositionMetrics(
  position: Position,
  totalAssets: Decimal,
  buyCommissionRate: number = 0.0007,
  sellCommissionRate: number = 0.0007
): PositionMetrics {
  const metrics: PositionMetrics = {};

  // avgBuyPrice가 Decimal 인스턴스인지 확인
  if (!position.avgBuyPrice || !(position.avgBuyPrice instanceof Decimal)) {
    return metrics;
  }

  // Size: 현재 포지션의 총자산 대비 비율 (매수가 기준)
  if (position.totalShares > 0) {
    const positionValue = position.avgBuyPrice.times(position.totalShares);
    metrics.size = positionValue.div(totalAssets).times(100).toNumber();
  }

  // Max Size: 최대 포지션의 총자산 대비 비율
  if (position.maxShares > 0) {
    const maxValue = position.avgBuyPrice.times(position.maxShares);
    metrics.maxSize = maxValue.div(totalAssets).times(100).toNumber();
  }

  // Initial R: 포지션의 최대 리스크 금액 (DB에 저장된 값 사용)
  if (position.maxRiskAmount && position.maxRiskAmount.greaterThan(0)) {
    metrics.initialR = position.maxRiskAmount;
  } else if (position.stopLosses && position.stopLosses.length > 0) {
    // max_risk_amount가 없으면 현재 스탑로스로 계산 (fallback)
    let totalRiskAmount = new Decimal(0);
    let hasActiveStopLoss = false;
    
    position.stopLosses.forEach(sl => {
      if (sl.isActive) {
        hasActiveStopLoss = true;
        const stopLoss = position.avgBuyPrice.minus(sl.stopPrice).times(sl.stopQuantity);
        // 수수료 추가 (매수 + 매도)
        const totalCommissionRate = buyCommissionRate + sellCommissionRate;
        const commission = position.avgBuyPrice.times(sl.stopQuantity).times(totalCommissionRate);
        totalRiskAmount = totalRiskAmount.plus(stopLoss).plus(commission);
      }
    });
    
    // 활성화된 스탑로스가 있을 때만 Initial R 설정
    if (hasActiveStopLoss && totalRiskAmount.greaterThan(0)) {
      metrics.initialR = totalRiskAmount;
    }
  }

  // ACTIVE 포지션의 경우, Initial R 업데이트 로직
  if (position.status === 'ACTIVE' && position.stopLosses && position.stopLosses.length > 0) {
    let currentRiskAmount = new Decimal(0);
    let hasActiveStopLoss = false;
    
    position.stopLosses.forEach(sl => {
      if (sl.isActive) {
        hasActiveStopLoss = true;
        const stopLoss = position.avgBuyPrice.minus(sl.stopPrice).times(sl.stopQuantity);
        // 수수료 추가
        const totalCommissionRate = buyCommissionRate + sellCommissionRate;
        const commission = position.avgBuyPrice.times(sl.stopQuantity).times(totalCommissionRate);
        currentRiskAmount = currentRiskAmount.plus(stopLoss).plus(commission);
      }
    });
    
    // 현재 리스크가 있고, 기존 Initial R보다 큰 경우에만 업데이트
    if (hasActiveStopLoss && currentRiskAmount.greaterThan(0)) {
      const existingInitialR = position.maxRiskAmount || new Decimal(0);
      if (currentRiskAmount.greaterThan(existingInitialR)) {
        metrics.initialR = currentRiskAmount;
      }
    }
  }

  // R-Multiple: (실현손익 + 스탑조정으로 확보된 이익) / Initial R
  if (metrics.initialR && metrics.initialR.greaterThan(0) && position.realizedPnl) {
    let totalProfit = position.realizedPnl;
    
    // Active 포지션이고 스탑로스가 있는 경우, 스탑조정으로 확보된 이익 계산
    if (position.status === 'ACTIVE' && position.stopLosses && position.stopLosses.length > 0 && position.totalShares > 0) {
      let securedProfit = new Decimal(0);
      
      position.stopLosses.forEach(sl => {
        if (sl.isActive && sl.stopPrice.greaterThan(position.avgBuyPrice)) {
          // 스탑가격이 평균매수가보다 높으면 이익 확보
          const profitPerShare = sl.stopPrice.minus(position.avgBuyPrice);
          const securedAmount = profitPerShare.times(sl.stopQuantity);
          securedProfit = securedProfit.plus(securedAmount);
        }
      });
      
      totalProfit = totalProfit.plus(securedProfit);
    }
    
    metrics.rMultiple = totalProfit.div(metrics.initialR).toNumber();
  }

  // Pure Risk %: 스탑로스 체결 시 예상 손실률 (수수료 포함)
  if (position.stopLosses && position.stopLosses.length > 0 && position.status === 'ACTIVE') {
    let totalStopLoss = new Decimal(0);
    position.stopLosses.forEach(sl => {
      if (sl.isActive) {
        const loss = position.avgBuyPrice.minus(sl.stopPrice).times(sl.stopQuantity);
        // 수수료 추가
        const totalCommissionRate = buyCommissionRate + sellCommissionRate;
        const commission = position.avgBuyPrice.times(sl.stopQuantity).times(totalCommissionRate);
        totalStopLoss = totalStopLoss.plus(loss).plus(commission);
      }
    });
    // 달러 값 저장
    metrics.pureRiskDollar = totalStopLoss.toNumber();
    // 퍼센트 값 저장
    metrics.pureRisk = totalStopLoss.div(totalAssets).times(100).toNumber();
  }

  // Total Risk %: Pure Risk - 실현손익%
  // 실현이익이 있으면 리스크 감소, 실현손실이 있으면 리스크 증가
  if (metrics.pureRisk !== undefined) {
    const realizedPnlPercent = position.realizedPnl.div(totalAssets).times(100).toNumber();
    metrics.totalRisk = metrics.pureRisk - realizedPnlPercent;
    
    // Total Risk 달러 값 계산
    if (metrics.pureRiskDollar !== undefined) {
      metrics.totalRiskDollar = metrics.pureRiskDollar - position.realizedPnl.toNumber();
    }
  }

  // AUM PnL %: 실현손익의 총자산 대비 비율
  if (position.realizedPnl) {
    metrics.aumPnlPercent = position.realizedPnl.div(totalAssets).times(100).toNumber();
  }

  // AUM Initial Risk %: Initial R의 총자산 대비 비율
  if (metrics.initialR) {
    metrics.aumInitialRiskPercent = metrics.initialR.div(totalAssets).times(100).toNumber();
  }

  return metrics;
}