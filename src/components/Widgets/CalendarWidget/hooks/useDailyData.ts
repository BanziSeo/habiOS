import { useMemo } from 'react';
import dayjs from 'dayjs';
import type { Position } from '../../../../types';
import type { DailyData } from '../types';

export const useDailyData = (positions: Position[]): Map<string, DailyData> => {
  return useMemo(() => {
    const dailyMap = new Map<string, DailyData>();

    positions.forEach(position => {
      const date = dayjs(position.openDate).format('YYYY-MM-DD');
      
      const existing = dailyMap.get(date) || {
        date,
        pnl: 0,
        tradeCount: 0,
        winRate: 0,
        volume: 0,
        commission: 0,
      };

      const pnl = position.realizedPnl ? position.realizedPnl.toNumber() : 0;
      const isWin = pnl > 0;

      dailyMap.set(date, {
        date,
        pnl: existing.pnl + pnl,
        tradeCount: existing.tradeCount + 1,
        winRate: ((existing.winRate * existing.tradeCount + (isWin ? 100 : 0)) / (existing.tradeCount + 1)),
        volume: existing.volume + (position.totalShares || 0),
        commission: existing.commission + 0, // Position에 commission 필드가 없음
      });
    });

    return dailyMap;
  }, [positions]);
};