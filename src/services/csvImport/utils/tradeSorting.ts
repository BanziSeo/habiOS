import type { Trade } from '../../../types';
import { AFTERMARKET_END_HOUR } from '../constants';

/**
 * 거래 정렬을 위한 시간 계산
 * 0~8시 거래는 실제로는 애프터마켓이므로 정렬 시 +24시간 처리
 */
export function getSortTime(date: Date): number {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  
  // 0~7시는 애프터마켓으로 간주하여 +24시간
  const sortHour = hour < AFTERMARKET_END_HOUR ? hour + 24 : hour;
  
  // HHMMSS 형식의 숫자로 반환 (예: 25시 30분 15초 = 253015)
  return sortHour * 10000 + minute * 100 + second;
}

/**
 * 거래를 시간순으로 정렬
 * 영웅문 시간이 이미 실제 시간으로 변환되었으므로 단순 시간순 정렬
 */
export function sortTradesByTime(trades: Trade[]): Trade[] {
  return [...trades].sort((a, b) => {
    // Date 객체를 직접 비교 (밀리초 단위로 정확한 비교)
    return a.tradeDate.getTime() - b.tradeDate.getTime();
  });
}