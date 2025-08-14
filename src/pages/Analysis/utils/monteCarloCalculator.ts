import type { MonteCarloResult, MonteCarloSummary, HistoricalTrade } from '../../../types/monteCarlo';

const fisherYatesShuffle = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const runMonteCarloSimulation = (
  trades: number[],
  initialCapital: number = 100,
  simulations: number = 10000,
  riskPerTrade: number = 1,
  mode: 'historical' | 'fixed' = 'fixed',
  historicalTrades?: HistoricalTrade[]
): MonteCarloResult[] => {
  const results: MonteCarloResult[] = [];
  
  for (let i = 0; i < simulations; i++) {
    let shuffledRValues: number[];
    let shuffledHistorical: HistoricalTrade[] | undefined;
    
    if (mode === 'historical' && historicalTrades) {
      // Historical mode: shuffle the actual trades
      shuffledHistorical = fisherYatesShuffle([...historicalTrades]);
      shuffledRValues = shuffledHistorical.map(t => t.rMultiple);
    } else {
      // Fixed mode: shuffle R values only
      shuffledRValues = fisherYatesShuffle([...trades]);
    }
    
    let equity = initialCapital;
    let peak = initialCapital;
    let maxDD = 0;
    let consecutiveLosses = 0;
    let consecutiveWins = 0;
    let maxConsLosses = 0;
    let maxConsWins = 0;
    const path: number[] = [initialCapital];
    
    for (let j = 0; j < shuffledRValues.length; j++) {
      const rValue = shuffledRValues[j];
      let pnl: number;
      
      if (mode === 'historical' && shuffledHistorical) {
        // Use actual historical risk amounts
        pnl = shuffledHistorical[j].initialRiskAmount * rValue;
      } else {
        // Use fixed percentage of current equity
        const positionSize = equity * (riskPerTrade / 100);
        pnl = positionSize * rValue;
      }
      
      equity += pnl;
      
      if (equity <= 0) {
        equity = 0;
        path.push(0);
        break;
      }
      
      peak = Math.max(peak, equity);
      const currentDD = (peak - equity) / peak * 100;
      maxDD = Math.max(maxDD, currentDD);
      
      if (rValue > 0) {
        consecutiveWins++;
        consecutiveLosses = 0;
        maxConsWins = Math.max(maxConsWins, consecutiveWins);
      } else {
        consecutiveLosses++;
        consecutiveWins = 0;
        maxConsLosses = Math.max(maxConsLosses, consecutiveLosses);
      }
      
      path.push(equity);
    }
    
    results.push({
      finalEquity: equity,
      maxDrawdown: maxDD,
      maxConsecutiveLosses: maxConsLosses,
      maxConsecutiveWins: maxConsWins,
      path
    });
  }
  
  return results;
};

const percentile = (sorted: number[], p: number): number => {
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
};

export const analyzeResults = (
  results: MonteCarloResult[],
  initialCapital: number
): MonteCarloSummary => {
  const bankruptcies = results.filter(r => r.finalEquity <= 0).length;
  const bankruptcyProbability = (bankruptcies / results.length) * 100;
  
  const returns = results
    .map(r => ((r.finalEquity - initialCapital) / initialCapital) * 100)
    .sort((a, b) => a - b);
  
  const drawdowns = results
    .map(r => r.maxDrawdown)
    .sort((a, b) => a - b);
  
  const consLosses = results
    .map(r => r.maxConsecutiveLosses)
    .sort((a, b) => a - b);
  
  const consWins = results
    .map(r => r.maxConsecutiveWins)
    .sort((a, b) => a - b);
  
  return {
    bankruptcyProbability,
    medianReturn: percentile(returns, 50),
    percentile5: percentile(returns, 5),
    percentile95: percentile(returns, 95),
    maxDrawdown: {
      median: percentile(drawdowns, 50),
      worst: drawdowns[drawdowns.length - 1],
      percentile95: percentile(drawdowns, 95)
    },
    consecutiveLosses: {
      median: percentile(consLosses, 50),
      worst: consLosses[consLosses.length - 1],
      percentile95: percentile(consLosses, 95)
    },
    consecutiveWins: {
      median: percentile(consWins, 50),
      best: consWins[consWins.length - 1],
      percentile95: percentile(consWins, 95)
    }
  };
};