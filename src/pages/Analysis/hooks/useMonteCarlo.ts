import { useState, useCallback, useMemo } from 'react';
import { useTradingStore } from '../../../stores/tradingStore';
import type { Position } from '../../../types';
import type { 
  MonteCarloFilters, 
  MonteCarloResult, 
  MonteCarloSummary,
  MonteCarloSettings,
  HistoricalTrade 
} from '../../../types/monteCarlo';
import { runMonteCarloSimulation, analyzeResults } from '../utils/monteCarloCalculator';

export const useMonteCarlo = () => {
  const { positions, activeAccount } = useTradingStore();
  const [filters, setFilters] = useState<MonteCarloFilters>({
    minTrades: 30
  });
  const [results, setResults] = useState<MonteCarloResult[] | null>(null);
  const [summary, setSummary] = useState<MonteCarloSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState<MonteCarloSettings>({
    simulations: 10000,
    positionSizingMode: 'fixed',
    riskPerTrade: 1,
    initialCapital: 100
  });

  const getValidTrades = useCallback((): Position[] => {
    if (!activeAccount) return [];
    
    let trades = positions.filter(p => 
      p.status === 'CLOSED' &&
      p.initialR && 
      p.initialR.toNumber() !== 0 &&
      p.stopLosses && 
      p.stopLosses.length > 0 &&
      p.rMultiple !== undefined &&
      p.rMultiple !== null
    );
    
    if (filters.dateRange) {
      trades = trades.filter(t => {
        const firstBuyTrade = t.trades?.find(trade => trade.tradeType === 'BUY');
        if (!firstBuyTrade) return false;
        
        const tradeDate = new Date(firstBuyTrade.tradeDate);
        return tradeDate >= filters.dateRange!.start && 
               tradeDate <= filters.dateRange!.end;
      });
    }
    
    if (filters.setupTypes && filters.setupTypes.length > 0) {
      trades = trades.filter(t => 
        t.setupType && filters.setupTypes!.includes(t.setupType)
      );
    }
    
    if (filters.minRating) {
      trades = trades.filter(t => 
        t.rating && t.rating >= filters.minRating!
      );
    }
    
    if (filters.maxRating) {
      trades = trades.filter(t => 
        t.rating && t.rating <= filters.maxRating!
      );
    }
    
    return trades;
  }, [activeAccount, positions, filters]);

  const validTradesCount = useMemo(() => {
    return getValidTrades().length;
  }, [getValidTrades]);

  const canRun = useMemo(() => {
    const minTrades = filters.minTrades || 30;
    return validTradesCount >= minTrades;
  }, [validTradesCount, filters.minTrades]);

  const runSimulation = useCallback(async () => {
    const validTrades = getValidTrades();
    const minTrades = filters.minTrades || 30;
    
    if (validTrades.length < minTrades) {
      throw new Error(`최소 ${minTrades}개의 유효한 거래가 필요합니다. 현재: ${validTrades.length}개`);
    }
    
    setIsRunning(true);
    
    try {
      const rValues = validTrades.map(t => t.rMultiple || 0);
      
      let historicalTrades: HistoricalTrade[] | undefined;
      
      if (settings.positionSizingMode === 'historical') {
        // Prepare historical trades with actual risk amounts
        historicalTrades = validTrades.map(t => ({
          rMultiple: t.rMultiple || 0,
          initialRiskAmount: t.initialR?.toNumber() || 0
        }));
      }
      
      const simulationResults = runMonteCarloSimulation(
        rValues,
        settings.initialCapital,
        settings.simulations,
        settings.riskPerTrade,
        settings.positionSizingMode,
        historicalTrades
      );
      
      const analysisResult = analyzeResults(simulationResults, settings.initialCapital);
      
      setResults(simulationResults);
      setSummary(analysisResult);
    } finally {
      setIsRunning(false);
    }
  }, [getValidTrades, filters.minTrades, settings]);
  
  return {
    filters,
    setFilters,
    settings,
    setSettings,
    validTradesCount,
    runSimulation,
    results,
    summary,
    isRunning,
    canRun
  };
};