import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';
import type { Trade, Position } from '../../../types';
import type { EquityCurvePoint } from '../types';
import { DEFAULT_BUY_COMMISSION_RATE, DEFAULT_SELL_COMMISSION_RATE } from '../constants';
import { sortTradesByTime } from '../utils/tradeSorting';
import { calculateDailyRealizedPnl, collectTradeDates } from './equityHelpers';

/**
 * Equity Curve 역산 함수 (초기화 임포트 시 사용)
 * 현재 총자산에서 과거로 역산하여 equity curve 생성
 */
export function calculateHistoricalEquityCurve(
  trades: Trade[],
  positions: Position[],
  currentTotalAssets: Decimal,
  buyCommissionRate: number = DEFAULT_BUY_COMMISSION_RATE,
  sellCommissionRate: number = DEFAULT_SELL_COMMISSION_RATE
): EquityCurvePoint[] {
  if (trades.length === 0) return [];
  
  // 시간순 정렬 (애프터마켓 고려)
  const sortedTrades = sortTradesByTime(trades);
  
  // 거래 날짜 수집
  const sortedTradeDates = collectTradeDates(sortedTrades);
  
  // 거래일별 실현손익 계산
  const dailyRealizedPnl = calculateDailyRealizedPnl(
    positions,
    buyCommissionRate,
    sellCommissionRate
  );
  
  // 역산을 위한 equity curve 배열
  const equityCurve: EquityCurvePoint[] = [];
  let currentTotal = currentTotalAssets;
  
  // 거래가 있는 날짜만 역순으로 처리
  for (let i = sortedTradeDates.length - 1; i >= 0; i--) {
    const dateKey = sortedTradeDates[i];
    const dailyPnl = dailyRealizedPnl.get(dateKey) || new Decimal(0);
    
    equityCurve.unshift({
      date: dayjs(dateKey).toDate(),
      totalValue: currentTotal,
      // ⚠️ LEGACY FIELDS - DO NOT USE FOR STOCK/CASH RATIO CALCULATION
      // equity_curve의 stock_value와 cash_value는 historical equity tracking에만 사용됩니다.
      // 실제 Stock/Cash 비율 계산에는 사용하지 마세요!
      // - cashValue는 편의상 totalValue와 동일하게 설정
      // - stockValue는 항상 0으로 설정
      // 실제 Stock/Cash 비율은 portfolioMetrics.ts의 currentStockValue/currentCashValue를 사용하세요.
      cashValue: currentTotal,
      stockValue: new Decimal(0),
      dailyPnl: dailyPnl
    });
    
    // 이전 날의 총자산 = 현재 총자산 - 당일 실현손익
    currentTotal = currentTotal.minus(dailyPnl);
  }
  
  return equityCurve;
}