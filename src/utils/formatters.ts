import { Decimal } from 'decimal.js';

// 통화 포맷팅
export function formatCurrency(value: Decimal | number | string, currency: 'USD' | 'KRW' = 'USD'): string {
  const numValue = value instanceof Decimal ? value.toNumber() : Number(value);
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  } else {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  }
}

// 퍼센트 포맷팅
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// 숫자 포맷팅 (천 단위 구분)
export function formatNumber(value: number | Decimal, decimals: number = 0): string {
  const numValue = value instanceof Decimal ? value.toNumber() : value;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
}

// 날짜 포맷팅
export function formatDate(date: Date | string, format: 'date' | 'datetime' = 'date'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'datetime') {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } else {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  }
}

// 날짜시간 포맷팅 (별칭)
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'datetime');
}

// R-Multiple 포맷팅
export function formatRMultiple(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}R`;
}