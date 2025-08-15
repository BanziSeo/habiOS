import { useState, useEffect } from 'react';
import type { EquityCurve } from '../../../types';
import { useTradingStore } from '../../../stores/tradingStore';

/**
 * Equity Curve 데이터 로딩 훅
 */
export function useEquityCurveData() {
  const { activeAccount } = useTradingStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EquityCurve[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    if (!activeAccount) {
      setData([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const equityCurveData = await window.electronAPI.equityCurve.getByAccount(activeAccount.id);
      setData(equityCurveData);
    } catch (err) {
      console.error('Failed to load equity curve:', err);
      setError(err instanceof Error ? err : new Error('Failed to load equity curve'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeAccount]);

  return {
    data,
    loading,
    error,
    reload: loadData
  };
}