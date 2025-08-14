import type { Position } from '../../types';
import { 
  MetricsSystemV2, 
  getMetricsSystem,
  type MetricResults 
} from './v2';

// PortfolioMetrics 타입 정의
export interface PortfolioMetrics {
  // 포지션 관련
  activePositions: number;
  freerollPositions: number;
  riskyPositions: number;
  
  // 리스크 관련 (이름 변경: pure → open, total → net)
  portfolioPureRisk: number;  // 퍼센트 (open risk)
  portfolioTotalRisk: number;  // 퍼센트 (net risk)
  portfolioPureRiskDollar: number;  // 달러 (open risk)
  portfolioTotalRiskDollar: number;  // 달러 (net risk)
  
  // 자산 배분 (실시간 계산)
  currentStockValue: number;  // active 포지션들의 현재 시장가치
  currentCashValue: number;   // totalValue - currentStockValue
  stockRatio: number;
  cashRatio: number;
  
  // 성과 지표
  winRate: number;
  avgWinR: number;
  avgLossR: number;
  
  // 거래 빈도
  avgPositionsPerDay: number;
  totalTrades: number;
  totalPositions: number;
  
  // 추가 정보
  totalWins: number;
  totalLosses: number;
  totalBreakeven: number;
  breakevenThreshold: number;
  
  // Holding Time 메트릭 (일수)
  avgHoldingTime: number;      // 모든 청산된 포지션의 평균 보유 기간
  avgWinnerHoldingTime: number; // 수익 포지션의 평균 보유 기간
  avgLoserHoldingTime: number;  // 손실 포지션의 평균 보유 기간
  
  // 새 메트릭들 (Phase 2)
  expectancy: number;  // 기댓값 %
  expectancyR: number;  // R 기댓값
  payoffRatio: number;  // 손익비
  avgRiskPerTrade: number;  // 평균 리스크 %
  avgSizePerTrade: number;  // 평균 포지션 크기 %
  stdDevReturns: number;  // 수익률 표준편차
  downsideDeviation: number;  // 하방 편차
  sharpeRatio: number;  // 샤프 비율
  maxConsecutiveWins: number;  // 최대 연속 승
  maxConsecutiveLosses: number;  // 최대 연속 패
  raroc: number;  // 리스크 조정 자본수익률
}

/**
 * 메트릭 시스템 Facade
 * v2 시스템만 사용
 */
export class MetricsFacade {
  private modernSystem: MetricsSystemV2;
  
  constructor() {
    this.modernSystem = getMetricsSystem();
  }
  
  /**
   * 메트릭 계산 (v2 시스템 사용)
   */
  async calculate(
    positions: Position[],
    totalAssets: number,
    cashValue: number,
    accountCreatedDate: Date,
    _winRateThreshold: number = 0.05,
    _buyCommissionRate: number = 0.0007,
    _sellCommissionRate: number = 0.0007
  ): Promise<{
    results: PortfolioMetrics;
  }> {
    // v2 시스템으로 계산
    const modernResults = this.modernSystem.calculate(
      positions,
      totalAssets,
      accountCreatedDate
    );
    
    // v2 결과를 v1 형식으로 변환
    const portfolioMetrics = this.convertModernToLegacy(modernResults, positions, totalAssets, cashValue);
    
    return {
      results: portfolioMetrics
    };
  }
  
  /**
   * Modern (v2) 결과를 Legacy (v1) 형식으로 변환
   */
  private convertModernToLegacy(
    modernResults: MetricResults,
    positions: Position[],
    _totalAssets: number,
    cashValue: number
  ): PortfolioMetrics {
    // MetricResults는 Map이므로 get 메서드 사용
    const getMetricValue = (id: string, defaultValue: number = 0): number => {
      const metric = modernResults.get(id);
      return metric ? (metric.value as number) : defaultValue;
    };
    
    return {
      // 포지션 관련
      activePositions: getMetricValue('open-positions', 0),
      freerollPositions: getMetricValue('freeroll-positions', 0),
      riskyPositions: getMetricValue('risky-positions', 0),
      
      // 리스크 관련 (새 메트릭 ID 사용)
      portfolioPureRisk: getMetricValue('portfolio-open-risk', 0),
      portfolioTotalRisk: getMetricValue('portfolio-net-risk', 0),
      portfolioPureRiskDollar: getMetricValue('portfolio-open-risk-dollar', 0),
      portfolioTotalRiskDollar: getMetricValue('portfolio-net-risk-dollar', 0),
      
      // 자산 배분
      currentStockValue: getMetricValue('stock-value', 0),
      currentCashValue: cashValue,
      stockRatio: getMetricValue('stock-ratio', 0),
      cashRatio: getMetricValue('cash-ratio', 0),
      
      // 성과 지표
      winRate: getMetricValue('win-rate', 0),
      avgWinR: getMetricValue('avg-win-r', 0),
      avgLossR: getMetricValue('avg-loss-r', 0),
      
      // 거래 빈도
      avgPositionsPerDay: getMetricValue('avg-positions-day', 0),
      totalTrades: positions.reduce((sum, p) => sum + (p.trades?.length || 0), 0),
      totalPositions: getMetricValue('total-positions', 0),
      
      // 추가 정보
      totalWins: getMetricValue('total-wins', 0),
      totalLosses: getMetricValue('total-losses', 0),
      totalBreakeven: getMetricValue('total-breakeven', 0),
      breakevenThreshold: 0.05,
      
      // Holding Time 메트릭
      avgHoldingTime: getMetricValue('avg-holding-time', 0),
      avgWinnerHoldingTime: getMetricValue('avg-winner-holding-time', 0),
      avgLoserHoldingTime: getMetricValue('avg-loser-holding-time', 0),
      
      // 새 메트릭들 (Phase 2)
      expectancy: getMetricValue('expectancy', 0),
      expectancyR: getMetricValue('expectancy-r', 0),
      payoffRatio: getMetricValue('payoff-ratio', 0),
      avgRiskPerTrade: getMetricValue('avg-risk-per-trade', 0),
      avgSizePerTrade: getMetricValue('avg-size-per-trade', 0),
      stdDevReturns: getMetricValue('std-dev-returns', 0),
      downsideDeviation: getMetricValue('downside-deviation', 0),
      sharpeRatio: getMetricValue('sharpe-ratio', 0),
      maxConsecutiveWins: getMetricValue('max-consecutive-wins', 0),
      maxConsecutiveLosses: getMetricValue('max-consecutive-losses', 0),
      raroc: getMetricValue('raroc', 0)
    };
  }
}

/**
 * 싱글톤 인스턴스
 */
let facadeInstance: MetricsFacade | null = null;

/**
 * Facade 인스턴스 가져오기
 */
export function getMetricsFacade(): MetricsFacade {
  if (!facadeInstance) {
    facadeInstance = new MetricsFacade();
  }
  return facadeInstance;
}