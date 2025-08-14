import { Decimal } from 'decimal.js';
import type { Trade } from '../../../types';

/**
 * 평균 매수가 계산
 */
export function calculateAvgBuyPrice(trades: Trade[]): {
  avgBuyPrice: Decimal;
  totalBuyShares: number;
  totalBuyAmount: Decimal;
} {
  let totalBuyAmount = new Decimal(0);
  let totalBuyShares = 0;
  
  trades.forEach(trade => {
    if (trade.tradeType === 'BUY') {
      totalBuyAmount = totalBuyAmount.plus(trade.price.times(trade.quantity));
      totalBuyShares += trade.quantity;
    }
  });
  
  const avgBuyPrice = totalBuyShares > 0 
    ? totalBuyAmount.div(totalBuyShares) 
    : new Decimal(0);
    
  return { avgBuyPrice, totalBuyShares, totalBuyAmount };
}

/**
 * 최대 보유 수량 계산
 */
export function calculateMaxShares(trades: Trade[]): number {
  let currentShares = 0;
  let maxShares = 0;
  
  trades.forEach(trade => {
    if (trade.tradeType === 'BUY') {
      currentShares += trade.quantity;
    } else {
      currentShares -= trade.quantity;
    }
    maxShares = Math.max(maxShares, currentShares);
  });
  
  return maxShares;
}

/**
 * 실현손익 계산 (수수료 포함)
 */
export function calculateRealizedPnl(
  trades: Trade[],
  avgBuyPrice: Decimal,
  buyCommissionRate: number,
  sellCommissionRate: number
): {
  realizedPnl: Decimal;
  totalBuyCommission: Decimal;
  totalSellCommission: Decimal;
} {
  let realizedPnl = new Decimal(0);
  let totalBuyCommission = new Decimal(0);
  let totalSellCommission = new Decimal(0);
  
  trades.forEach(trade => {
    if (trade.tradeType === 'BUY') {
      // 매수 수수료 계산
      const buyAmount = trade.price.times(trade.quantity);
      const buyCommission = buyAmount.times(buyCommissionRate);
      totalBuyCommission = totalBuyCommission.plus(buyCommission);
    } else if (trade.tradeType === 'SELL') {
      // 매도 시 실현손익 계산
      const sellAmount = trade.price.times(trade.quantity);
      const buyAmount = avgBuyPrice.times(trade.quantity);
      const sellCommission = sellAmount.times(sellCommissionRate);
      totalSellCommission = totalSellCommission.plus(sellCommission);
      
      // 매도금액 - 매수금액 - 해당 매도의 수수료
      realizedPnl = realizedPnl.plus(sellAmount.minus(buyAmount).minus(sellCommission));
    }
  });
  
  // 매수 수수료도 실현손익에서 차감
  realizedPnl = realizedPnl.minus(totalBuyCommission);
  
  return { realizedPnl, totalBuyCommission, totalSellCommission };
}

/**
 * ACTIVE 포지션의 실현손익 계산 (부분 매도 고려)
 */
export function calculateActivePositionPnl(
  trades: Trade[],
  avgBuyPrice: Decimal,
  totalBuyShares: number,
  buyCommissionRate: number,
  sellCommissionRate: number
): Decimal {
  let realizedPnl = new Decimal(0);
  let totalBuyCommission = new Decimal(0);
  let totalSellCommission = new Decimal(0);
  
  trades.forEach(trade => {
    if (trade.tradeType === 'BUY') {
      const buyAmount = trade.price.times(trade.quantity);
      const buyCommission = buyAmount.times(buyCommissionRate);
      totalBuyCommission = totalBuyCommission.plus(buyCommission);
    } else if (trade.tradeType === 'SELL') {
      const sellAmount = trade.price.times(trade.quantity);
      const buyAmount = avgBuyPrice.times(trade.quantity);
      const sellCommission = sellAmount.times(sellCommissionRate);
      totalSellCommission = totalSellCommission.plus(sellCommission);
      
      realizedPnl = realizedPnl.plus(sellAmount.minus(buyAmount).minus(sellCommission));
    }
  });
  
  // 매수 수수료는 매도된 수량 비율만큼만 차감
  const totalSoldShares = trades
    .filter(t => t.tradeType === 'SELL')
    .reduce((sum, t) => sum + t.quantity, 0);
  const buyCommissionPortion = totalBuyCommission.times(totalSoldShares).div(totalBuyShares);
  realizedPnl = realizedPnl.minus(buyCommissionPortion);
  
  return realizedPnl;
}