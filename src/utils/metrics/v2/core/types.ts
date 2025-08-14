import { Decimal } from 'decimal.js';
import type { Position } from '../../../../types';

/**
 * 메트릭 카테고리
 */
export type MetricCategory = 'portfolio' | 'performance' | 'risk' | 'custom';

/**
 * 메트릭 트렌드 방향
 */
export type MetricTrend = 'higher-better' | 'lower-better' | 'neutral';

/**
 * 모든 가능한 메트릭 값 타입들의 유니온
 */
export type MetricValueTypes = 
  | number 
  | string 
  | { wins: number; losses: number; winRate: number }
  | { total: number; freeroll: number; risky: number }
  | null;

/**
 * 모든 가능한 메트릭 정의들의 유니온 타입
 */
export type AnyMetricDefinition = 
  | MetricDefinition<number>
  | MetricDefinition<string>
  | MetricDefinition<{ wins: number; losses: number; winRate: number }>
  | MetricDefinition<{ total: number; freeroll: number; risky: number }>
  | MetricDefinition<null>;

/**
 * 포지션 분류 결과
 */
export interface ClassifiedPositions {
  // 상태별
  active: Position[];
  closed: Position[];
  pending: Position[];
  
  // 성과별
  wins: Position[];
  losses: Position[];
  breakeven: Position[];
  
  // 리스크별
  freeroll: Position[];
  risky: Position[];
  
  // 메타데이터
  totalCount: number;
  lastUpdated: Date;
}

/**
 * 집계 데이터
 */
export interface AggregatedData {
  // 기본 집계
  totalPositions: number;
  activeCount: number;
  closedCount: number;
  
  // 성과 집계
  winCount: number;
  lossCount: number;
  breakevenCount: number;
  totalWinAmount: Decimal;
  totalLossAmount: Decimal;
  avgWinAmount: Decimal;
  avgLossAmount: Decimal;
  
  // R-Multiple 집계
  totalWinR: number;
  totalLossR: number;
  avgWinR: number;
  avgLossR: number;
  
  // 리스크 집계 (이름 변경: pure → open, total → net)
  totalPureRisk: Decimal;  // 퍼센트 (open risk)
  totalRisk: Decimal;  // 퍼센트 (net risk)
  totalPureRiskDollar: Decimal;  // 달러 (open risk)
  totalRiskDollar: Decimal;  // 달러 (net risk)
  freerollCount: number;
  riskyCount: number;
  
  // 자산 집계
  totalStockValue: Decimal;
  totalCashValue: Decimal;
  stockRatio: number;
  cashRatio: number;
  
  // 시간 집계
  avgHoldingTime: number;
  avgWinnerHoldingTime: number;
  avgLoserHoldingTime: number;
  tradingDays: number;
  avgPositionsPerDay: number;
}

/**
 * 메트릭 계산 컨텍스트
 */
export interface MetricContext {
  // 기본 데이터
  positions: Position[];
  totalAssets: Decimal;
  accountCreatedDate: Date;
  
  // 분류된 데이터
  classified: ClassifiedPositions;
  
  // 집계 데이터
  aggregates: AggregatedData;
  
  // 설정
  settings: MetricSettings;
  
  // 캐시 (선택적)
  cache?: Map<string, MetricResult>;
}

/**
 * 메트릭 설정
 */
export interface MetricSettings {
  winRateThreshold: number;  // 본전 임계값 (기본: 0.05%)
  buyCommissionRate: number;  // 매수 수수료 (기본: 0.0007)
  sellCommissionRate: number; // 매도 수수료 (기본: 0.0007)
  currency: 'KRW' | 'USD';
}

/**
 * 메트릭 포맷터 옵션
 */
export interface MetricFormatter {
  prefix?: string;
  suffix?: string;
  precision?: number;
  thousandSeparator?: boolean;
}

/**
 * 메트릭 스타일 옵션
 */
export interface MetricStyle<T = unknown> {
  color?: (value: T) => string;
  icon?: string;
  trend?: MetricTrend;
}

/**
 * 메트릭 정의
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface MetricDefinition<T = unknown> {
  // 식별자
  id: string;
  name: string;
  category: MetricCategory;
  
  // 계산
  calculate: (context: MetricContext) => T;
  
  // 포맷팅
  format: (value: T, formatter?: MetricFormatter) => string;
  formatter?: MetricFormatter;
  
  // 스타일링
  style?: MetricStyle<T>;
  
  // 메타데이터
  description?: string;
  dependencies?: string[];  // 다른 메트릭 의존성
  cacheable?: boolean;     // 캐시 가능 여부 (기본: true)
  priority?: number;       // 계산 우선순위 (낮을수록 먼저)
}

/**
 * 메트릭 계산 결과
 */
export interface MetricResult<T = unknown> {
  id: string;
  value: T;
  formatted: string;
  timestamp: number;
  error?: Error;
}

/**
 * 메트릭 결과 맵
 */
export type MetricResults = Map<string, MetricResult>;

/**
 * 메트릭 검증 결과
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}