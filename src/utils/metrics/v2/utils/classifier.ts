import { Decimal } from 'decimal.js';
import type { Position } from '../../../../types';
import type { ClassifiedPositions, MetricSettings } from '../core/types';

/**
 * 포지션 분류기
 * 한 번의 순회로 모든 분류를 완료하는 최적화된 분류기
 */
export class PositionClassifier {
  private settings: MetricSettings;
  private totalAssets: Decimal;
  
  constructor(settings: MetricSettings, totalAssets: Decimal) {
    this.settings = settings;
    this.totalAssets = totalAssets;
  }
  
  /**
   * 포지션들을 한 번의 순회로 분류
   */
  classify(positions: Position[]): ClassifiedPositions {
    const result: ClassifiedPositions = {
      // 상태별
      active: [],
      closed: [],
      pending: [],
      
      // 성과별
      wins: [],
      losses: [],
      breakeven: [],
      
      // 리스크별
      freeroll: [],
      risky: [],
      
      // 메타데이터
      totalCount: positions.length,
      lastUpdated: new Date()
    };
    
    // 한 번의 순회로 모든 분류 완료
    for (const position of positions) {
      this.classifyPosition(position, result);
    }
    
    
    return result;
  }
  
  /**
   * 개별 포지션 분류
   */
  private classifyPosition(
    position: Position, 
    result: ClassifiedPositions
  ): void {
    // 1. 상태별 분류
    if (position.status === 'ACTIVE') {
      result.active.push(position);
      
      // Active 포지션은 리스크도 분류
      this.classifyRisk(position, result);
      
    } else if (position.status === 'CLOSED') {
      result.closed.push(position);
      
      // Closed 포지션은 성과도 분류
      this.classifyPerformance(position, result);
      
    } else if (position.status === 'PENDING') {
      result.pending.push(position);
    }
  }
  
  /**
   * 성과별 분류 (CLOSED 포지션용)
   */
  private classifyPerformance(
    position: Position,
    result: ClassifiedPositions
  ): void {
    // PnL% 계산
    const pnlPercent = this.calculatePnlPercent(position);
    const threshold = this.settings.winRateThreshold;
    
    
    if (pnlPercent >= threshold) {
      result.wins.push(position);
    } else if (pnlPercent <= -threshold) {
      result.losses.push(position);
    } else {
      // -threshold < pnl < threshold = 본전
      result.breakeven.push(position);
    }
  }
  
  /**
   * 리스크별 분류 (ACTIVE 포지션용)
   */
  private classifyRisk(
    position: Position,
    result: ClassifiedPositions
  ): void {
    const totalRisk = this.calculateTotalRisk(position);
    
    if (totalRisk <= 0) {
      result.freeroll.push(position);
    } else {
      result.risky.push(position);
    }
  }
  
  /**
   * PnL% 계산
   */
  private calculatePnlPercent(position: Position): number {
    if (!position.realizedPnl) return 0;
    
    // totalAssets가 0이거나 매우 작으면 포지션 값 기준으로 계산 (fallback)
    if (this.totalAssets.isZero() || this.totalAssets.lessThan(1)) {
      // realizedPnl 자체를 기준으로 분류 (임시)
      const pnl = position.realizedPnl.toNumber();
      if (pnl > 0) return 1; // 양수면 WIN으로 분류
      if (pnl < 0) return -1; // 음수면 LOSS로 분류
      return 0; // 0이면 BREAKEVEN
    }
    
    // 총자산 대비 실현손익 비율
    return position.realizedPnl.div(this.totalAssets).times(100).toNumber();
  }
  
  /**
   * Total Risk 계산
   */
  private calculateTotalRisk(position: Position): number {
    if (!position.stopLosses || position.stopLosses.length === 0) {
      return 0;
    }
    
    let pureRisk = new Decimal(0);
    
    // Pure Risk 계산
    position.stopLosses.forEach(sl => {
      if (sl.isActive) {
        const loss = position.avgBuyPrice.minus(sl.stopPrice).times(sl.stopQuantity);
        const totalCommissionRate = this.settings.buyCommissionRate + this.settings.sellCommissionRate;
        const commission = position.avgBuyPrice.times(sl.stopQuantity).times(totalCommissionRate);
        pureRisk = pureRisk.plus(loss).plus(commission);
      }
    });
    
    // Total Risk = Pure Risk - 실현손익
    const realizedPnl = position.realizedPnl || new Decimal(0);
    const totalRisk = pureRisk.minus(realizedPnl);
    
    return totalRisk.toNumber();
  }
}

/**
 * 포지션 분류 헬퍼 함수
 */
export function classifyPositions(
  positions: Position[],
  settings: MetricSettings,
  totalAssets: Decimal
): ClassifiedPositions {
  const classifier = new PositionClassifier(settings, totalAssets);
  return classifier.classify(positions);
}