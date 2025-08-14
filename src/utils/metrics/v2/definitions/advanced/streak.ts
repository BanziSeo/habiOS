import { Decimal } from 'decimal.js';
import type { MetricDefinition } from '../../core/types';

/**
 * Streak (연승/연패) 관련 메트릭
 */

// 1. Max Consecutive Wins (최대 연승)
export const maxConsecutiveWinsMetric: MetricDefinition<number> = {
  id: 'max-consecutive-wins',
  name: 'Max Win Streak',
  category: 'performance',
  priority: 85,
  
  calculate: (context) => {
    const sortedPositions = [...context.positions]
      .filter(p => p.status === 'CLOSED')
      .sort((a, b) => {
        const dateA = a.closeDate ? new Date(a.closeDate).getTime() : 0;
        const dateB = b.closeDate ? new Date(b.closeDate).getTime() : 0;
        return dateA - dateB;
      });
    
    if (sortedPositions.length === 0) return 0;
    
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (const position of sortedPositions) {
      const pnl = position.realizedPnl || new Decimal(0);
      if (pnl.gt(0)) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  },
  
  format: (value) => `${value}`,
  
  style: {
    color: () => '#52c41a',
    trend: 'higher-better'
  },
  
  description: '최대 연속 수익 거래 수'
};

// 2. Max Consecutive Losses (최대 연패)
export const maxConsecutiveLossesMetric: MetricDefinition<number> = {
  id: 'max-consecutive-losses',
  name: 'Max Loss Streak',
  category: 'risk',
  priority: 86,
  
  calculate: (context) => {
    const sortedPositions = [...context.positions]
      .filter(p => p.status === 'CLOSED')
      .sort((a, b) => {
        const dateA = a.closeDate ? new Date(a.closeDate).getTime() : 0;
        const dateB = b.closeDate ? new Date(b.closeDate).getTime() : 0;
        return dateA - dateB;
      });
    
    if (sortedPositions.length === 0) return 0;
    
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (const position of sortedPositions) {
      const pnl = position.realizedPnl || new Decimal(0);
      if (pnl.lt(0)) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  },
  
  format: (value) => `${value}`,
  
  style: {
    color: (value) => {
      if (value <= 3) return '#52c41a';
      if (value <= 5) return '#faad14';
      return '#ff4d4f';
    },
    trend: 'lower-better'
  },
  
  description: '최대 연속 손실 거래 수'
};