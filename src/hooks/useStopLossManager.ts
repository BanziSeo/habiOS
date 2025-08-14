import { useState, useCallback, useMemo } from 'react';
import { Decimal } from 'decimal.js';
import type { Position, StopLoss } from '../types';
import { useTradingStore } from '../stores/tradingStore';
import { useMetricsStore } from '../stores/metricsStore';
import { useTranslation } from 'react-i18next';

export interface StopLossItem {
  id: string;
  price: number | undefined;
  quantity: number;
  percentage: number;
  inputMode?: 'percentage' | 'quantity'; // 사용자가 입력한 방식
}

interface UseStopLossManagerProps {
  position: Position;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

interface UseStopLossManagerReturn {
  stopLosses: StopLossItem[];
  loading: boolean;
  
  // CRUD operations
  addStopLoss: () => void;
  removeStopLoss: (id: string) => void;
  updateStopLoss: (id: string, field: 'price' | 'percentage' | 'quantity', value: number | undefined) => void;
  
  // Save operations
  saveStopLosses: (setAsInitialR?: boolean) => Promise<void>;
  
  // Risk calculations
  previewRisk: { amount: number; percent: number };
  validateStopLosses: () => { isValid: boolean; errors: string[] };
  
  // Utilities
  setStopLosses: (stopLosses: StopLossItem[]) => void;
  initializeFromPosition: () => void;
}

/**
 * 스탑로스 관리를 위한 커스텀 훅
 * StopLossModal과 StopLossEditPopover에서 공통으로 사용
 */
export function useStopLossManager({
  position,
  onSaveSuccess,
  onSaveError
}: UseStopLossManagerProps): UseStopLossManagerReturn {
  const { t } = useTranslation();
  const { updateStopLosses } = useTradingStore();
  const { calculateTotalRisk } = useMetricsStore();
  
  const [stopLosses, setStopLosses] = useState<StopLossItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 포지션의 기존 스탑로스로 초기화
  const initializeFromPosition = useCallback(() => {
    const activeStopLosses = position.stopLosses?.filter(sl => sl.isActive) || [];
    
    if (activeStopLosses.length > 0) {
      const items = activeStopLosses.map(sl => ({
        id: sl.id,
        price: sl.stopPrice.toNumber(),
        quantity: sl.stopQuantity,
        percentage: sl.stopPercentage || (sl.stopQuantity / position.totalShares) * 100,
        inputMode: sl.inputMode || 'percentage' as const
      }));
      setStopLosses(items);
    } else {
      // 스탑로스가 없으면 100% 항목 하나 추가
      setStopLosses([{
        id: Date.now().toString(),
        price: undefined,
        quantity: position.totalShares,
        percentage: 100,
        inputMode: 'percentage' as const
      }]);
    }
  }, [position]);

  // 스탑로스 추가
  const addStopLoss = useCallback(() => {
    // 현재 스탑로스들의 총 비율 계산
    const currentTotalPercentage = stopLosses.reduce((sum, sl) => sum + sl.percentage, 0);
    const remainingPercentage = Math.max(0, 100 - currentTotalPercentage);
    
    const newStopLoss: StopLossItem = {
      id: Date.now().toString(),
      price: undefined,
      quantity: Math.round(position.totalShares * (remainingPercentage / 100)),
      percentage: remainingPercentage,
      inputMode: 'percentage' as const // 새로 추가할 때는 기본값 percentage
    };
    setStopLosses(prev => [...prev, newStopLoss]);
  }, [stopLosses, position.totalShares]);

  // 스탑로스 제거
  const removeStopLoss = useCallback((id: string) => {
    setStopLosses(prev => prev.filter(sl => sl.id !== id));
  }, []);

  // 스탑로스 업데이트
  const updateStopLoss = useCallback((id: string, field: 'price' | 'percentage' | 'quantity', value: number | undefined) => {
    setStopLosses(prev => prev.map(sl => {
      if (sl.id === id) {
        if (field === 'price') {
          return { ...sl, price: value };
        } else if (field === 'percentage') {
          const quantity = Math.round(position.totalShares * ((value || 0) / 100));
          return { ...sl, percentage: value || 0, quantity, inputMode: 'percentage' as const };
        } else {
          const percentage = position.totalShares > 0 ? ((value || 0) / position.totalShares) * 100 : 0;
          return { ...sl, quantity: value || 0, percentage, inputMode: 'quantity' as const };
        }
      }
      return sl;
    }));
  }, [position.totalShares]);

  // 리스크 미리보기 계산
  const previewRisk = useMemo(() => {
    return calculateTotalRisk(
      position.avgBuyPrice,
      stopLosses
        .filter(sl => sl.price !== undefined && sl.price > 0 && sl.quantity > 0)
        .map(sl => ({
          price: sl.price!,
          quantity: sl.quantity
        }))
    );
  }, [position.avgBuyPrice, stopLosses, calculateTotalRisk]);

  // 스탑로스 검증
  const validateStopLosses = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // 비중 합계 검증
    const totalPercentage = stopLosses.reduce((sum, sl) => sum + sl.percentage, 0);
    if (stopLosses.length > 0 && Math.abs(totalPercentage - 100) > 0.01) {
      errors.push(t('messages:stopLoss.sumMustBe100'));
    }
    
    // 가격 입력 검증
    for (const sl of stopLosses) {
      if (sl.percentage > 0 && (sl.price === undefined || sl.price === null || sl.price <= 0)) {
        errors.push(t('messages:stopLoss.enterPrice'));
        break;
      }
    }
    
    // 평균단가 이상 스탑로스도 허용 (익절 주문 가능)
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [stopLosses, position.avgBuyPrice]);

  // 스탑로스 저장
  const saveStopLosses = useCallback(async (setAsInitialR: boolean = false) => {
    setLoading(true);
    try {
      // 검증
      const validation = validateStopLosses();
      if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'));
      }
      
      // 유효한 스탑로스만 필터링
      const validStopLosses = stopLosses.filter(sl => 
        sl.price !== undefined && sl.price > 0 && sl.percentage > 0
      );
      
      // StopLoss 타입으로 변환
      const stopLossData: StopLoss[] = validStopLosses.map((sl, index) => ({
        id: position.stopLosses?.[index]?.id || `new-${index}`,
        positionId: position.id,
        stopPrice: new Decimal(sl.price!),
        stopQuantity: sl.quantity,
        stopPercentage: sl.percentage,
        inputMode: sl.inputMode || 'percentage',
        isActive: true,
        createdAt: position.stopLosses?.[index]?.createdAt || new Date()
      }));
      
      await updateStopLosses(position.id, stopLossData, setAsInitialR);
      
      onSaveSuccess?.();
    } catch (error) {
      onSaveError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stopLosses, position, validateStopLosses, updateStopLosses, onSaveSuccess, onSaveError]);

  return {
    stopLosses,
    loading,
    addStopLoss,
    removeStopLoss,
    updateStopLoss,
    saveStopLosses,
    previewRisk,
    validateStopLosses,
    setStopLosses,
    initializeFromPosition
  };
}