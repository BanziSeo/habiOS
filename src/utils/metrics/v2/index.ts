import { Decimal } from 'decimal.js';
import type { Position } from '../../../types';
import { MetricRegistry } from './core/registry';
import { classifyPositions } from './utils/classifier';
import { aggregateData } from './utils/aggregator';
import { defaultMetrics } from './definitions';
import type { 
  MetricContext, 
  MetricResults, 
  MetricSettings,
  MetricResult
} from './core/types';

// Export types
export * from './core/types';
export { MetricRegistry } from './core/registry';

/**
 * 메트릭 시스템 v2
 * 중앙화되고 최적화된 메트릭 계산 시스템
 */
export class MetricsSystemV2 {
  private registry: MetricRegistry;
  private settings: MetricSettings;
  private cache: Map<string, MetricResult>;
  
  constructor(settings?: Partial<MetricSettings>) {
    this.registry = new MetricRegistry();
    this.settings = {
      winRateThreshold: settings?.winRateThreshold ?? 0.05,
      buyCommissionRate: settings?.buyCommissionRate ?? 0.0007,
      sellCommissionRate: settings?.sellCommissionRate ?? 0.0007,
      currency: settings?.currency ?? 'KRW'
    };
    
    // 기본 메트릭 등록
    this.registerDefaultMetrics();
    
    // 캐시 초기화
    this.cache = new Map();
  }
  
  /**
   * 기본 메트릭 등록
   */
  private registerDefaultMetrics(): void {
    this.registry.registerAll(defaultMetrics);
  }
  
  /**
   * 메트릭 계산
   */
  calculate(
    positions: Position[],
    totalAssets: number,
    accountCreatedDate: Date,
    _equityStats?: unknown // TODO: 타입 정의 필요
  ): MetricResults {
    const totalAssetsDecimal = new Decimal(totalAssets);
    
    // 1. 포지션 분류 (한 번의 순회)
    const classified = classifyPositions(positions, this.settings, totalAssetsDecimal);
    
    // 2. 데이터 집계
    const aggregates = aggregateData(
      positions,
      classified,
      totalAssetsDecimal,
      this.settings
    );
    
    // 3. 컨텍스트 생성
    const context: MetricContext = {
      positions,
      totalAssets: totalAssetsDecimal,
      accountCreatedDate,
      classified,
      aggregates,
      settings: this.settings
    };
    
    // 4. 메트릭 계산
    return this.registry.calculateAll(context);
  }
  
  /**
   * 특정 메트릭만 계산
   */
  calculateSpecific(
    metricIds: string[],
    positions: Position[],
    totalAssets: number,
    accountCreatedDate: Date
  ): MetricResults {
    const totalAssetsDecimal = new Decimal(totalAssets);
    
    // 필요한 데이터만 계산
    const classified = classifyPositions(positions, this.settings, totalAssetsDecimal);
    const aggregates = aggregateData(
      positions,
      classified,
      totalAssetsDecimal,
      this.settings
    );
    
    const context: MetricContext = {
      positions,
      totalAssets: totalAssetsDecimal,
      accountCreatedDate,
      classified,
      aggregates,
      settings: this.settings,
      cache: this.cache
    };
    
    return this.registry.calculate(metricIds, context);
  }
  
  /**
   * 설정 업데이트
   */
  updateSettings(settings: Partial<MetricSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }
  
  /**
   * 레지스트리 접근 (고급 사용)
   */
  getRegistry(): MetricRegistry {
    return this.registry;
  }
  
  /**
   * 디버그 정보
   */
  debug(): void {
    // Debug information available through registry
    this.registry.debug();
  }
}

/**
 * 싱글톤 인스턴스
 */
let instance: MetricsSystemV2 | null = null;

/**
 * 메트릭 시스템 인스턴스 가져오기
 */
export function getMetricsSystem(settings?: Partial<MetricSettings>): MetricsSystemV2 {
  if (!instance) {
    instance = new MetricsSystemV2(settings);
  } else if (settings) {
    instance.updateSettings(settings);
  }
  return instance;
}

/**
 * 간편 계산 함수
 */
export function calculateMetricsV2(
  positions: Position[],
  totalAssets: number,
  accountCreatedDate: Date = new Date(),
  settings?: Partial<MetricSettings>
): MetricResults {
  const system = getMetricsSystem(settings);
  return system.calculate(positions, totalAssets, accountCreatedDate);
}