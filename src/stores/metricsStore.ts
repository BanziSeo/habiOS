import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Decimal } from 'decimal.js';
import type { Position } from '../types';
import { useSettingsStore } from './settingsStore';
import { getMetricsFacade, type PortfolioMetrics } from '../utils/metrics/facade';

export interface PositionMetrics {
  size?: number;
  maxSize?: number;
  initialR?: Decimal;
  rMultiple?: number;
  pureRisk?: number;
  totalRisk?: number;
  pureRiskDollar?: number;
  totalRiskDollar?: number;
  aumPnlPercent?: number;
  aumInitialRiskPercent?: number;
}

let TOTAL_ASSETS = new Decimal(100000);

function setTotalAssets(totalAssets: Decimal) {
  TOTAL_ASSETS = totalAssets;
}

function calculatePositionMetrics(
  position: Position,
  buyCommissionRate: number = 0.0007,
  sellCommissionRate: number = 0.0007
): PositionMetrics {
  const metrics: PositionMetrics = {};

  if (!position.avgBuyPrice || !(position.avgBuyPrice instanceof Decimal)) {
    return metrics;
  }

  if (position.totalShares > 0) {
    const positionValue = position.avgBuyPrice.times(position.totalShares);
    metrics.size = positionValue.div(TOTAL_ASSETS).times(100).toNumber();
  }

  if (position.maxShares > 0) {
    const maxValue = position.avgBuyPrice.times(position.maxShares);
    metrics.maxSize = maxValue.div(TOTAL_ASSETS).times(100).toNumber();
  }

  if (position.maxRiskAmount && position.maxRiskAmount.greaterThan(0)) {
    metrics.initialR = position.maxRiskAmount;
  } else if (position.stopLosses && position.stopLosses.length > 0) {
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
    if (hasActiveStopLoss && totalRiskAmount.greaterThan(0)) {
      metrics.initialR = totalRiskAmount;
    }
  }

  if (position.status === 'ACTIVE' && position.stopLosses && position.stopLosses.length > 0) {
    let currentRiskAmount = new Decimal(0);
    let hasActiveStopLoss = false;
    
    position.stopLosses.forEach(sl => {
      if (sl.isActive) {
        hasActiveStopLoss = true;
        const stopLoss = position.avgBuyPrice.minus(sl.stopPrice).times(sl.stopQuantity);
        const totalCommissionRate = buyCommissionRate + sellCommissionRate;
        const commission = position.avgBuyPrice.times(sl.stopQuantity).times(totalCommissionRate);
        currentRiskAmount = currentRiskAmount.plus(stopLoss).plus(commission);
      }
    });
    if (hasActiveStopLoss && currentRiskAmount.greaterThan(0)) {
      if (!position.maxRiskAmount) {
        const existingInitialR = metrics.initialR || new Decimal(0);
        if (currentRiskAmount.greaterThan(existingInitialR)) {
          metrics.initialR = currentRiskAmount;
        }
      }
    }
  }

  if (metrics.initialR && metrics.initialR.greaterThan(0) && position.realizedPnl) {
    let totalProfit = position.realizedPnl;
    if (position.status === 'ACTIVE' && position.stopLosses && position.stopLosses.length > 0 && position.totalShares > 0) {
      let securedProfit = new Decimal(0);
      
      position.stopLosses.forEach(sl => {
        if (sl.isActive && sl.stopPrice.greaterThan(position.avgBuyPrice)) {
          const profitPerShare = sl.stopPrice.minus(position.avgBuyPrice);
          const securedAmount = profitPerShare.times(sl.stopQuantity);
          securedProfit = securedProfit.plus(securedAmount);
        }
      });
      totalProfit = totalProfit.plus(securedProfit);
    }
    
    metrics.rMultiple = totalProfit.div(metrics.initialR).toNumber();
  }

  if (position.stopLosses && position.stopLosses.length > 0 && position.status === 'ACTIVE') {
    let totalStopLoss = new Decimal(0);
    position.stopLosses.forEach(sl => {
      if (sl.isActive) {
        const loss = position.avgBuyPrice.minus(sl.stopPrice).times(sl.stopQuantity);
        const totalCommissionRate = buyCommissionRate + sellCommissionRate;
        const commission = position.avgBuyPrice.times(sl.stopQuantity).times(totalCommissionRate);
        totalStopLoss = totalStopLoss.plus(loss).plus(commission);
      }
    });
    metrics.pureRiskDollar = totalStopLoss.toNumber();
    metrics.pureRisk = totalStopLoss.div(TOTAL_ASSETS).times(100).toNumber();
  }

  if (metrics.pureRisk !== undefined) {
    const realizedPnlPercent = position.realizedPnl.div(TOTAL_ASSETS).times(100).toNumber();
    metrics.totalRisk = metrics.pureRisk - realizedPnlPercent;
    if (metrics.pureRiskDollar !== undefined) {
      metrics.totalRiskDollar = metrics.pureRiskDollar - position.realizedPnl.toNumber();
    }
  }

  if (position.realizedPnl) {
    metrics.aumPnlPercent = position.realizedPnl.div(TOTAL_ASSETS).times(100).toNumber();
  }

  if (metrics.initialR) {
    metrics.aumInitialRiskPercent = metrics.initialR.div(TOTAL_ASSETS).times(100).toNumber();
  }

  return metrics;
}

interface MetricsState {
  positionMetricsCache: Map<string, PositionMetrics>;
  
  portfolioMetrics: PortfolioMetrics | null;
  
  lastUpdated: number;
  
  totalAssets: number;
  
  updateTotalAssets: (totalAssets: number) => void;
  calculateAndCachePositionMetrics: (position: Position) => PositionMetrics;
  calculateAndCacheAllMetrics: (
    positions: Position[],
    totalAssets: number,
    accountCreatedDate: Date,
    winRateThreshold?: number
  ) => Promise<PortfolioMetrics>;
  getPositionMetrics: (positionId: string) => PositionMetrics | undefined;
  clearCache: () => void;
  calculateStopLossRisk: (avgBuyPrice: Decimal, stopPrice: number, quantity: number) => { amount: number; percent: number };
  calculateTotalRisk: (avgBuyPrice: Decimal, stopLosses: Array<{ price: number; quantity: number }>) => { amount: number; percent: number };
}

export const useMetricsStore = create<MetricsState>()(
  devtools(
    (set, get) => ({
      positionMetricsCache: new Map(),
      portfolioMetrics: null,
      lastUpdated: 0,
      totalAssets: 0,
      
      updateTotalAssets: (totalAssets) => {
        setTotalAssets(new Decimal(totalAssets));
        set({ totalAssets });
      },
      
      calculateAndCachePositionMetrics: (position) => {
        const { generalSettings } = useSettingsStore.getState();
        const metrics = calculatePositionMetrics(
          position,
          generalSettings.buyCommissionRate || 0.0007,
          generalSettings.sellCommissionRate || 0.0007
        );
        
        set(state => {
          const newCache = new Map(state.positionMetricsCache);
          newCache.set(position.id, metrics);
          return { 
            positionMetricsCache: newCache,
            lastUpdated: Date.now()
          };
        });
        
        return metrics;
      },
      
      calculateAndCacheAllMetrics: async (positions, totalAssets, accountCreatedDate, winRateThreshold) => {
        setTotalAssets(new Decimal(totalAssets));
        
        const { generalSettings } = useSettingsStore.getState();
        const buyCommissionRate = generalSettings.buyCommissionRate || 0.0007;
        const sellCommissionRate = generalSettings.sellCommissionRate || 0.0007;
        
        const facade = getMetricsFacade();
        const { results: portfolioMetrics } = await facade.calculate(
          positions,
          totalAssets,
          0, // cashValue
          accountCreatedDate,
          winRateThreshold,
          buyCommissionRate,
          sellCommissionRate
        );
        
        const newCache = new Map<string, PositionMetrics>();
        positions.forEach(position => {
          const metrics = calculatePositionMetrics(position, buyCommissionRate, sellCommissionRate);
          newCache.set(position.id, metrics);
        });
        
        set({
          portfolioMetrics,
          positionMetricsCache: newCache,
          lastUpdated: Date.now(),
          totalAssets
        });
        
        return portfolioMetrics;
      },
      
      getPositionMetrics: (positionId) => {
        return get().positionMetricsCache.get(positionId);
      },
      
      clearCache: () => {
        set({
          positionMetricsCache: new Map(),
          portfolioMetrics: null,
          lastUpdated: 0
        });
      },
      
      calculateStopLossRisk: (avgBuyPrice, stopPrice, quantity) => {
        const totalAssets = get().totalAssets || 100000;
        const { generalSettings } = useSettingsStore.getState();
        const buyCommissionRate = generalSettings.buyCommissionRate || 0.0007;
        const sellCommissionRate = generalSettings.sellCommissionRate || 0.0007;
        
        const loss = avgBuyPrice.minus(stopPrice).times(quantity);
        const totalCommissionRate = buyCommissionRate + sellCommissionRate;
        const commission = avgBuyPrice.times(quantity).times(totalCommissionRate);
        const totalLoss = loss.plus(commission);
        
        return {
          amount: totalLoss.toNumber(),
          percent: totalLoss.div(totalAssets).times(100).toNumber()
        };
      },
      
      calculateTotalRisk: (avgBuyPrice, stopLosses) => {
        const totalAssets = get().totalAssets || 100000;
        const { generalSettings } = useSettingsStore.getState();
        const buyCommissionRate = generalSettings.buyCommissionRate || 0.0007;
        const sellCommissionRate = generalSettings.sellCommissionRate || 0.0007;
        
        let totalRisk = new Decimal(0);
        
        stopLosses.forEach(sl => {
          const loss = avgBuyPrice.minus(sl.price).times(sl.quantity);
          const totalCommissionRate = buyCommissionRate + sellCommissionRate;
          const commission = avgBuyPrice.times(sl.quantity).times(totalCommissionRate);
          totalRisk = totalRisk.plus(loss).plus(commission);
        });
        
        return {
          amount: totalRisk.toNumber(),
          percent: totalRisk.div(totalAssets).times(100).toNumber()
        };
      }
    }),
    {
      name: 'metrics-storage'
    }
  )
);