import { Decimal } from 'decimal.js';
import type { Position, Trade, StopLoss } from '../types';

interface ChartCandle {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * 차트 미리보기용 더미 Position 생성
 * @param ticker 티커 심볼
 * @param currentPrice 현재가 (차트 데이터의 마지막 close 가격)
 * @param chartData 차트 데이터 배열
 */
export function createDummyPosition(
  ticker: string,
  currentPrice: number,
  chartData: ChartCandle[]
): Position {
  const now = new Date();
  
  // 10일 전, 5일 전 날짜 계산
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  
  // 차트 데이터에서 대략적인 날짜 찾기 (있다면)
  let buyDate = tenDaysAgo;
  let sellDate = fiveDaysAgo;
  let buyPrice = currentPrice * 0.97;
  let sellPrice = currentPrice * 1.02;
  
  if (chartData && chartData.length > 15) {
    // 실제 차트 데이터 활용
    const buyCandle = chartData[chartData.length - 10] || chartData[0];
    const sellCandle = chartData[chartData.length - 5] || chartData[Math.floor(chartData.length / 2)];
    
    buyDate = new Date(buyCandle.time);
    sellDate = new Date(sellCandle.time);
    buyPrice = buyCandle.close;
    sellPrice = sellCandle.close;
  }
  
  const trades: Trade[] = [
    {
      id: 'dummy_trade_1',
      accountId: 'preview_account',
      ticker,
      tickerName: ticker,
      tradeDate: buyDate,
      tradeType: 'BUY',
      quantity: 100,
      price: new Decimal(buyPrice),
      commission: new Decimal(0.5),
      createdAt: buyDate
    },
    {
      id: 'dummy_trade_2',
      accountId: 'preview_account',
      ticker,
      tickerName: ticker,
      tradeDate: sellDate,
      tradeType: 'SELL',
      quantity: 50,
      price: new Decimal(sellPrice),
      commission: new Decimal(0.5),
      createdAt: sellDate
    }
  ];
  
  const stopLosses: StopLoss[] = [
    {
      id: 'dummy_sl_1',
      positionId: 'preview',
      stopPrice: new Decimal(currentPrice * 0.94), // 현재가의 94%
      stopQuantity: 50,
      stopPercentage: 50,
      isActive: true,
      createdAt: tenDaysAgo
    }
  ];
  
  const dummyPosition: Position = {
    id: 'preview',
    accountId: 'preview_account',
    ticker,
    tickerName: ticker,
    status: 'ACTIVE',
    openDate: buyDate,
    avgBuyPrice: new Decimal(currentPrice * 0.97), // 현재가의 97%
    totalShares: 50, // 100주 매수, 50주 매도 = 50주 보유
    maxShares: 100,
    realizedPnl: new Decimal(50 * (sellPrice - buyPrice)), // 50주 매도 수익
    maxRiskAmount: new Decimal(100 * buyPrice * 0.03), // 3% 리스크
    trades,
    stopLosses,
    // 계산된 필드들
    currentPrice: new Decimal(currentPrice),
    marketValue: new Decimal(50 * currentPrice),
    unrealizedPnl: new Decimal(50 * (currentPrice - currentPrice * 0.97)),
    totalPnl: new Decimal(50 * (sellPrice - buyPrice) + 50 * (currentPrice - currentPrice * 0.97)),
    size: 5, // 총자산의 5%
    maxSize: 10, // 최대 10%
    initialR: new Decimal(100 * buyPrice * 0.03),
    rMultiple: 1.5,
    pureRisk: 3,
    totalRisk: 1.5,
    // 옵션 필드들
    setupType: 'PREVIEW',
    entryTime: buyDate,
    rating: 4,
    memo: '차트 설정 미리보기용 더미 포지션'
  };
  
  return dummyPosition;
}