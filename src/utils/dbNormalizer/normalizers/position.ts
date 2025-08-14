import { Decimal } from 'decimal.js';
import type { Position } from '../../../types';
import type { DBPositionRow, PositionDTO } from '../../../types/api';
import type { DBPosition } from '../../../types/database';
import type { DBPositionInput } from '../types';
import { TYPE_CONVERTERS } from '../constants';
import { normalizeTradeFromDB } from './trade';
import { normalizeStopLossFromDB } from './stopLoss';

/**
 * DB 포지션을 Frontend 포지션으로 변환
 * 이전 버전과의 호환성을 위해 DBPosition 타입도 받을 수 있도록 함
 */
export function normalizePositionFromDB(dbPosition: DBPosition | DBPositionRow): Position {
  // DBPosition은 필드가 다르므로 타입 가드로 구분
  const isDBPosition = 'open_date' in dbPosition;
  return {
    id: dbPosition.id,
    accountId: dbPosition.account_id,
    ticker: dbPosition.ticker,
    tickerName: isDBPosition ? (dbPosition as DBPosition).ticker_name : undefined,
    status: dbPosition.status,
    openDate: isDBPosition ? new Date((dbPosition as DBPosition).open_date) : new Date((dbPosition as DBPositionRow).created_at),
    closeDate: isDBPosition && (dbPosition as DBPosition).close_date ? new Date((dbPosition as DBPosition).close_date!) : undefined,
    avgBuyPrice: new Decimal(dbPosition.avg_buy_price || 0),
    totalShares: dbPosition.total_shares || 0,
    maxShares: dbPosition.max_shares || 0,
    realizedPnl: new Decimal(dbPosition.realized_pnl || 0),
    maxRiskAmount: dbPosition.max_risk_amount ? new Decimal(dbPosition.max_risk_amount) : undefined,
    setupType: isDBPosition ? (dbPosition as DBPosition).setup_type : undefined,
    entryTime: isDBPosition && (dbPosition as DBPosition).entry_time ? new Date((dbPosition as DBPosition).entry_time!) : undefined,
    rating: isDBPosition ? (dbPosition as DBPosition).rating : undefined,
    memo: isDBPosition ? (dbPosition as DBPosition).memo : undefined,
    trades: isDBPosition ? (dbPosition as DBPosition).trades?.map(normalizeTradeFromDB) || [] : [],
    stopLosses: isDBPosition ? (dbPosition as DBPosition).stopLosses?.map(normalizeStopLossFromDB) || [] : [],
  };
}

/**
 * Frontend 포지션을 DB 형식으로 변환
 * 주로 저장/업데이트 시 사용
 */
export function denormalizePositionToDB(position: Partial<Position>): DBPositionInput {
  const dbData: DBPositionInput = {};
  
  if (position.id !== undefined) dbData.id = position.id;
  if (position.accountId !== undefined) dbData.account_id = position.accountId;
  if (position.ticker !== undefined) dbData.ticker = position.ticker;
  if (position.tickerName !== undefined) dbData.ticker_name = position.tickerName;
  if (position.status !== undefined) dbData.status = position.status;
  if (position.openDate !== undefined) dbData.open_date = TYPE_CONVERTERS.toDB.date(position.openDate);
  if (position.closeDate !== undefined && position.closeDate !== null) dbData.close_date = TYPE_CONVERTERS.toDB.date(position.closeDate);
  if (position.avgBuyPrice !== undefined) dbData.avg_buy_price = TYPE_CONVERTERS.toDB.decimal(position.avgBuyPrice);
  if (position.totalShares !== undefined) dbData.total_shares = position.totalShares;
  if (position.maxShares !== undefined) dbData.max_shares = position.maxShares;
  if (position.realizedPnl !== undefined) dbData.realized_pnl = TYPE_CONVERTERS.toDB.decimal(position.realizedPnl);
  if (position.maxRiskAmount !== undefined) dbData.max_risk_amount = position.maxRiskAmount ? TYPE_CONVERTERS.toDB.decimal(position.maxRiskAmount) : null;
  if (position.setupType !== undefined) dbData.setup_type = position.setupType;
  if (position.entryTime !== undefined) dbData.entry_time = TYPE_CONVERTERS.toDB.date(position.entryTime);
  if (position.rating !== undefined) dbData.rating = position.rating;
  if (position.memo !== undefined) dbData.memo = position.memo;
  
  return dbData;
}

/**
 * API DTO를 Frontend Position으로 변환
 * DTO는 최소한의 필드만 가지고 있으므로 없는 필드는 기본값 처리
 */
export function normalizePositionFromDTO(dto: PositionDTO): Position {
  return {
    id: dto.id,
    accountId: dto.accountId,
    ticker: dto.ticker,
    tickerName: undefined, // DTO에 없음
    status: dto.status,
    openDate: dto.createdAt, // createdAt을 openDate로 사용
    closeDate: dto.status === 'CLOSED' ? dto.updatedAt : undefined,
    avgBuyPrice: new Decimal(dto.avgBuyPrice),
    totalShares: dto.totalShares,
    maxShares: dto.maxShares,
    realizedPnl: new Decimal(dto.realizedPnl),
    maxRiskAmount: dto.maxRiskAmount ? new Decimal(dto.maxRiskAmount) : undefined,
    setupType: undefined, // DTO에 없음
    entryTime: undefined, // DTO에 없음
    rating: undefined, // DTO에 없음
    memo: undefined, // DTO에 없음
    trades: dto.trades?.map(trade => ({
      id: trade.id,
      accountId: trade.accountId,
      ticker: trade.ticker,
      tickerName: undefined, // DTO에 없음
      tradeType: (trade.action === 'SHORT' || trade.action === 'COVER') ? 'SELL' : trade.action as 'BUY' | 'SELL',
      quantity: trade.quantity,
      price: new Decimal(trade.price),
      commission: new Decimal(trade.commission),
      tradeDate: trade.executedAt,
      tradeTime: undefined, // DTO에 없음
      brokerDate: trade.tradeDate, // tradeDate를 brokerDate로 사용
      brokerTime: undefined, // DTO에 없음
      createdAt: trade.createdAt
    })) || [],
    stopLosses: dto.stopLosses?.map(sl => ({
      id: sl.id,
      positionId: sl.positionId,
      stopPrice: new Decimal(sl.stopPrice),
      stopQuantity: sl.stopQuantity,
      stopPercentage: sl.stopPercentage,
      inputMode: 'percentage', // 기본값
      isActive: sl.isActive,
      createdAt: sl.createdAt
    })) || []
  };
}

/**
 * Frontend Position을 API DTO로 변환
 * DTO의 필드만 포함
 */
export function denormalizePositionToDTO(position: Position): Partial<PositionDTO> {
  return {
    id: position.id,
    accountId: position.accountId,
    ticker: position.ticker,
    status: position.status,
    avgBuyPrice: position.avgBuyPrice.toNumber(),
    totalShares: position.totalShares,
    maxShares: position.maxShares,
    realizedPnl: position.realizedPnl.toNumber(),
    maxRiskAmount: position.maxRiskAmount?.toNumber()
    // createdAt, updatedAt은 서버에서 관리
    // trades, stopLosses는 별도 처리
  };
}