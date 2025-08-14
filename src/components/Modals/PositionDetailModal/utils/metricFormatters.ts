import dayjs from 'dayjs';
import type { Position } from '../../../../types';
import type { FormattersRecord } from '../types';
import type { PositionMetrics } from '../../../../stores/metricsStore';
import { formatCurrency } from '../../../../utils/formatters';

// 데이터 포맷터
export const formatters: FormattersRecord = {
  entryTime: (_, position) => {
    const firstTrade = position.trades && position.trades.length > 0
      ? position.trades.reduce((prev, curr) =>
        new Date(prev.tradeDate) < new Date(curr.tradeDate) ? prev : curr
      )
      : null;
    
    if (!firstTrade) return 'N/A';
    
    // brokerDate와 brokerTime이 있으면 실제 거래 시간 사용
    if (firstTrade.brokerDate && firstTrade.brokerTime) {
      const dateStr = firstTrade.brokerDate.replace(/\//g, '-'); // 2025/08/13 -> 2025-08-13
      const [hour, minute] = firstTrade.brokerTime.split(':').slice(0, 2); // HH:MM:SS -> HH:MM
      return `${dayjs(dateStr).format('MM/DD')} ${hour}:${minute}`;
    }
    
    // fallback to tradeDate
    return dayjs(firstTrade.tradeDate).format('MM/DD HH:mm');
  },
  
  exitTime: (_, position) => {
    if (position.status !== 'CLOSED') return 'N/A';
    const lastTrade = position.trades && position.trades.length > 0
      ? position.trades.reduce((prev, curr) =>
        new Date(prev.tradeDate) > new Date(curr.tradeDate) ? prev : curr
      )
      : null;
    
    if (!lastTrade) return 'N/A';
    
    // brokerDate와 brokerTime이 있으면 실제 거래 시간 사용
    if (lastTrade.brokerDate && lastTrade.brokerTime) {
      const dateStr = lastTrade.brokerDate.replace(/\//g, '-'); // 2025/08/13 -> 2025-08-13
      const [hour, minute] = lastTrade.brokerTime.split(':').slice(0, 2); // HH:MM:SS -> HH:MM
      return `${dayjs(dateStr).format('MM/DD')} ${hour}:${minute}`;
    }
    
    // fallback to tradeDate
    return dayjs(lastTrade.tradeDate).format('MM/DD HH:mm');
  },
  
  avgPrice: (_, position, _metrics, currency) => 
    formatCurrency(position.avgBuyPrice, currency as 'USD' | 'KRW' | undefined),
  
  currentShares: (_, position) => 
    `${position.totalShares} shares`,
  
  maxShares: (_, position) => 
    `${position.maxShares} shares`,
  
  initialR: (_, _position, metrics, currency) => 
    metrics.initialR ? formatCurrency(metrics.initialR, currency as 'USD' | 'KRW' | undefined) : 'N/A',
  
  aumInitialRisk: (_, _position, metrics) => 
    metrics.aumInitialRiskPercent ? `${metrics.aumInitialRiskPercent.toFixed(2)}%` : '0.00%',
  
  pureRisk: (_, _position, metrics) => 
    metrics.pureRisk ? `${metrics.pureRisk.toFixed(2)}%` : '0.00%',
  
  pureRiskDollar: (_, _position, metrics, currency) => 
    metrics.pureRiskDollar ? formatCurrency(Math.abs(metrics.pureRiskDollar), currency as 'USD' | 'KRW' | undefined) : formatCurrency(0, currency as 'USD' | 'KRW' | undefined),
  
  totalRisk: (_, _position, metrics) => 
    metrics.totalRisk ? `${metrics.totalRisk.toFixed(2)}%` : '0.00%',
  
  totalRiskDollar: (_, _position, metrics, currency) => 
    metrics.totalRiskDollar ? formatCurrency(Math.abs(metrics.totalRiskDollar), currency as 'USD' | 'KRW' | undefined) : formatCurrency(0, currency as 'USD' | 'KRW' | undefined),
  
  rMultiple: (_, _position, metrics) => 
    metrics.rMultiple ? metrics.rMultiple.toFixed(2) : '0.00',
  
  realizedPnl: (_, position, _metrics, currency) => 
    formatCurrency(position.realizedPnl, currency as 'USD' | 'KRW' | undefined),
  
  aumPnl: (_, _position, metrics) => 
    metrics.aumPnlPercent ? `${metrics.aumPnlPercent.toFixed(2)}%` : '0.00%',
  
  size: (_, _position, metrics) => 
    metrics.size ? `${metrics.size.toFixed(2)}%` : '0.00%',
  
  maxSize: (_, _position, metrics) => 
    metrics.maxSize ? `${metrics.maxSize.toFixed(2)}%` : '0.00%',
};

// Quick Stats 값 가져오기
export const getQuickStatValue = (
  key: string,
  position: Position,
  metrics: PositionMetrics,
  currency?: string
): string => {
  const formatter = formatters[key];
  return formatter ? formatter(null, position, metrics, currency) : 'N/A';
};