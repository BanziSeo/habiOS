import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import type { Trade, Position } from '../../../types';
import type { EquityCurvePoint } from '../types';
import { DEFAULT_BUY_COMMISSION_RATE, DEFAULT_SELL_COMMISSION_RATE } from '../constants';
import { sortTradesByTime } from '../utils/tradeSorting';

dayjs.extend(isSameOrAfter);

/**
 * Equity Curve 추가 계산 함수 (APPEND 모드 시 사용)
 * 마지막 equity data 이후의 거래만 처리하여 추가
 */
export function calculateAppendEquityCurve(
  trades: Trade[],
  positions: Position[],
  lastEquityData: { date: Date; totalValue: Decimal },
  buyCommissionRate: number = DEFAULT_BUY_COMMISSION_RATE,
  sellCommissionRate: number = DEFAULT_SELL_COMMISSION_RATE
): EquityCurvePoint[] {
  if (trades.length === 0) return [];
  
  // 시간순 정렬 (애프터마켓 고려)
  const sortedTrades = sortTradesByTime(trades);
  
  // 마지막 equity curve 데이터 이후의 거래만 필터링
  const lastDate = dayjs(lastEquityData.date);
  const newTrades = sortedTrades.filter(trade => 
    dayjs(trade.tradeDate).isAfter(lastDate, 'day')
  );
  
  if (newTrades.length === 0) return [];
  
  // 새로운 거래 날짜 수집 (중복 제거)
  const newTradeDates = new Set<string>();
  newTrades.forEach(trade => {
    const dateKey = dayjs(trade.tradeDate).format('YYYY-MM-DD');
    newTradeDates.add(dateKey);
  });
  
  // 거래 날짜를 정렬된 배열로 변환
  const sortedNewTradeDates = Array.from(newTradeDates).sort();
  
  // 거래일별 실현손익 계산
  const dailyRealizedPnl = new Map<string, Decimal>();
  
  // 각 포지션별로 매도 거래 찾아서 실현손익 계산
  positions.forEach(position => {
    let buyCommissionTotal = new Decimal(0);
    let avgBuyPrice = new Decimal(0);
    let totalBuyAmount = new Decimal(0);
    let totalBuyShares = 0;
    
    // 평균 매수가와 매수 수수료 계산
    position.trades.forEach(trade => {
      if (trade.tradeType === 'BUY') {
        const buyAmount = trade.price.times(trade.quantity);
        const commission = buyAmount.times(buyCommissionRate);
        buyCommissionTotal = buyCommissionTotal.plus(commission);
        totalBuyAmount = totalBuyAmount.plus(buyAmount);
        totalBuyShares += trade.quantity;
      }
    });
    
    avgBuyPrice = totalBuyShares > 0 ? totalBuyAmount.div(totalBuyShares) : new Decimal(0);
    
    // 새로운 매도 거래만 처리
    position.trades.forEach(trade => {
      if (trade.tradeType === 'SELL' && dayjs(trade.tradeDate).isAfter(lastDate, 'day')) {
        const dateKey = dayjs(trade.tradeDate).format('YYYY-MM-DD');
        const sellAmount = trade.price.times(trade.quantity);
        const buyAmount = avgBuyPrice.times(trade.quantity);
        const sellCommission = sellAmount.times(sellCommissionRate);
        
        // 해당 매도에 대응하는 매수 수수료 비율 계산
        const buyCommissionPortion = buyCommissionTotal.times(trade.quantity).div(totalBuyShares);
        
        // 실현손익 = 매도금액 - 매수금액 - 매도수수료 - 매수수수료(비율)
        const pnl = sellAmount.minus(buyAmount).minus(sellCommission).minus(buyCommissionPortion);
        
        if (!dailyRealizedPnl.has(dateKey)) {
          dailyRealizedPnl.set(dateKey, new Decimal(0));
        }
        dailyRealizedPnl.set(dateKey, dailyRealizedPnl.get(dateKey)!.plus(pnl));
      }
    });
  });
  
  // equity curve 배열 생성
  const equityCurve: EquityCurvePoint[] = [];
  let currentTotal = lastEquityData.totalValue;
  
  // 새로운 거래가 있는 날짜만 처리
  sortedNewTradeDates.forEach(dateKey => {
    const dailyPnl = dailyRealizedPnl.get(dateKey) || new Decimal(0);
    
    // 이전 날의 총자산 + 당일 실현손익
    currentTotal = currentTotal.plus(dailyPnl);
    
    equityCurve.push({
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
  });
  
  return equityCurve;
}