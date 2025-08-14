import { Decimal } from 'decimal.js';

// v1에서 가져온 PositionMetrics 타입
export interface PositionMetrics {
  size?: number;
  maxSize?: number;
  initialR?: Decimal;
  rMultiple?: number;
  pureRisk?: number;  // 퍼센트
  totalRisk?: number;  // 퍼센트
  pureRiskDollar?: number;  // 달러
  totalRiskDollar?: number;  // 달러
  aumPnlPercent?: number;
  aumInitialRiskPercent?: number;
}

// 집계된 통계 데이터
export interface AggregatedStats {
  // 승패 통계
  totalWins: number;
  totalLosses: number;
  winRate: number;
  
  // 수익/손실 통계
  totalProfit: Decimal;
  totalLoss: Decimal;
  netPnL: Decimal;
  
  // R-Multiple 통계
  avgWinR: number;
  avgLossR: number;
  expectancyR: number;
  
  // 리스크 통계
  totalRiskAmount: Decimal;
  avgRiskPercent: number;
  maxRiskPercent: number;
  
  // 시간 통계
  avgHoldingDays: number;
  maxHoldingDays: number;
  minHoldingDays: number;
  
  // 기타 통계
  consecutiveWins: number;
  consecutiveLosses: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
}