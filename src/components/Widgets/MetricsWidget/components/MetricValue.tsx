import React from 'react';
import { Statistic, theme } from 'antd';
import type { MetricsSettings } from '../types';
import type { EquityStats } from '../../../../pages/Journal/types';
import type { PortfolioMetrics } from '../../../../utils/metrics/facade';
import type { Account } from '../../../../types';

interface MetricValueProps {
  cardId: string;
  equityStats: EquityStats | undefined;
  portfolioMetrics: PortfolioMetrics | null;
  activeAccount: Account | null;
  settings: MetricsSettings;
}

export const MetricValue: React.FC<MetricValueProps> = ({
  cardId,
  equityStats,
  portfolioMetrics,
  activeAccount,
  settings,
}) => {
  const { valueFontSize, valueBold, subValueFontSize, subValueBold } = settings;
  const { token } = theme.useToken();

  switch (cardId) {
    case 'current-value':
      return (
        <div>
          <Statistic
            value={equityStats?.currentValue || 0}
            precision={activeAccount?.currency === 'KRW' ? 0 : 2}
            prefix={activeAccount?.currency === 'KRW' ? '₩' : '$'}
            valueStyle={{ fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'total-return':
      return (
        <div>
          <Statistic
            value={equityStats?.totalReturnPercent || 0}
            precision={2}
            suffix="%"
            valueStyle={{ 
              color: (equityStats?.totalReturn || 0) >= 0 ? token.colorSuccess : token.colorError,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'max-drawdown':
      return (
        <div>
          <Statistic
            value={equityStats?.maxDrawdownPercent || 0}
            precision={2}
            suffix="%"
            valueStyle={{ color: token.colorError, fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'win-rate':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.winRate || 0}
            suffix="%"
            precision={1}
            valueStyle={{ 
              color: (portfolioMetrics?.winRate || 0) >= 50 ? token.colorSuccess : token.colorError,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div className="metric-secondary-info" style={{ 
            fontSize: subValueFontSize,
            color: token.colorTextTertiary, 
            fontWeight: subValueBold ? 'bold' : 'normal' 
          }}>
            {portfolioMetrics?.totalWins || 0}W / {portfolioMetrics?.totalLosses || 0}L
          </div>
        </div>
      );
    
    case 'trading-days':
      return (
        <div>
          <Statistic
            value={equityStats?.tradingDays || 0}
            valueStyle={{ fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'stock-cash':
      return (
        <div>
          <Statistic
            value={portfolioMetrics ? `${portfolioMetrics.stockRatio.toFixed(1)}% / ${portfolioMetrics.cashRatio.toFixed(1)}%` : '- / -'}
            valueStyle={{ fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'open-positions':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.activePositions || 0}
            valueStyle={{ fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ 
            fontSize: subValueFontSize, 
            color: token.colorTextTertiary, 
            marginTop: 2, 
            fontWeight: subValueBold ? 'bold' : 'normal' 
          }}>
            {portfolioMetrics?.freerollPositions || 0}F / {portfolioMetrics?.riskyPositions || 0}R
          </div>
        </div>
      );
    
    case 'portfolio-open-risk':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.portfolioPureRisk || 0}
            suffix="%"
            precision={2}
            valueStyle={{ 
              color: (portfolioMetrics?.portfolioPureRisk || 0) > 0 ? token.colorError : token.colorSuccess,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'portfolio-net-risk':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.portfolioTotalRisk || 0}
            suffix="%"
            precision={2}
            valueStyle={{ 
              color: (portfolioMetrics?.portfolioTotalRisk || 0) > 0 ? token.colorError : token.colorSuccess,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'portfolio-open-risk-dollar':
      return (
        <div>
          <Statistic
            value={Math.abs(portfolioMetrics?.portfolioPureRiskDollar || 0)}
            prefix={activeAccount?.currency === 'KRW' ? '₩' : '$'}
            precision={activeAccount?.currency === 'KRW' ? 0 : 2}
            valueStyle={{ 
              color: (portfolioMetrics?.portfolioPureRiskDollar || 0) > 0 ? token.colorError : token.colorSuccess,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'portfolio-net-risk-dollar':
      return (
        <div>
          <Statistic
            value={Math.abs(portfolioMetrics?.portfolioTotalRiskDollar || 0)}
            prefix={activeAccount?.currency === 'KRW' ? '₩' : '$'}
            precision={activeAccount?.currency === 'KRW' ? 0 : 2}
            valueStyle={{ 
              color: (portfolioMetrics?.portfolioTotalRiskDollar || 0) > 0 ? token.colorError : token.colorSuccess,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'avg-win-r':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.avgWinR || 0}
            suffix="R"
            precision={2}
            valueStyle={{ color: token.colorSuccess, fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'avg-loss-r':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.avgLossR || 0}
            suffix="R"
            precision={2}
            valueStyle={{ color: token.colorError, fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'avg-positions-day':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.avgPositionsPerDay ? portfolioMetrics.avgPositionsPerDay.toFixed(2) : '-'}
            valueStyle={{ fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'avg-holding-time':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.avgHoldingTime ? portfolioMetrics.avgHoldingTime.toFixed(1) : '-'}
            suffix="days"
            valueStyle={{ fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'avg-winner-holding-time':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.avgWinnerHoldingTime ? portfolioMetrics.avgWinnerHoldingTime.toFixed(1) : '-'}
            suffix="days"
            valueStyle={{ fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'avg-loser-holding-time':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.avgLoserHoldingTime ? portfolioMetrics.avgLoserHoldingTime.toFixed(1) : '-'}
            suffix="days"
            valueStyle={{ fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    // Advanced Metrics (Phase 2)
    case 'expectancy':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.expectancy || 0}
            suffix="%"
            precision={3}
            valueStyle={{ 
              color: (portfolioMetrics?.expectancy || 0) > 0 ? token.colorSuccess : token.colorError,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'expectancy-r':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.expectancyR || 0}
            suffix="R"
            precision={3}
            valueStyle={{ 
              color: (portfolioMetrics?.expectancyR || 0) > 0 ? token.colorSuccess : token.colorError,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'payoff-ratio':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.payoffRatio || 0}
            precision={2}
            valueStyle={{ 
              color: (portfolioMetrics?.payoffRatio || 0) > 1 ? token.colorSuccess : token.colorError,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'avg-risk-per-trade':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.avgRiskPerTrade || 0}
            suffix="%"
            precision={2}
            valueStyle={{ 
              color: (portfolioMetrics?.avgRiskPerTrade || 0) > 2 ? token.colorWarning : token.colorSuccess,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'avg-size-per-trade':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.avgSizePerTrade || 0}
            suffix="%"
            precision={2}
            valueStyle={{ fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'std-dev-returns':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.stdDevReturns || 0}
            suffix="%"
            precision={2}
            valueStyle={{ fontSize: `${valueFontSize}px`, fontWeight: valueBold ? 'bold' : 'normal' }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'downside-deviation':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.downsideDeviation || 0}
            suffix="%"
            precision={2}
            valueStyle={{ 
              color: token.colorError,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'sharpe-ratio':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.sharpeRatio || 0}
            precision={3}
            valueStyle={{ 
              color: (portfolioMetrics?.sharpeRatio || 0) > 0 ? token.colorSuccess : token.colorError,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'max-consecutive-wins':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.maxConsecutiveWins || 0}
            valueStyle={{ 
              color: token.colorSuccess,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'max-consecutive-losses':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.maxConsecutiveLosses || 0}
            valueStyle={{ 
              color: token.colorError,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    case 'raroc':
      return (
        <div>
          <Statistic
            value={portfolioMetrics?.raroc || 0}
            precision={2}
            valueStyle={{ 
              color: (portfolioMetrics?.raroc || 0) > 0 ? token.colorSuccess : token.colorError,
              fontSize: `${valueFontSize}px`,
              fontWeight: valueBold ? 'bold' : 'normal'
            }}
          />
          <div style={{ height: subValueFontSize + 4, marginTop: 2 }} />
        </div>
      );
    
    default:
      return <span>-</span>;
  }
};