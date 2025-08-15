import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import type { EquityStats } from '../types';
import type { PeriodFilter } from '../../../components/Widgets/MetricsWidget';
import { calculateEquityStats } from '../utils/equityCalculations';

/**
 * Equity 통계 계산 및 관리
 */
export const useEquityStats = (
  activeAccountId: string | undefined,
  periodFilter: PeriodFilter = 'all',
  dateRange?: [Date | null, Date | null]
) => {
  const [equityStats, setEquityStats] = useState<EquityStats>({
    currentValue: 0,
    initialValue: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    maxDrawdown: 0,
    maxDrawdownPercent: 0,
    tradingDays: 0
  });
  
  useEffect(() => {
    if (!activeAccountId) return;
    
    window.electronAPI.equityCurve.getByAccount(activeAccountId)
      .then((equityData: Array<{ id: number; account_id: string; date: string; total_value: string; cash_value?: string; stock_value?: string; daily_pnl: string }>) => {
        if (equityData.length > 0) {
        }
        
        // 기간별 필터링
        let filteredData = [...equityData];
        const now = dayjs();
        
        switch (periodFilter) {
          case '2weeks':
            const twoWeeksAgo = now.subtract(2, 'week').format('YYYY-MM-DD');
            filteredData = equityData.filter(item => item.date >= twoWeeksAgo);
            break;
          case '1month':
            const oneMonthAgo = now.subtract(1, 'month').format('YYYY-MM-DD');
            filteredData = equityData.filter(item => item.date >= oneMonthAgo);
            break;
          case 'custom':
            if (dateRange && dateRange[0] && dateRange[1]) {
              const startDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
              const endDate = dayjs(dateRange[1]).format('YYYY-MM-DD');
              filteredData = equityData.filter(item => 
                item.date >= startDate && item.date <= endDate
              );
            }
            break;
          case 'all':
          default:
            // 전체 기간은 필터링 없음
            break;
        }
        
        // 필터링된 데이터가 비어있으면 최소한 마지막 데이터는 포함
        if (filteredData.length === 0 && equityData.length > 0) {
          filteredData = [equityData[equityData.length - 1]];
        }
        
        const stats = calculateEquityStats(filteredData);
        setEquityStats(stats);
      })
      .catch((err: Error) => console.error('Failed to calculate equity stats:', err));
  }, [activeAccountId, periodFilter, dateRange]);
  
  return equityStats;
};