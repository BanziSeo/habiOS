import type { Trade, Position } from '../../../types';
import { DEFAULT_BUY_COMMISSION_RATE, DEFAULT_SELL_COMMISSION_RATE } from '../constants';
import { sortTradesByTime } from '../utils/tradeSorting';
import { 
  calculateAvgBuyPrice, 
  calculateMaxShares, 
  calculateRealizedPnl,
  calculateActivePositionPnl 
} from '../utils/positionCalculations';
import { generatePositionId, groupTradesByTicker } from './positionHelpers';

/**
 * 포지션 식별 알고리즘
 * FIFO 방식으로 거래를 그룹화하여 포지션 생성
 */
export function identifyPositions(
  trades: Trade[],
  accountId: string,
  buyCommissionRate: number = DEFAULT_BUY_COMMISSION_RATE,
  sellCommissionRate: number = DEFAULT_SELL_COMMISSION_RATE
): { 
  positions: Map<string, Position>; 
  positionTradeMap: Record<string, string[]> 
} {
  const positions = new Map<string, Position>();
  const positionTradeMap: Record<string, string[]> = {};
  
  // 종목별로 거래 그룹화
  const tradesByTicker = groupTradesByTicker(trades);
  
  // 전체 포지션 ID 리스트 (로그용)
  const allPositionIds: string[] = [];
  
  // 각 종목별로 포지션 식별
  tradesByTicker.forEach((tickerTrades, ticker) => {
    // 시간순 정렬
    const sortedTrades = sortTradesByTime(tickerTrades);
    
    let currentShares = 0;
    let positionTrades: Trade[] = [];
    let positionCount = 0;
    
    
    sortedTrades.forEach((trade) => {
      
      if (trade.tradeType === 'BUY') {
        // 수량이 0이면 새 포지션 시작
        if (currentShares === 0 && positionTrades.length > 0) {
          // 이전 포지션이 있었지만 완전히 청산된 상태에서 새로 매수
          // 이 경우 새 포지션으로 처리해야 함
          positionTrades = [];
        }
        currentShares += trade.quantity;
        positionTrades.push(trade);
      } else { // SELL
        currentShares -= trade.quantity;
        positionTrades.push(trade);
        
        
        if (currentShares === 0) {
          // 포지션 종료 - CLOSED 포지션 생성
          const position = createClosedPosition(
            positionTrades,
            ticker,
            accountId,
            buyCommissionRate,
            sellCommissionRate
          );
          
          positionCount++;
          allPositionIds.push(position.id);
          
          positions.set(position.id, position);
          positionTradeMap[position.id] = positionTrades.map(t => t.id);
          
          // 다음 포지션을 위해 초기화
          positionTrades = [];
        }
      }
    });
    
    // 아직 열려있는 포지션 처리
    if (currentShares > 0 && positionTrades.length > 0) {
      const position = createActivePosition(
        positionTrades,
        ticker,
        accountId,
        currentShares,
        buyCommissionRate,
        sellCommissionRate
      );
      
      positionCount++;
      allPositionIds.push(position.id);
      
      positions.set(position.id, position);
      positionTradeMap[position.id] = positionTrades.map(t => t.id);
    }
    
  });
  
  
  return { positions, positionTradeMap };
}

/**
 * CLOSED 포지션 생성
 */
function createClosedPosition(
  positionTrades: Trade[],
  ticker: string,
  accountId: string,
  buyCommissionRate: number,
  sellCommissionRate: number
): Position {
  const firstTrade = positionTrades[0];
  const lastTrade = positionTrades[positionTrades.length - 1];
  const positionId = generatePositionId(firstTrade, ticker, accountId);
  
  // 평균 매수가 계산
  const { avgBuyPrice } = calculateAvgBuyPrice(positionTrades);
  
  // 최대 보유 수량 계산
  const maxShares = calculateMaxShares(positionTrades);
  
  // 실현손익 계산 (수수료 포함)
  const { realizedPnl } = calculateRealizedPnl(
    positionTrades,
    avgBuyPrice,
    buyCommissionRate,
    sellCommissionRate
  );
  
  return {
    id: positionId,
    accountId: accountId, // 파라미터로 받은 accountId 사용
    ticker,
    tickerName: firstTrade.tickerName || ticker,
    status: 'CLOSED',
    openDate: firstTrade.tradeDate,
    closeDate: lastTrade.tradeDate,
    avgBuyPrice,
    totalShares: 0, // 종료된 포지션
    maxShares,
    realizedPnl,
    entryTime: firstTrade.tradeDate,
    trades: [...positionTrades],
    stopLosses: []
  };
}

/**
 * ACTIVE 포지션 생성
 */
function createActivePosition(
  positionTrades: Trade[],
  ticker: string,
  accountId: string,
  currentShares: number,
  buyCommissionRate: number,
  sellCommissionRate: number
): Position {
  const firstTrade = positionTrades[0];
  const positionId = generatePositionId(firstTrade, ticker, accountId);
  
  // 평균 매수가 계산
  const { avgBuyPrice, totalBuyShares } = calculateAvgBuyPrice(positionTrades);
  
  // 최대 보유 수량 계산
  const maxShares = calculateMaxShares(positionTrades);
  
  // ACTIVE 포지션의 실현손익 계산 (부분 매도 고려)
  const realizedPnl = calculateActivePositionPnl(
    positionTrades,
    avgBuyPrice,
    totalBuyShares,
    buyCommissionRate,
    sellCommissionRate
  );
  
  return {
    id: positionId,
    accountId: accountId, // 파라미터로 받은 accountId 사용
    ticker,
    tickerName: firstTrade.tickerName || ticker,
    status: 'ACTIVE',
    openDate: firstTrade.tradeDate,
    closeDate: null,  // undefined 대신 null 사용 (IPC 호환성)
    avgBuyPrice,
    totalShares: currentShares,
    maxShares,
    realizedPnl,
    entryTime: firstTrade.tradeDate,
    trades: [...positionTrades],
    stopLosses: []
  };
}