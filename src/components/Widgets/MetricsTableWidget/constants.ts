import type { PortfolioMetrics } from '../../../utils/metrics/facade';
import type { EquityStats } from '../../../pages/Journal/types';
import type { Account } from '../../../types';
import type { GlobalToken } from 'antd';

export interface MetricConfig {
  id: string;
  category: string;
  name: string;
  value: string | number;
  rawValue?: number;
  description?: string;
  color?: string;
}

export const getAvailableMetrics = (
  portfolioMetrics: PortfolioMetrics | null,
  equityStats: EquityStats | undefined,
  activeAccount: Account | null,
  token: GlobalToken
): MetricConfig[] => {
  const metrics: MetricConfig[] = [];

  // 수익성 지표
  if (portfolioMetrics) {
    metrics.push({
      id: 'win-rate',
      category: 'profitability',
      name: 'Win Rate',
      value: `${(portfolioMetrics.winRate || 0).toFixed(1)}%`,
      rawValue: portfolioMetrics.winRate || 0,
      description: `${portfolioMetrics.totalWins || 0}W / ${portfolioMetrics.totalLosses || 0}L`,
      color: (portfolioMetrics.winRate || 0) >= 50 ? token.colorSuccess : token.colorError
    });

    metrics.push({
      id: 'avg-win-r',
      category: 'profitability',
      name: 'Avg Win R',
      value: `${(portfolioMetrics.avgWinR || 0).toFixed(2)}R`,
      rawValue: portfolioMetrics.avgWinR || 0,
      color: (portfolioMetrics.avgWinR || 0) > 0 ? token.colorSuccess : undefined
    });

    metrics.push({
      id: 'avg-loss-r',
      category: 'profitability',
      name: 'Avg Loss R',
      value: `${(portfolioMetrics.avgLossR || 0).toFixed(2)}R`,
      rawValue: portfolioMetrics.avgLossR || 0,
      color: token.colorError
    });

    metrics.push({
      id: 'expectancy',
      category: 'profitability',
      name: 'Expectancy',
      value: `${(portfolioMetrics.expectancy || 0).toFixed(2)}`,
      rawValue: portfolioMetrics.expectancy || 0,
      color: (portfolioMetrics.expectancy || 0) > 0 ? token.colorSuccess : token.colorError
    });

    metrics.push({
      id: 'expectancy-r',
      category: 'profitability',
      name: 'Expectancy R',
      value: `${(portfolioMetrics.expectancyR || 0).toFixed(2)}R`,
      rawValue: portfolioMetrics.expectancyR || 0,
      color: (portfolioMetrics.expectancyR || 0) > 0 ? token.colorSuccess : token.colorError
    });

    metrics.push({
      id: 'payoff-ratio',
      category: 'profitability',
      name: 'Payoff Ratio',
      value: `${(portfolioMetrics.payoffRatio || 0).toFixed(2)}`,
      rawValue: portfolioMetrics.payoffRatio || 0,
      color: (portfolioMetrics.payoffRatio || 0) > 1 ? token.colorSuccess : token.colorWarning
    });

  }

  // 리스크 지표
  if (equityStats) {
    metrics.push({
      id: 'max-drawdown',
      category: 'risk',
      name: 'Max Drawdown',
      value: `${(equityStats.maxDrawdownPercent || 0).toFixed(2)}%`,
      rawValue: equityStats.maxDrawdownPercent || 0,
      description: `${activeAccount?.currency === 'KRW' ? '₩' : '$'}${(equityStats.maxDrawdown || 0).toFixed(2)}`,
      color: token.colorError
    });

  }

  if (portfolioMetrics) {
    metrics.push({
      id: 'open-risk',
      category: 'risk',
      name: 'Open Risk',
      value: `${(portfolioMetrics.portfolioPureRisk || 0).toFixed(2)}%`,
      rawValue: portfolioMetrics.portfolioPureRisk || 0,
      color: (portfolioMetrics.portfolioPureRisk || 0) > 5 ? token.colorError : token.colorWarning
    });

    metrics.push({
      id: 'net-risk',
      category: 'risk',
      name: 'Net Risk',
      value: `${(portfolioMetrics.portfolioTotalRisk || 0).toFixed(2)}%`,
      rawValue: portfolioMetrics.portfolioTotalRisk || 0,
      color: (portfolioMetrics.portfolioTotalRisk || 0) > 3 ? token.colorError : token.colorWarning
    });

    metrics.push({
      id: 'max-consecutive-losses',
      category: 'risk',
      name: 'Max Consecutive Losses',
      value: portfolioMetrics.maxConsecutiveLosses || 0,
      rawValue: portfolioMetrics.maxConsecutiveLosses || 0,
      color: (portfolioMetrics.maxConsecutiveLosses || 0) > 5 ? token.colorError : token.colorWarning
    });
  }

  // 포지션 정보
  if (portfolioMetrics) {
    metrics.push({
      id: 'open-positions',
      category: 'position',
      name: 'Open Positions',
      value: (portfolioMetrics.activePositions || 0).toString(),
      rawValue: portfolioMetrics.activePositions || 0
    });

    metrics.push({
      id: 'total-trades',
      category: 'position',
      name: 'Total Trades',
      value: (portfolioMetrics.totalTrades || 0).toString(),
      rawValue: portfolioMetrics.totalTrades || 0
    });

    metrics.push({
      id: 'stock-ratio',
      category: 'position',
      name: 'Stock Ratio',
      value: `${(portfolioMetrics.stockRatio || 0).toFixed(1)}%`,
      rawValue: portfolioMetrics.stockRatio || 0
    });

    metrics.push({
      id: 'cash-ratio',
      category: 'position',
      name: 'Cash Ratio',
      value: `${(portfolioMetrics.cashRatio || 0).toFixed(1)}%`,
      rawValue: portfolioMetrics.cashRatio || 0
    });
  }

  // 시간 지표
  if (portfolioMetrics) {
    metrics.push({
      id: 'avg-holding-time',
      category: 'time',
      name: 'Avg Holding Time',
      value: `${(portfolioMetrics.avgHoldingTime || 0).toFixed(1)}일`,
      rawValue: portfolioMetrics.avgHoldingTime || 0
    });

    metrics.push({
      id: 'avg-winner-time',
      category: 'time',
      name: 'Avg Winner Time',
      value: `${(portfolioMetrics.avgWinnerHoldingTime || 0).toFixed(1)}일`,
      rawValue: portfolioMetrics.avgWinnerHoldingTime || 0,
      color: token.colorSuccess
    });

    metrics.push({
      id: 'avg-loser-time',
      category: 'time',
      name: 'Avg Loser Time',
      value: `${(portfolioMetrics.avgLoserHoldingTime || 0).toFixed(1)}일`,
      rawValue: portfolioMetrics.avgLoserHoldingTime || 0,
      color: token.colorError
    });
  }

  // 자산 정보
  if (equityStats) {
    metrics.push({
      id: 'total-return',
      category: 'asset',
      name: 'Total Return',
      value: `${(equityStats.totalReturnPercent || 0).toFixed(2)}%`,
      rawValue: equityStats.totalReturnPercent || 0,
      description: `${activeAccount?.currency === 'KRW' ? '₩' : '$'}${(equityStats.totalReturn || 0).toFixed(2)}`,
      color: (equityStats.totalReturn || 0) >= 0 ? token.colorSuccess : token.colorError
    });

    metrics.push({
      id: 'current-value',
      category: 'asset',
      name: 'Current Value',
      value: `${activeAccount?.currency === 'KRW' ? '₩' : '$'}${(equityStats.currentValue || 0).toFixed(2)}`,
      rawValue: equityStats.currentValue || 0
    });

    metrics.push({
      id: 'initial-capital',
      category: 'asset',
      name: 'Initial Capital',
      value: `${activeAccount?.currency === 'KRW' ? '₩' : '$'}${(equityStats.initialValue || 0).toFixed(2)}`,
      rawValue: equityStats.initialValue || 0
    });
  }

  return metrics;
};

// 기본 표시 메트릭 ID 목록
export const DEFAULT_VISIBLE_METRICS = [
  'win-rate',
  'expectancy-r',
  'payoff-ratio',
  'max-drawdown',
  'open-risk',
  'open-positions',
  'avg-holding-time',
  'total-return',
  'current-value'
];