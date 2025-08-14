import React from 'react';
import { theme } from 'antd';
import type { Position } from '../../../../types';
import type { PositionMetrics } from '../../../../stores/metricsStore';
import { QUICK_STAT_LABELS } from '../constants';
import { getQuickStatValue } from '../utils/metricFormatters';

interface QuickStatsProps {
  quickStats: string[];
  position: Position;
  metrics: PositionMetrics;
  currency?: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  quickStats,
  position,
  metrics,
  currency
}) => {
  const { token } = theme.useToken();

  // QuickStats 전용 스타일
  const quickStatsStyle = {
    display: 'flex',
    background: token.colorFillQuaternary,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
  };

  const quickStatStyle = {
    flex: 1,
    padding: '16px',
    textAlign: 'center' as const,
    borderRight: `1px solid ${token.colorBorderSecondary}`,
  };

  const quickStatLabelStyle = {
    fontSize: 12,
    color: token.colorTextSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: 6,
    fontWeight: 500,
  };

  const getQuickStatValueStyle = (key: string) => {
    const baseStyle = {
      fontSize: 20,
      fontWeight: 700,
      color: token.colorText,
    };

    const value = getQuickStatValue(key, position, metrics, currency);
    
    // 값에 따른 색상 결정
    if (key.includes('pnl') || key.includes('profit')) {
      const numValue = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
      if (numValue > 0) return { ...baseStyle, color: token.colorSuccess };
      if (numValue < 0) return { ...baseStyle, color: token.colorError };
    }
    
    if (key.includes('risk') || key.includes('loss')) {
      return { ...baseStyle, color: token.colorError };
    }
    
    return baseStyle;
  };

  return (
    <div style={quickStatsStyle}>
      {quickStats.map((key, index) => {
        const value = getQuickStatValue(key, position, metrics, currency);
        const isLast = index === quickStats.length - 1;

        return (
          <div 
            key={key} 
            style={{
              ...quickStatStyle,
              ...(isLast ? { borderRight: 'none' } : {})
            }}
          >
            <div style={quickStatLabelStyle}>
              {QUICK_STAT_LABELS[key] || key}
            </div>
            <div style={getQuickStatValueStyle(key)}>{value}</div>
          </div>
        );
      })}
    </div>
  );
};