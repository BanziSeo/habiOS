import { useTradingStore } from '../../../../stores/tradingStore';
import { useMetricsStore } from '../../../../stores/metricsStore';

export const formatPnL = (
  pnl: number, 
  mode: 'currency' | 'percentage' = 'currency',
  accountCurrency?: 'USD' | 'KRW'
): string => {
  if (mode === 'percentage') {
    // 총자산 대비 퍼센트로 표시
    const { totalAssets } = useMetricsStore.getState();
    const { activeAccount } = useTradingStore.getState();
    
    // 현재 총자산: metricsStore의 totalAssets 사용 (없으면 초기 자본 사용)
    const currentBalance = totalAssets || activeAccount?.initialBalance || 0;
    
    if (currentBalance && currentBalance !== 0) {
      const percentage = (pnl / currentBalance) * 100;
      return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
    }
    return `${pnl >= 0 ? '+' : ''}0.00%`;
  }
  
  // 통화로 표시
  const currency = accountCurrency || useTradingStore.getState().activeAccount?.currency || 'USD';
  const symbol = currency === 'KRW' ? '₩' : '$';
  const formatted = Math.abs(pnl).toLocaleString(undefined, {
    minimumFractionDigits: currency === 'KRW' ? 0 : 2,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
  });
  
  if (pnl < 0) {
    return `-${symbol}${formatted}`;
  } else if (pnl > 0) {
    return `+${symbol}${formatted}`;
  } else {
    return `${symbol}${formatted}`;
  }
};