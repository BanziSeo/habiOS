import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import type { Position } from '../../../types';
import type { PeriodFilter } from '../../../components/Widgets/MetricsWidget';
import { useMetricsStore } from '../../../stores/metricsStore';
import { useSettingsStore } from '../../../stores/settingsStore';

/**
 * 포지션 필터링 및 메트릭 재계산
 */
export const usePositionFiltering = (
  positions: Position[],
  totalAssets: number,
  activeAccountId: string | undefined
) => {
  const [metricsPeriodFilter, setMetricsPeriodFilter] = useState<PeriodFilter>('all');
  const [metricsDateRange, setMetricsDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  
  const { portfolioMetrics, calculateAndCacheAllMetrics } = useMetricsStore();
  const { generalSettings } = useSettingsStore();
  
  // 기간별 포지션 필터링 및 메트릭 재계산
  useEffect(() => {
    if (!positions || positions.length === 0) {
      setFilteredPositions([]);
      return;
    }
    
    let filtered = [...positions];
    const now = dayjs();
    
    switch (metricsPeriodFilter) {
      case '2weeks':
        filtered = positions.filter(p => {
          const openDate = dayjs(p.openDate);
          return openDate.isAfter(now.subtract(2, 'week'));
        });
        break;
      case '1month':
        filtered = positions.filter(p => {
          const openDate = dayjs(p.openDate);
          return openDate.isAfter(now.subtract(1, 'month'));
        });
        break;
      case 'custom':
        if (metricsDateRange[0] && metricsDateRange[1]) {
          const startDate = dayjs(metricsDateRange[0]);
          const endDate = dayjs(metricsDateRange[1]);
          filtered = positions.filter(p => {
            const openDate = dayjs(p.openDate);
            return openDate.isAfter(startDate) && openDate.isBefore(endDate.add(1, 'day'));
          });
        }
        break;
      case 'all':
      default:
        // 전체 거래는 필터링 없음
        break;
    }
    
    setFilteredPositions(filtered);
    
    // 필터링된 포지션으로 메트릭 재계산
    // totalAssets가 유효한 경우에만 계산
    // 필터링 결과가 0개여도 메트릭 재계산 필요 (0으로 표시되어야 함)
    if (activeAccountId && totalAssets > 0) {
      const accountCreatedAt = new Date(); // Date 객체로 전달
      // async 호출이지만 await 없이 백그라운드에서 실행
      calculateAndCacheAllMetrics(
        filtered, 
        totalAssets, 
        accountCreatedAt, 
        generalSettings.winRateThreshold || 0.05
      ).catch(error => {
        console.error('Failed to calculate metrics:', error);
      });
    }
  }, [
    positions, 
    metricsPeriodFilter, 
    metricsDateRange, 
    activeAccountId, 
    totalAssets, 
    generalSettings.winRateThreshold, 
    calculateAndCacheAllMetrics
  ]);
  
  // 포트폴리오 메트릭 기본값
  const defaultPortfolioMetrics = useMemo(() => ({
    activePositions: 0,
    freerollPositions: 0,
    riskyPositions: 0,
    portfolioPureRisk: 0,
    portfolioTotalRisk: 0,
    portfolioPureRiskDollar: 0,  // 추가
    portfolioTotalRiskDollar: 0,  // 추가
    currentStockValue: 0,
    currentCashValue: totalAssets || 0,
    stockRatio: 0,
    cashRatio: 100,
    winRate: 0,
    avgWinR: 0,
    avgLossR: 0,
    avgPositionsPerDay: 0,
    totalTrades: 0,
    totalPositions: 0,
    totalWins: 0,
    totalLosses: 0,
    totalBreakeven: 0,
    breakevenThreshold: generalSettings.winRateThreshold || 0,
    avgHoldingTime: 0,  // 추가
    avgWinnerHoldingTime: 0,  // 추가
    avgLoserHoldingTime: 0,  // 추가
    expectancy: 0,  // 추가
    expectancyR: 0,  // 추가
    payoffRatio: 0,  // 추가
    avgRiskPerTrade: 0,  // 추가
    avgSizePerTrade: 0,  // 추가
    stdDevReturns: 0,  // 추가
    downsideDeviation: 0,  // 추가
    sharpeRatio: 0,  // 추가
    maxConsecutiveWins: 0,  // 추가
    maxConsecutiveLosses: 0,  // 추가
    raroc: 0  // 추가
  }), [totalAssets, generalSettings.winRateThreshold]);
  
  const currentPortfolioMetrics = portfolioMetrics || defaultPortfolioMetrics;
  
  const handlePeriodChange = (periodFilter: PeriodFilter, dateRange?: [Date | null, Date | null]) => {
    setMetricsPeriodFilter(periodFilter);
    setMetricsDateRange(dateRange || [null, null]);
  };
  
  return {
    filteredPositions,
    currentPortfolioMetrics,
    handlePeriodChange,
    metricsPeriodFilter,
    metricsDateRange
  };
};