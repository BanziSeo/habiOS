import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import type { ImportResult, ImportType, ExistingData } from './types';
import { DEFAULT_BUY_COMMISSION_RATE, DEFAULT_SELL_COMMISSION_RATE } from './constants';
import { parseCSVFile } from './parsers/csvParser';
import { convertToTrades } from './parsers/tradeConverter';
import { identifyPositions } from './position/positionIdentifier';
import { identifyPositionsForAppend } from './position/positionAppender';
import { groupTradesByTicker } from './position/positionHelpers';

// dayjs 플러그인 초기화
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * CSV 임포트 메인 함수
 * 거래내역 CSV를 파싱하여 Trade와 Position으로 변환
 * 영웅문(미국장) 또는 키움증권(한국장) 지원
 */
export async function importCSV(
  file: File,
  importType: ImportType,
  accountId: string,
  _currentTotalAssets?: Decimal,
  buyCommissionRate: number = DEFAULT_BUY_COMMISSION_RATE,
  sellCommissionRate: number = DEFAULT_SELL_COMMISSION_RATE,
  existingData?: ExistingData,
  accountType?: 'US' | 'KR'
): Promise<ImportResult> {
  const errors: string[] = [];
  
  try {
    // 1. CSV 파싱 (계정 타입에 따라 다른 파서 사용)
    const csvRows = await parseCSVFile(file, accountType);
    
    // 2. Trade 객체로 변환 (한국장의 경우 티커에 .KS 추가)
    const trades = convertToTrades(csvRows, accountId, accountType);
    
    // 3. 포지션 식별
    let positions: Position[] = [];
    let positionTradeMap: Record<string, string[]> = {};
    
    if (importType === 'FULL') {
      // FULL 모드: 전체 데이터로 포지션 식별
      const { positions: positionsMap, positionTradeMap: tradeMap } = 
        identifyPositions(trades, accountId, buyCommissionRate, sellCommissionRate);
      positions = Array.from(positionsMap.values());
      positionTradeMap = tradeMap;
    } else {
      // APPEND 모드
      if (!existingData) {
        // 기존 데이터가 필요함을 알림
        return {
          trades,
          positions: [],
          positionTradeMap: {},
          errors: [],
          needsExistingData: true
        };
      }
      
      // 기존 데이터 준비
      const existingPositionsMap = new Map<string, Position>();
      existingData.positions.forEach(pos => {
        existingPositionsMap.set(pos.id, pos);
      });
      
      const existingTradesByTicker = groupTradesByTicker(existingData.trades);
      
      // 기존 거래 ID 세트 생성 (중복 체크용)
      const existingTradeIds = new Set(existingData.trades.map(t => t.id));
      
      // 새 거래만 필터링
      const newTrades = trades.filter(trade => !existingTradeIds.has(trade.id));
      
      
      // APPEND 모드용 포지션 식별 (새 거래만 전달)
      const { positions: positionsMap, positionTradeMap: tradeMap } = 
        identifyPositionsForAppend(
          newTrades,  // trades 대신 newTrades 전달
          existingPositionsMap, 
          existingTradesByTicker,
          accountId,
          buyCommissionRate,
          sellCommissionRate
        );
      positions = Array.from(positionsMap.values());
      positionTradeMap = tradeMap;
    }
    
    // 4. 데이터 검증
    if (trades.length === 0) {
      errors.push('CSV 파일에서 유효한 거래를 찾을 수 없습니다.');
    }
    
    return {
      trades,
      positions,
      positionTradeMap,
      errors
    };
  } catch (error) {
    errors.push(`CSV 임포트 중 오류 발생: ${error}`);
    return {
      trades: [],
      positions: [],
      positionTradeMap: {},
      errors
    };
  }
}

// Re-export types and utilities
export * from './types';
export { calculateHistoricalEquityCurve } from './equity/historicalEquity';
export { calculateAppendEquityCurve } from './equity/appendEquity';
export { sortTradesByTime, getSortTime } from './utils/tradeSorting';

// Position import type guard
import type { Position } from '../../types';
export type { Position };