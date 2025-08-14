import { Decimal } from 'decimal.js';
import type { Trade } from '../../../types';
import type { DBTradeRow, TradeDTO } from '../../../types/api';
import type { DBTrade } from '../../../types/database';
import type { DBTradeInput, ExtendedTrade } from '../types';
import { TYPE_CONVERTERS } from '../constants';

/**
 * DB 거래를 Frontend 거래로 변환
 * 이전 버전과의 호환성을 위해 DBTrade 타입도 받을 수 있도록 함
 */
export function normalizeTradeFromDB(dbTrade: DBTrade | DBTradeRow): Trade {
  // DBTrade는 필드가 다르므로 타입 가드로 구분
  const isDBTrade = 'trade_type' in dbTrade;
  
  const normalized = {
    id: dbTrade.id,
    accountId: dbTrade.account_id,
    ticker: dbTrade.ticker,
    tickerName: isDBTrade ? (dbTrade as DBTrade).ticker_name : undefined,
    tradeType: isDBTrade ? (dbTrade as DBTrade).trade_type : 
      TYPE_CONVERTERS.toFrontend.tradeType((dbTrade as DBTradeRow).action),
    quantity: dbTrade.quantity,
    price: new Decimal(dbTrade.price || 0),
    commission: new Decimal(dbTrade.commission || 0),
    tradeDate: new Date(dbTrade.trade_date),
    tradeTime: isDBTrade ? (dbTrade as DBTrade).trade_time : (dbTrade as DBTradeRow).trade_time,
    brokerDate: isDBTrade ? (dbTrade as DBTrade).broker_date : (dbTrade as DBTradeRow).broker_date,
    brokerTime: isDBTrade ? (dbTrade as DBTrade).broker_time : (dbTrade as DBTradeRow).broker_time,
    createdAt: new Date(dbTrade.created_at || new Date())
  };
  
  return normalized;
}

/**
 * Frontend 거래를 DB 형식으로 변환
 * ExtendedTrade를 통해 추가 필드 지원
 */
export function denormalizeTradeToDB(trade: Partial<Trade & ExtendedTrade>): DBTradeInput {
  const dbData: DBTradeInput = {};
  
  if (trade.id !== undefined) dbData.id = trade.id;
  if (trade.accountId !== undefined) dbData.account_id = trade.accountId;
  // positionId는 ExtendedTrade에 정의됨
  if (trade.positionId !== undefined) dbData.position_id = trade.positionId;
  if (trade.ticker !== undefined) dbData.ticker = trade.ticker;
  if (trade.tickerName !== undefined) dbData.ticker_name = trade.tickerName;
  if (trade.tradeType !== undefined) dbData.trade_type = TYPE_CONVERTERS.toDB.tradeType(trade.tradeType);
  if (trade.quantity !== undefined) dbData.quantity = trade.quantity;
  if (trade.price !== undefined) dbData.price = TYPE_CONVERTERS.toDB.decimal(trade.price);
  if (trade.commission !== undefined) dbData.commission = TYPE_CONVERTERS.toDB.decimal(trade.commission);
  if (trade.tradeDate !== undefined) dbData.trade_date = TYPE_CONVERTERS.toDB.date(trade.tradeDate);
  if (trade.tradeTime !== undefined) dbData.trade_time = trade.tradeTime;
  if (trade.brokerDate !== undefined) dbData.broker_date = trade.brokerDate;
  if (trade.brokerTime !== undefined) dbData.broker_time = trade.brokerTime;
  // note도 ExtendedTrade에 정의됨
  if (trade.note !== undefined) dbData.note = trade.note;
  
  return dbData;
}

/**
 * API DTO를 Frontend Trade로 변환
 * DTO는 최소한의 필드만 가지고 있음
 */
export function normalizeTradeFromDTO(dto: TradeDTO): Trade & ExtendedTrade {
  const trade: Trade & ExtendedTrade = {
    id: dto.id,
    accountId: dto.accountId,
    ticker: dto.ticker,
    tickerName: undefined, // DTO에 없음
    tradeType: (dto.action === 'SHORT' || dto.action === 'COVER') ? 'SELL' : dto.action as 'BUY' | 'SELL',
    quantity: dto.quantity,
    price: new Decimal(dto.price),
    commission: new Decimal(dto.commission),
    tradeDate: dto.executedAt,
    tradeTime: undefined, // DTO에 없음
    brokerDate: dto.tradeDate, // string 타입
    brokerTime: undefined, // DTO에 없음
    createdAt: dto.createdAt,
    // ExtendedTrade 필드
    note: dto.note
  };
  
  return trade;
}

/**
 * Frontend Trade를 API DTO로 변환
 * DTO의 필드만 포함
 */
export function denormalizeTradeToDTO(trade: Trade & Partial<ExtendedTrade>): Partial<TradeDTO> {
  return {
    id: trade.id,
    accountId: trade.accountId,
    ticker: trade.ticker,
    action: trade.tradeType === 'SELL' ? 'SELL' : 'BUY', // SHORT/COVER는 별도 처리 필요 시 추가
    quantity: trade.quantity,
    price: trade.price.toNumber(),
    commission: trade.commission.toNumber(),
    executedAt: trade.tradeDate,
    tradeDate: trade.brokerDate || new Date().toISOString().split('T')[0], // brokerDate 또는 기본값
    note: trade.note
    // createdAt, updatedAt은 서버에서 관리
  };
}