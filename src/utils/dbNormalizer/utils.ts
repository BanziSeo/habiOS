import type { Position, Trade } from '../../types';
import type { DBPosition, DBTrade } from '../../types/database';
import type { DBPositionRow, DBTradeRow } from '../../types/api';
import { normalizePositionFromDB } from './normalizers/position';
import { normalizeTradeFromDB } from './normalizers/trade';

/**
 * DB 포지션 배열을 Frontend 포지션 배열로 변환
 */
export function normalizePositionsFromDB(dbPositions: (DBPosition | DBPositionRow)[]): Position[] {
  return dbPositions.map(normalizePositionFromDB).filter(pos => pos !== null);
}

/**
 * DB 거래 배열을 Frontend 거래 배열로 변환
 */
export function normalizeTradesFromDB(dbTrades: (DBTrade | DBTradeRow)[]): Trade[] {
  return dbTrades.map(normalizeTradeFromDB);
}