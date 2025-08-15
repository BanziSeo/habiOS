import { useMemo } from 'react';
import dayjs from 'dayjs';
import type { Position } from '../../../../types';
import type { DailyData } from '../types';

export const useDailyData = (positions: Position[]): Map<string, DailyData> => {
  return useMemo(() => {
    const dailyMap = new Map<string, DailyData>();

    positions.forEach(position => {
      // 오픈 날짜 처리
      const openDate = dayjs(position.openDate).format('YYYY-MM-DD');
      
      const openExisting = dailyMap.get(openDate) || {
        date: openDate,
        pnl: 0,
        tradeCount: 0,
        positionCount: 0,
        closedPositions: 0,
        openedPositions: 0,
        winRate: 0,
        volume: 0,
        commission: 0,
      };

      // 오픈 날짜에 포지션 추가
      dailyMap.set(openDate, {
        ...openExisting,
        openedPositions: openExisting.openedPositions + 1,
        positionCount: openExisting.positionCount + 1,
        tradeCount: openExisting.tradeCount + 1, // 호환성을 위해 유지
        volume: openExisting.volume + (position.totalShares || 0),
      });

      // 클로즈 날짜 처리 (클로즈된 포지션만)
      if (position.closeDate) {
        const closeDate = dayjs(position.closeDate).format('YYYY-MM-DD');
        
        const closeExisting = dailyMap.get(closeDate) || {
          date: closeDate,
          pnl: 0,
          tradeCount: 0,
          positionCount: 0,
          closedPositions: 0,
          openedPositions: 0,
          winRate: 0,
          volume: 0,
          commission: 0,
        };

        const pnl = position.realizedPnl ? position.realizedPnl.toNumber() : 0;
        const isWin = pnl > 0;
        const winCount = closeExisting.closedPositions > 0 
          ? (closeExisting.winRate * closeExisting.closedPositions / 100) + (isWin ? 1 : 0)
          : (isWin ? 1 : 0);

        dailyMap.set(closeDate, {
          ...closeExisting,
          pnl: closeExisting.pnl + pnl,
          closedPositions: closeExisting.closedPositions + 1,
          winRate: closeExisting.closedPositions > 0 
            ? (winCount / (closeExisting.closedPositions + 1)) * 100
            : (isWin ? 100 : 0),
        });
      }
    });

    return dailyMap;
  }, [positions]);
};