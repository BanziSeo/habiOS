/**
 * @file CSV Import APPEND 모드 전용 포지션 처리
 * @description 기존 포지션을 유지하면서 새 거래만 추가하는 비즈니스 로직
 *              CLOSED 포지션은 완전 보존, ACTIVE 포지션만 업데이트
 * @module services/csvImport/position
 * @see {@link file://./append_logic.md} APPEND 모드 상세 사양
 * @see {@link positionIdentifier.ts} FULL 모드 처리
 * @author habios
 * @since 2024-08-01
 */

import type { Trade, Position } from '../../../types';
import { DEFAULT_BUY_COMMISSION_RATE, DEFAULT_SELL_COMMISSION_RATE } from '../constants';
import { sortTradesByTime } from '../utils/tradeSorting';
import { identifyPositions } from './positionIdentifier';
import { 
  calculateAvgBuyPrice, 
  calculateRealizedPnl,
  calculateActivePositionPnl 
} from '../utils/positionCalculations';

/**
 * APPEND 모드용 포지션 식별 및 업데이트
 * 
 * @description
 * 기존 포지션 상태를 최대한 보존하면서 새 거래만 추가하는 함수
 * 
 * 처리 원칙:
 * 1. CLOSED 포지션은 절대 건드리지 않음 (회계 정합성 보장)
 * 2. ACTIVE 포지션에 새 거래만 추가
 * 3. 새로운 종목은 새 포지션 생성
 * 
 * 케이스별 처리:
 * - Case 1: CLOSED 포지션 → 완전 무시
 * - Case 2A: ACTIVE + 새 거래 → 여전히 ACTIVE
 * - Case 2B: ACTIVE + 새 거래 → CLOSED로 전환
 * - Case 2C: ACTIVE + 새 거래 → CLOSED 후 새 포지션
 * - Case 3: 새 종목 → 새 포지션 생성
 * 
 * @see {@link file://./append_logic.md} 상세 케이스 설명
 */
/**
 * APPEND 모드에서 새 거래를 기존 포지션에 추가
 * 
 * @param {Trade[]} newTrades - CSV에서 import한 새 거래들 (중복 제거됨)
 * @param {Map<string, Position>} existingPositions - DB의 기존 포지션 맵
 * @param {Map<string, Trade[]>} existingTradesByTicker - 종목별 기존 거래 맵
 * @param {string} accountId - 대상 계정 ID
 * @param {number} [buyCommissionRate=0.0007] - 매수 수수료율 (기본 0.07%)
 * @param {number} [sellCommissionRate=0.0007] - 매도 수수료율 (기본 0.07%)
 * 
 * @returns {{
 *   positions: Map<string, Position>,
 *   positionTradeMap: Record<string, string[]>
 * }} 업데이트된 전체 포지션과 포지션-거래 매핑
 * 
 * @throws {Error} 보유 수량보다 많은 매도 시도 시 (데이터 무결성 오류)
 * 
 * @example
 * // 기존: AAPL 10주 보유 (ACTIVE)
 * // 새 거래: [SELL 10주, BUY 5주, BUY 3주]
 * const result = identifyPositionsForAppend(
 *   newTrades,
 *   existingPositions,
 *   existingTradesByTicker,
 *   'account123'
 * );
 * // 결과: AAPL CLOSED (0주), 새 AAPL ACTIVE (8주)
 */
export function identifyPositionsForAppend(
  newTrades: Trade[],
  existingPositions: Map<string, Position>,
  existingTradesByTicker: Map<string, Trade[]>,
  accountId: string,
  buyCommissionRate: number = DEFAULT_BUY_COMMISSION_RATE,
  sellCommissionRate: number = DEFAULT_SELL_COMMISSION_RATE
): { 
  positions: Map<string, Position>; 
  positionTradeMap: Record<string, string[]> 
} {
  const positions = new Map<string, Position>();
  const positionTradeMap: Record<string, string[]> = {};
  
  // ============================================
  // Step 1: 기존 포지션 분류
  // ============================================
  const closedPositions: Position[] = [];
  const activePositionsByTicker = new Map<string, Position>();
  
  existingPositions.forEach((pos) => {
    if (pos.status === 'CLOSED') {
      closedPositions.push(pos);
    } else {
      activePositionsByTicker.set(pos.ticker, pos);
    }
  });
  
  closedPositions.forEach(pos => {
    positions.set(pos.id, pos);
    if (pos.trades && pos.trades.length > 0) {
      positionTradeMap[pos.id] = pos.trades.map(t => t.id);
    }
  });
  
  // ============================================
  // Step 2: 새 거래를 종목별로 그룹화
  // ============================================
  const newTradesByTicker = new Map<string, Trade[]>();
  newTrades.forEach(trade => {
    if (!newTradesByTicker.has(trade.ticker)) {
      newTradesByTicker.set(trade.ticker, []);
    }
    newTradesByTicker.get(trade.ticker)!.push(trade);
  });
  
  
  // ============================================
  // Step 3: 각 종목별로 새 거래 처리
  // ============================================
  newTradesByTicker.forEach((tickerNewTrades, ticker) => {
    const sortedNewTrades = sortTradesByTime(tickerNewTrades);
    const activePosition = activePositionsByTicker.get(ticker);
    
    if (activePosition) {
      // Case 2: ACTIVE 포지션이 있는 경우
      // 2A: 여전히 ACTIVE
      // 2B: CLOSED로 전환
      // 2C: CLOSED 후 새 포지션 시작
      // ACTIVE 포지션의 거래를 찾기 위해 해당 포지션 ID의 날짜 이후 거래만 필터링
      const existingTrades = existingTradesByTicker.get(ticker) || [];
      
      // ACTIVE 포지션이므로 아직 열려있는 거래들만 포함
      // 포지션 ID에서 날짜를 추출하여 그 이후 거래를 필터링
      const positionStartDate = activePosition.openDate;
      const activePositionTrades = existingTrades.filter(trade => 
        trade.tradeDate >= positionStartDate
      );
      
      const activePositionWithTrades = {
        ...activePosition,
        trades: activePositionTrades
      };
      
      
      const updatedResults = updateActivePositionWithNewTrades(
        activePositionWithTrades,
        sortedNewTrades,
        accountId,
        buyCommissionRate,
        sellCommissionRate
      );
      
      // 업데이트된 포지션들 추가 (CLOSED로 전환되거나 새 포지션이 생성될 수 있음)
      updatedResults.forEach(result => {
        positions.set(result.position.id, result.position);
        positionTradeMap[result.position.id] = result.tradeIds;
      });
    } else {
      // Case 3 or 4: 새 포지션 생성 (기존 포지션이 없거나 모두 CLOSED인 경우)
      const { positions: newPositions, positionTradeMap: newMap } = 
        identifyPositions(sortedNewTrades, accountId, buyCommissionRate, sellCommissionRate);
      
      newPositions.forEach((pos, id) => {
        positions.set(id, pos);
        if (newMap[id]) {
          positionTradeMap[id] = newMap[id];
        }
      });
    }
  });
  
  // 4. 새 거래가 없는 ACTIVE 포지션도 유지
  activePositionsByTicker.forEach((pos, ticker) => {
    if (!newTradesByTicker.has(ticker)) {
      positions.set(pos.id, pos);
      if (pos.trades && pos.trades.length > 0) {
        positionTradeMap[pos.id] = pos.trades.map(t => t.id);
      }
    }
  });
  
  
  return { positions, positionTradeMap };
}

/**
 * ACTIVE 포지션에 새 거래를 추가하고 상태를 업데이트
 * 
 * @description
 * ACTIVE 포지션에 새 거래를 추가하면서 상태 변화를 처리
 * - 포지션이 여전히 ACTIVE로 유지되는 경우
 * - CLOSED로 전환되는 경우
 * - CLOSED 후 남은 거래로 새 포지션이 생성되는 경우
 * 
 * @param {Position} activePosition - 업데이트할 ACTIVE 포지션
 * @param {Trade[]} newTrades - 추가할 새 거래들
 * @param {string} accountId - 계정 ID
 * @param {number} buyCommissionRate - 매수 수수료율
 * @param {number} sellCommissionRate - 매도 수수료율
 * 
 * @returns {Array<{position: Position, tradeIds: string[]}>} 
 *          업데이트된 포지션 배열 (CLOSED 후 새 포지션 생성 시 2개 반환)
 * 
 * @throws {Error} 음수 주식 발생 시
 * 
 * @private
 */
function updateActivePositionWithNewTrades(
  activePosition: Position,
  newTrades: Trade[],
  accountId: string,
  buyCommissionRate: number,
  sellCommissionRate: number
): Array<{ position: Position; tradeIds: string[] }> {
  const results: Array<{ position: Position; tradeIds: string[] }> = [];
  
  // 기존 거래와 새 거래를 합침
  const allTrades = [...activePosition.trades, ...newTrades];
  sortTradesByTime(allTrades); // 정렬만 수행 (현재는 사용하지 않음)
  
  // 현재 보유 수량 계산
  let currentShares = activePosition.totalShares;
  let positionTrades = [...activePosition.trades];
  let hasClosedPosition = false;
  
  // 새 거래만 처리
  let processedNewTradesCount = 0;
  for (const trade of newTrades) {
    if (trade.tradeType === 'BUY') {
      currentShares += trade.quantity;
      positionTrades.push(trade);
      processedNewTradesCount++;
    } else { // SELL
      currentShares -= trade.quantity;
      
      // 🔴 CRITICAL: 음수 주식 검증 - 데이터 무결성 체크
      // CSV 데이터 오류로 인한 음수 주식 방지
      if (currentShares < 0) {
        throw new Error(
          `${activePosition.ticker}: 보유 수량(${activePosition.totalShares + trade.quantity}주)보다 ` +
          `많은 매도(${trade.quantity}주) 시도. ` +
          `거래 ID: ${trade.id}`
        );
      }
      
      positionTrades.push(trade);
      processedNewTradesCount++;
      
      // 포지션이 완전히 청산되었는지 확인
      if (currentShares === 0) {
        hasClosedPosition = true;
        break;
      }
    }
  }
  
  if (hasClosedPosition && currentShares === 0) {
    // Case 2B: CLOSED로 전환
    const updatedPosition: Position = {
      ...activePosition,
      status: 'CLOSED',
      closeDate: positionTrades[positionTrades.length - 1].tradeDate,
      totalShares: 0,
      trades: positionTrades,
      // realizedPnl 재계산 필요
      realizedPnl: (() => {
        const { avgBuyPrice } = calculateAvgBuyPrice(positionTrades);
        const { realizedPnl } = calculateRealizedPnl(
          positionTrades,
          avgBuyPrice,
          buyCommissionRate,
          sellCommissionRate
        );
        return realizedPnl;
      })()
    };
    
    results.push({
      position: updatedPosition,
      tradeIds: positionTrades.map(t => t.id)
    });
    
    // Case 2C: CLOSED 후 남은 거래가 있으면 새 포지션 생성
    // 💡 NOTE: processedNewTradesCount는 CLOSED 시점까지 처리한 거래 개수
    const remainingTrades = newTrades.slice(processedNewTradesCount);
    if (remainingTrades.length > 0) {
      const { positions: newPositions, positionTradeMap: newMap } = 
        identifyPositions(remainingTrades, accountId, buyCommissionRate, sellCommissionRate);
      
      newPositions.forEach((pos, id) => {
        results.push({
          position: pos,
          tradeIds: newMap[id] || []
        });
      });
    }
  } else {
    // Case 2A: 여전히 ACTIVE
    const updatedPosition: Position = {
      ...activePosition,
      totalShares: currentShares,
      trades: positionTrades,
      // avgBuyPrice와 realizedPnl 재계산 필요
      avgBuyPrice: calculateAvgBuyPrice(positionTrades).avgBuyPrice,
      realizedPnl: (() => {
        const { avgBuyPrice, totalBuyShares } = calculateAvgBuyPrice(positionTrades);
        return calculateActivePositionPnl(
          positionTrades,
          avgBuyPrice,
          totalBuyShares,
          buyCommissionRate,
          sellCommissionRate
        );
      })()
    };
    
    results.push({
      position: updatedPosition,
      tradeIds: positionTrades.map(t => t.id)
    });
  }
  
  return results;
}

