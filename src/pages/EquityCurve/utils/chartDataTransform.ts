import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';
import type { EquityCurve } from '../../../types';
import type { ChartData, MovingAverage } from '../types';
import { DATE_FORMAT, INITIAL_PORTFOLIO_VALUE } from '../constants';
import { calculateMovingAverage } from './movingAverageCalculator';

/**
 * Equity Curve 데이터를 차트 데이터로 변환
 */
export function transformToChartData(
  equityCurveData: EquityCurve[],
  showPercentage: boolean
): ChartData[] {
  if (equityCurveData.length === 0) {
    return [];
  }

  const initialValue = new Decimal(equityCurveData[0].total_value || INITIAL_PORTFOLIO_VALUE);
  
  return equityCurveData.map((item) => {
    const currentValue = new Decimal(item.total_value);
    
    // 금액 또는 퍼센트 계산
    const value = showPercentage 
      ? (initialValue.isZero() 
          ? 100 
          : currentValue.dividedBy(initialValue).times(100).toNumber())
      : currentValue.toNumber();
    
    return {
      date: item.date,
      portfolio: value,
      displayDate: dayjs(item.date).format(DATE_FORMAT.DISPLAY)
    };
  });
}

/**
 * 차트 데이터에 이동평균선 추가
 */
export function addMovingAveragesToChartData(
  chartData: ChartData[],
  movingAverages: MovingAverage[]
): ChartData[] {
  const portfolioValues = chartData.map(item => item.portfolio);
  
  return chartData.map((item, index) => {
    const result: ChartData = { ...item };
    
    // 각 이동평균선 계산 및 추가
    movingAverages.forEach(ma => {
      if (ma.enabled && ma.period <= portfolioValues.length) {
        const maValues = calculateMovingAverage(portfolioValues, ma.period, ma.type);
        const maValue = maValues[index];
        if (maValue !== null) {
          result[ma.id] = maValue;
        }
      }
    });
    
    return result;
  });
}

/**
 * 날짜 범위로 차트 데이터 필터링
 */
export function filterChartDataByDateRange(
  chartData: ChartData[],
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null
): ChartData[] {
  if (!dateRange) {
    return chartData;
  }

  return chartData.filter(item => {
    const date = dayjs(item.date);
    return date.isAfter(dateRange[0]) && date.isBefore(dateRange[1]);
  });
}

/**
 * 퍼센트를 포맷팅
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}