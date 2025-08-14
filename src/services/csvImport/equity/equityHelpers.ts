import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';
import type { Trade, Position } from '../../../types';

/**
 * 거래일별 실현손익 계산
 */
export function calculateDailyRealizedPnl(
  positions: Position[],
  buyCommissionRate: number,
  sellCommissionRate: number
): Map<string, Decimal> {
  const dailyRealizedPnl = new Map<string, Decimal>();
  
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
    
    // 매도 거래별 실현손익 계산
    position.trades.forEach(trade => {
      if (trade.tradeType === 'SELL') {
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
  
  return dailyRealizedPnl;
}

/**
 * 모든 거래 날짜 수집 (중복 제거)
 */
export function collectTradeDates(trades: Trade[]): string[] {
  const tradeDates = new Set<string>();
  
  trades.forEach(trade => {
    const dateKey = dayjs(trade.tradeDate).format('YYYY-MM-DD');
    tradeDates.add(dateKey);
  });
  
  return Array.from(tradeDates).sort();
}