import { useEffect } from 'react';
import { useTradingStore } from '../../../stores/tradingStore';
import { useMetricsStore } from '../../../stores/metricsStore';
import { getLatestTotalAssets } from '../utils/equityCalculations';

/**
 * Journal 페이지의 데이터 로딩 및 상태 관리
 */
export const useJournalData = () => {
  const { 
    positions, 
    isLoading, 
    loadPositions, 
    loadTrades, 
    activeAccount, 
    loadEquityCurve 
  } = useTradingStore();
  
  const { totalAssets, updateTotalAssets } = useMetricsStore();
  
  // 데이터 로드
  useEffect(() => {
    if (activeAccount) {
      // 기본 데이터 로드
      loadPositions(activeAccount.id);
      loadTrades(activeAccount.id);
      loadEquityCurve(activeAccount.id);
      
      // Equity Curve 데이터로 총 자산 설정
      window.electronAPI.equityCurve.getByAccount(activeAccount.id)
        .then((equityData: Array<{ id: number; account_id: string; date: string; total_value: string; cash_value?: string; stock_value?: string; daily_pnl: string }>) => {
          const latestTotal = getLatestTotalAssets(equityData);
          if (latestTotal) {
            // metricsStore를 통해 총자산 업데이트
            updateTotalAssets(latestTotal.toNumber());
          }
        })
        .catch((err: Error) => console.error('Failed to fetch equity data:', err));
    }
  }, [activeAccount, loadPositions, loadTrades, loadEquityCurve, updateTotalAssets]);
  
  return {
    positions,
    isLoading,
    activeAccount,
    totalAssets
  };
};