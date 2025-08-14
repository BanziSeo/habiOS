import { useState, useEffect } from 'react';
import type { Position } from '../../../../types';
import { useTradingStore } from '../../../../stores/tradingStore';

/**
 * Position 동기화 및 Zustand store 구독 훅
 */
export const usePositionSync = (position: Position) => {
  const [localPosition, setLocalPosition] = useState<Position>(position);

  // Zustand store 구독으로 포지션 변경 감지
  useEffect(() => {
    // Zustand v4 subscribe 패턴 - 전체 state를 받음
    const unsubscribe = useTradingStore.subscribe((state) => {
      const updatedPosition = state.positions.find(p => p.id === position.id);
      if (updatedPosition) {
        setLocalPosition(updatedPosition);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [position.id]);

  // props의 position이 변경되면 localPosition도 업데이트
  useEffect(() => {
    setLocalPosition(position);
  }, [position]);

  return localPosition;
};