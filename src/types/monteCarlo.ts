export interface MonteCarloFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  setupTypes?: string[];
  minRating?: number;
  maxRating?: number;
  minTrades?: number;
}

export interface MonteCarloResult {
  finalEquity: number;
  maxDrawdown: number;
  maxConsecutiveLosses: number;
  maxConsecutiveWins: number;
  path: number[];
}

export interface MonteCarloSummary {
  bankruptcyProbability: number;
  medianReturn: number;
  percentile5: number;
  percentile95: number;
  maxDrawdown: {
    median: number;
    worst: number;
    percentile95: number;
  };
  consecutiveLosses: {
    median: number;
    worst: number;
    percentile95: number;
  };
  consecutiveWins: {
    median: number;
    best: number;
    percentile95: number;
  };
}

export interface MonteCarloSettings {
  simulations: number;
  positionSizingMode: 'historical' | 'fixed';
  riskPerTrade: number;
  initialCapital: number;
}

export interface HistoricalTrade {
  rMultiple: number;
  initialRiskAmount: number;
}