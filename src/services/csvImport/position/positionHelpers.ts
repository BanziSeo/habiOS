import dayjs from 'dayjs';
import type { Trade } from '../../../types';
import { ID_DATE_FORMAT } from '../constants';

/**
 * 포지션 ID 생성
 * 형식: ACCOUNTID_YYYYMMDD_HHMMSS_TICKER
 * accountId를 prefix로 추가하여 계정별 고유성 보장
 */
export function generatePositionId(firstTrade: Trade, ticker: string, accountId: string): string {
  const timeStr = firstTrade.tradeTime ? firstTrade.tradeTime.replace(/:/g, '') : '000000';
  return `${accountId}_${dayjs(firstTrade.tradeDate).format(ID_DATE_FORMAT)}_${timeStr}_${ticker}`;
}

/**
 * 새로운 포지션 시작 여부 판단
 * 현재 보유 수량이 0이고, 이전 거래와 시간이 다를 때
 */
export function isNewPositionStart(
  currentShares: number,
  trade: Trade,
  prevTrade: Trade | null
): boolean {
  if (currentShares !== 0) return false;
  
  const isSameTime = prevTrade && 
    prevTrade.tradeType === 'BUY' && 
    prevTrade.tradeTime === trade.tradeTime &&
    dayjs(prevTrade.tradeDate).isSame(dayjs(trade.tradeDate), 'day');
    
  return !isSameTime;
}

/**
 * 종목별로 거래 그룹화
 */
export function groupTradesByTicker(trades: Trade[]): Map<string, Trade[]> {
  const tradesByTicker = new Map<string, Trade[]>();
  
  trades.forEach(trade => {
    if (!tradesByTicker.has(trade.ticker)) {
      tradesByTicker.set(trade.ticker, []);
    }
    tradesByTicker.get(trade.ticker)!.push(trade);
  });
  
  return tradesByTicker;
}