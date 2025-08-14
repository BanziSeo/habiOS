import type { StateCreator } from 'zustand';
import type { MovingAverage, SettingsStore } from '../types';

export interface MovingAverageSlice {
  // 가격 이동평균선 관리
  addPriceMA: (ma: Partial<MovingAverage>) => void;
  updatePriceMA: (id: string, ma: Partial<MovingAverage>) => void;
  removePriceMA: (id: string) => void;
  
  // 볼륨 이동평균선 관리
  addVolumeMA: (ma: Partial<MovingAverage>) => void;
  updateVolumeMA: (id: string, ma: Partial<MovingAverage>) => void;
  removeVolumeMA: (id: string) => void;
}

export const createMovingAverageSlice: StateCreator<
  SettingsStore,
  [],
  [],
  MovingAverageSlice
> = (set) => ({
  addPriceMA: (ma) =>
    set((state) => {
      const newMA: MovingAverage = {
        id: ma.id || `ma_${Date.now()}`,
        period: ma.period || 20,
        color: ma.color || '#ffffff',
        width: ma.width || 1,
        enabled: ma.enabled ?? true,
        type: ma.type || 'SMA'
      };
      return {
        chartSettings: {
          ...state.chartSettings,
          priceMovingAverages: [...state.chartSettings.priceMovingAverages, newMA],
        },
        hasUnsavedChanges: true,
      };
    }),
    
  updatePriceMA: (id, ma) =>
    set((state) => ({
      chartSettings: {
        ...state.chartSettings,
        priceMovingAverages: state.chartSettings.priceMovingAverages.map((item) =>
          item.id === id ? { ...item, ...ma } : item
        ),
      },
      hasUnsavedChanges: true,
    })),
    
  removePriceMA: (id) =>
    set((state) => ({
      chartSettings: {
        ...state.chartSettings,
        priceMovingAverages: state.chartSettings.priceMovingAverages.filter(
          (item) => item.id !== id
        ),
      },
      hasUnsavedChanges: true,
    })),
    
  addVolumeMA: (ma) =>
    set((state) => {
      const newMA: MovingAverage = {
        id: ma.id || `vma_${Date.now()}`,
        period: ma.period || 20,
        color: ma.color || '#ffeb3b',
        width: ma.width || 1,
        enabled: ma.enabled ?? true,
        type: ma.type || 'SMA'
      };
      return {
        chartSettings: {
          ...state.chartSettings,
          volumeMovingAverages: [...state.chartSettings.volumeMovingAverages, newMA],
        },
      };
    }),
    
  updateVolumeMA: (id, ma) =>
    set((state) => ({
      chartSettings: {
        ...state.chartSettings,
        volumeMovingAverages: state.chartSettings.volumeMovingAverages.map((item) =>
          item.id === id ? { ...item, ...ma } : item
        ),
      },
    })),
    
  removeVolumeMA: (id) =>
    set((state) => ({
      chartSettings: {
        ...state.chartSettings,
        volumeMovingAverages: state.chartSettings.volumeMovingAverages.filter(
          (item) => item.id !== id
        ),
      },
    })),
});