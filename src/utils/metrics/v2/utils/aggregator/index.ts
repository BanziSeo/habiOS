import { Decimal } from 'decimal.js';
import type { Position } from '../../../../../types';
import type { ClassifiedPositions, AggregatedData, MetricSettings } from '../../core/types';
import { calculatePositionMetrics } from './positionMetrics';
import { calculateHoldingTimes, calculateTradingDays, calculateAvgPositionsPerDay } from './timeMetrics';

/**
 * 데이터 집계기
 * 분류된 포지션에서 각종 통계를 계산
 */
export class DataAggregator {
  private settings: MetricSettings;
  private totalAssets: Decimal;
  
  constructor(totalAssets: Decimal, settings: MetricSettings) {
    this.totalAssets = totalAssets;
    this.settings = settings;
  }
  
  /**
   * 분류된 포지션에서 집계 데이터 생성
   */
  aggregate(
    positions: Position[],
    classified: ClassifiedPositions
  ): AggregatedData {
    // 기본 카운트
    const totalPositions = positions.length;
    const activeCount = classified.active.length;
    const closedCount = classified.closed.length;
    const winCount = classified.wins.length;
    const lossCount = classified.losses.length;
    const breakevenCount = classified.breakeven.length;
    const freerollCount = classified.freeroll.length;
    const riskyCount = classified.risky.length;
    
    // 금액 집계
    let totalWinAmount = new Decimal(0);
    let totalLossAmount = new Decimal(0);
    let totalWinR = 0;
    let totalLossR = 0;
    let winRCount = 0;
    let lossRCount = 0;
    
    // 수익 포지션 집계
    classified.wins.forEach(position => {
      if (position.realizedPnl) {
        totalWinAmount = totalWinAmount.plus(position.realizedPnl);
      }
      
      // R-Multiple 계산
      const metrics = calculatePositionMetrics(
        position,
        this.totalAssets,
        this.settings.buyCommissionRate,
        this.settings.sellCommissionRate
      );
      
      if (metrics.rMultiple !== undefined) {
        totalWinR += metrics.rMultiple;
        winRCount++;
      }
    });
    
    // 손실 포지션 집계
    classified.losses.forEach(position => {
      if (position.realizedPnl) {
        totalLossAmount = totalLossAmount.plus(position.realizedPnl.abs());
      }
      
      const metrics = calculatePositionMetrics(
        position,
        this.totalAssets,
        this.settings.buyCommissionRate,
        this.settings.sellCommissionRate
      );
      
      if (metrics.rMultiple !== undefined) {
        totalLossR += metrics.rMultiple;
        lossRCount++;
      }
    });
    
    // 평균 계산
    const avgWinAmount = winCount > 0 
      ? totalWinAmount.div(winCount) 
      : new Decimal(0);
    
    const avgLossAmount = lossCount > 0 
      ? totalLossAmount.div(lossCount) 
      : new Decimal(0);
    
    const avgWinR = winRCount > 0 ? totalWinR / winRCount : 0;
    const avgLossR = lossRCount > 0 ? totalLossR / lossRCount : 0;
    
    // 리스크 집계
    let totalPureRisk = new Decimal(0);  // 퍼센트
    let totalRisk = new Decimal(0);  // 퍼센트
    let totalPureRiskDollar = new Decimal(0);  // 달러
    let totalRiskDollar = new Decimal(0);  // 달러
    
    classified.active.forEach(position => {
      const metrics = calculatePositionMetrics(
        position,
        this.totalAssets,
        this.settings.buyCommissionRate,
        this.settings.sellCommissionRate
      );
      
      if (metrics.pureRisk !== undefined) {
        totalPureRisk = totalPureRisk.plus(metrics.pureRisk);
      }
      
      if (metrics.pureRiskDollar !== undefined) {
        totalPureRiskDollar = totalPureRiskDollar.plus(metrics.pureRiskDollar);
      }
      
      if (metrics.totalRisk !== undefined) {
        totalRisk = totalRisk.plus(metrics.totalRisk);
      }
      
      if (metrics.totalRiskDollar !== undefined) {
        totalRiskDollar = totalRiskDollar.plus(metrics.totalRiskDollar);
      }
    });
    
    // 자산 비율 계산
    let totalStockValue = new Decimal(0);
    
    classified.active.forEach(position => {
      const positionValue = position.avgBuyPrice.times(position.totalShares);
      totalStockValue = totalStockValue.plus(positionValue);
    });
    
    const totalCashValue = this.totalAssets.minus(totalStockValue);
    const stockRatio = this.totalAssets.gt(0) 
      ? totalStockValue.div(this.totalAssets).times(100).toNumber() 
      : 0;
    const cashRatio = this.totalAssets.gt(0) 
      ? totalCashValue.div(this.totalAssets).times(100).toNumber() 
      : 0;
    
    // 시간 관련 집계
    const holdingTimes = calculateHoldingTimes(classified);
    const tradingDays = calculateTradingDays(positions);
    const avgPositionsPerDay = calculateAvgPositionsPerDay(classified);
    
    return {
      // 기본 집계
      totalPositions,
      activeCount,
      closedCount,
      
      // 성과 집계
      winCount,
      lossCount,
      breakevenCount,
      totalWinAmount,
      totalLossAmount,
      avgWinAmount,
      avgLossAmount,
      
      // R-Multiple 집계
      totalWinR,
      totalLossR,
      avgWinR,
      avgLossR,
      
      // 리스크 집계
      totalPureRisk,
      totalRisk,
      totalPureRiskDollar,
      totalRiskDollar,
      freerollCount,
      riskyCount,
      
      // 자산 집계
      totalStockValue,
      totalCashValue,
      stockRatio,
      cashRatio,
      
      // 시간 집계
      ...holdingTimes,
      tradingDays,
      avgPositionsPerDay
    };
  }
}

/**
 * 데이터 집계 헬퍼 함수
 */
export function aggregateData(
  positions: Position[],
  classified: ClassifiedPositions,
  totalAssets: Decimal,
  settings: MetricSettings
): AggregatedData {
  const aggregator = new DataAggregator(totalAssets, settings);
  return aggregator.aggregate(positions, classified);
}

// Re-export types
export type { PositionMetrics, AggregatedStats } from './types';