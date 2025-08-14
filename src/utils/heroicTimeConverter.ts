/**
 * 영웅문 시간 변환 유틸리티
 * 
 * 영웅문 거래 시스템의 시간 표기 규칙:
 * - 1 거래일 = 17:00 ~ 다음날 08:00 (15시간)
 * - 17:00~23:59: 당일 거래일
 * - 00:00~07:59: 전날 거래일 (영웅문 표기상)
 * - 08:00~16:59: 전날 거래일 (영웅문 표기상)
 */

import type { Trade } from '../types';

/**
 * 영웅문 표기 시간을 실제 시간으로 변환
 * @param brokerDate 영웅문 표기 날짜 (YYYY/MM/DD)
 * @param brokerTime 영웅문 표기 시간 (HH:MM:SS)
 * @returns 실제 DateTime
 */
export function convertHeroicTimeToActualTime(
  brokerDate: string | undefined,
  brokerTime: string | undefined
): Date | null {
  if (!brokerDate || !brokerTime) {
    return null;
  }

  try {
    const [hour, minute, second] = brokerTime.split(':').map(Number);
    
    // brokerDate가 YYYY/MM/DD 형식 처리
    const dateParts = brokerDate.split('/').map(Number);
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    
    // 날짜와 시간을 합쳐서 Date 객체 생성 (로컬 시간대)
    const date = new Date(year, month - 1, day, hour, minute, second || 0, 0);
    
    // 날짜가 유효한지 확인
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // 영웅문 로직: 
    // 00:00~07:59는 실제로는 다음날 (영웅문이 전날로 표기했으므로 +1일)
    if (hour >= 0 && hour < 8) {
      date.setDate(date.getDate() + 1);
    }
    // 08:00~16:59는 실제로는 다음날 (영웅문이 전날로 표기했으므로 +1일)
    else if (hour >= 8 && hour < 17) {
      date.setDate(date.getDate() + 1);
    }
    // 17:00~23:59는 당일 그대로 (변환 불필요)
    
    return date;
  } catch (error) {
    return null;
  }
}

/**
 * 두 영웅문 시간 사이의 실제 경과 일수 계산
 * @param openBrokerDate 오픈 영웅문 날짜
 * @param openBrokerTime 오픈 영웅문 시간
 * @param closeBrokerDate 종료 영웅문 날짜
 * @param closeBrokerTime 종료 영웅문 시간
 * @returns 경과 일수 (소수점 포함)
 */
export function calculateHeroicHoldingDays(
  openBrokerDate: string | undefined,
  openBrokerTime: string | undefined,
  closeBrokerDate: string | undefined,
  closeBrokerTime: string | undefined
): number {
  const openDate = convertHeroicTimeToActualTime(openBrokerDate, openBrokerTime);
  const closeDate = convertHeroicTimeToActualTime(closeBrokerDate, closeBrokerTime);
  
  if (!openDate || !closeDate) {
    return 0;
  }
  
  const holdingMs = closeDate.getTime() - openDate.getTime();
  const holdingDays = holdingMs / (1000 * 60 * 60 * 24);
  
  // 음수 방지 (데이터 오류 대비)
  return Math.max(0, holdingDays);
}

/**
 * Position의 trades에서 영웅문 시간 정보 추출
 * @param trades 거래 목록
 * @param tradeType 거래 타입 (BUY/SELL)
 * @returns 첫 번째/마지막 거래의 영웅문 시간
 */
export function extractHeroicTimeFromTrades(
  trades: Trade[] | undefined,
  tradeType: 'BUY' | 'SELL'
): { brokerDate?: string; brokerTime?: string } {
  if (!trades || trades.length === 0) {
    return {};
  }
  
  const filteredTrades = trades.filter(t => t.tradeType === tradeType);
  if (filteredTrades.length === 0) {
    return {};
  }
  
  // BUY는 첫 거래, SELL은 마지막 거래
  const trade = tradeType === 'BUY' 
    ? filteredTrades[0] 
    : filteredTrades[filteredTrades.length - 1];
  
  return {
    brokerDate: trade.brokerDate,
    brokerTime: trade.brokerTime
  };
}