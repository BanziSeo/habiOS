import { useState } from 'react';
import { App } from 'antd';
import type { Position } from '../../../../types';
import type { PositionMetrics } from '../../../../stores/metricsStore';
import { useTradingStore } from '../../../../stores/tradingStore';
import { useMetricsStore } from '../../../../stores/metricsStore';

/**
 * Initial R 편집 로직 관리 훅
 */
export const useInitialREdit = (localPosition: Position, metrics: PositionMetrics) => {
  const { message } = App.useApp();
  const [isEditingInitialR, setIsEditingInitialR] = useState(false);
  const [editingInitialR, setEditingInitialR] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Initial R 편집 시작
  const handleEditInitialR = () => {
    setIsEditingInitialR(true);
    setEditingInitialR(localPosition.maxRiskAmount?.toNumber() || metrics.initialR?.toNumber() || 0);
  };

  // Initial R 저장
  const handleSaveInitialR = async () => {
    if (editingInitialR < 0) {
      message.error('Initial R은 0보다 크거나 같아야 합니다');
      return;
    }

    setLoading(true);
    try {
      await window.electronAPI.positions.updateInitialR(localPosition.id, editingInitialR);

      // DB에서 업데이트된 포지션을 다시 로드하여 store 업데이트
      await useTradingStore.getState().loadPositions();
      
      // 업데이트된 포지션 가져오기
      const updatedPosition = useTradingStore.getState().positions.find(p => p.id === localPosition.id);
      if (updatedPosition) {
        // 캐시를 먼저 제거하고 메트릭 재계산
        const metricsStore = useMetricsStore.getState();
        metricsStore.positionMetricsCache.delete(localPosition.id);
        metricsStore.calculateAndCachePositionMetrics(updatedPosition);
      }

      setIsEditingInitialR(false);
      message.success('Initial R이 업데이트되었습니다');
    } catch (error) {
      console.error('Failed to update Initial R:', error);
      message.error('Initial R 업데이트에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // Initial R 편집 취소
  const handleCancelInitialR = () => {
    setIsEditingInitialR(false);
    setEditingInitialR(0);
  };

  // 아이템 편집 핸들러
  const handleEditItem = (key: string) => {
    if (key === 'initialR') {
      handleEditInitialR();
    }
  };

  return {
    isEditingInitialR,
    editingInitialR,
    setEditingInitialR,
    loading,
    handleEditItem,
    handleSaveInitialR,
    handleCancelInitialR
  };
};