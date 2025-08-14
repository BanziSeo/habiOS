import type { Position } from '../../../../../types';
import type { ClassifiedPositions } from '../../core/types';
import { calculateHeroicHoldingDays, extractHeroicTimeFromTrades } from '../../../../heroicTimeConverter';

/**
 * 보유 기간 계산 - 영웅문 로직 적용
 */
export function calculateHoldingTimes(classified: ClassifiedPositions): {
  avgHoldingTime: number;
  avgWinnerHoldingTime: number;
  avgLoserHoldingTime: number;
} {
  let avgHoldingTime = 0;
  let avgWinnerHoldingTime = 0;
  let avgLoserHoldingTime = 0;
  
  // 모든 청산된 포지션의 평균 보유 기간
  if (classified.closed.length > 0) {
    const totalHoldingDays = classified.closed.reduce((sum, position) => {
      // trades가 있으면 영웅문 시간 사용, 없으면 기존 로직
      if (position.trades && position.trades.length > 0) {
        const openTrade = extractHeroicTimeFromTrades(position.trades, 'BUY');
        const closeTrade = extractHeroicTimeFromTrades(position.trades, 'SELL');
        const holdingDays = calculateHeroicHoldingDays(
          openTrade.brokerDate,
          openTrade.brokerTime,
          closeTrade.brokerDate,
          closeTrade.brokerTime
        );
        return sum + holdingDays;
      } else if (position.openDate && position.closeDate) {
        // fallback: trades가 없으면 기존 로직 사용
        const openDate = new Date(position.openDate);
        const closeDate = new Date(position.closeDate);
        const holdingDays = Math.max(0, (closeDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + holdingDays;
      }
      return sum;
    }, 0);
    avgHoldingTime = totalHoldingDays / classified.closed.length;
  }
  
  // 수익 포지션의 평균 보유 기간
  if (classified.wins.length > 0) {
    const winnerHoldingDays = classified.wins.reduce((sum, position) => {
      // trades가 있으면 영웅문 시간 사용, 없으면 기존 로직
      if (position.trades && position.trades.length > 0) {
        const openTrade = extractHeroicTimeFromTrades(position.trades, 'BUY');
        const closeTrade = extractHeroicTimeFromTrades(position.trades, 'SELL');
        const holdingDays = calculateHeroicHoldingDays(
          openTrade.brokerDate,
          openTrade.brokerTime,
          closeTrade.brokerDate,
          closeTrade.brokerTime
        );
        return sum + holdingDays;
      } else if (position.openDate && position.closeDate) {
        // fallback: trades가 없으면 기존 로직 사용
        const openDate = new Date(position.openDate);
        const closeDate = new Date(position.closeDate);
        const holdingDays = Math.max(0, (closeDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + holdingDays;
      }
      return sum;
    }, 0);
    avgWinnerHoldingTime = winnerHoldingDays / classified.wins.length;
  }
  
  // 손실 포지션의 평균 보유 기간
  if (classified.losses.length > 0) {
    const loserHoldingDays = classified.losses.reduce((sum, position) => {
      // trades가 있으면 영웅문 시간 사용, 없으면 기존 로직
      if (position.trades && position.trades.length > 0) {
        const openTrade = extractHeroicTimeFromTrades(position.trades, 'BUY');
        const closeTrade = extractHeroicTimeFromTrades(position.trades, 'SELL');
        const holdingDays = calculateHeroicHoldingDays(
          openTrade.brokerDate,
          openTrade.brokerTime,
          closeTrade.brokerDate,
          closeTrade.brokerTime
        );
        return sum + holdingDays;
      } else if (position.openDate && position.closeDate) {
        // fallback: trades가 없으면 기존 로직 사용
        const openDate = new Date(position.openDate);
        const closeDate = new Date(position.closeDate);
        const holdingDays = Math.max(0, (closeDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + holdingDays;
      }
      return sum;
    }, 0);
    avgLoserHoldingTime = loserHoldingDays / classified.losses.length;
  }
  
  return {
    avgHoldingTime,
    avgWinnerHoldingTime,
    avgLoserHoldingTime
  };
}

/**
 * 거래일수 계산
 */
export function calculateTradingDays(positions: Position[]): number {
  const tradingDates = new Set<string>();
  
  positions.forEach(position => {
    if (position.openDate) {
      tradingDates.add(position.openDate.toISOString().split('T')[0]);
    }
    if (position.closeDate) {
      tradingDates.add(position.closeDate.toISOString().split('T')[0]);
    }
  });
  
  return tradingDates.size;
}

/**
 * 일평균 포지션 수 계산
 */
export function calculateAvgPositionsPerDay(classified: ClassifiedPositions): number {
  const tradingDays = calculateTradingDays(classified.closed);
  return tradingDays > 0 ? classified.closed.length / tradingDays : 0;
}