import type { StateCreator } from 'zustand';
import type { MovingAverage, TimeframeMASettings, SettingsStore } from '../types';

export interface TimeframeSlice {
  // 타임프레임별 MA 설정
  setTimeframeMA: (timeframe: string, settings: TimeframeMASettings) => void;
  addTimeframePriceMA: (timeframe: string, ma: Partial<MovingAverage>) => void;
  updateTimeframePriceMA: (timeframe: string, id: string, ma: Partial<MovingAverage>) => void;
  removeTimeframePriceMA: (timeframe: string, id: string) => void;
  addTimeframeVolumeMA: (timeframe: string, ma: Partial<MovingAverage>) => void;
  updateTimeframeVolumeMA: (timeframe: string, id: string, ma: Partial<MovingAverage>) => void;
  removeTimeframeVolumeMA: (timeframe: string, id: string) => void;
  copyTimeframeSettings: (fromTimeframe: string, toTimeframe: string) => void;
}

export const createTimeframeSlice: StateCreator<
  SettingsStore,
  [],
  [],
  TimeframeSlice
> = (set) => ({
  setTimeframeMA: (timeframe, settings) =>
    set((state) => ({
      chartSettings: {
        ...state.chartSettings,
        timeframeMA: {
          ...state.chartSettings.timeframeMA,
          [timeframe]: settings,
        },
      },
    })),
    
  addTimeframePriceMA: (timeframe, ma) =>
    set((state) => {
      const currentSettings = state.chartSettings.timeframeMA?.[timeframe] || {
        priceMovingAverages: [],
        volumeMovingAverages: [],
      };
      const newMA: MovingAverage = {
        id: ma.id || `tf_ma_${Date.now()}`,
        period: ma.period || 20,
        color: ma.color || '#ffffff',
        width: ma.width || 1,
        enabled: ma.enabled ?? true,
        type: ma.type || 'SMA'
      };
      return {
        chartSettings: {
          ...state.chartSettings,
          timeframeMA: {
            ...state.chartSettings.timeframeMA,
            [timeframe]: {
              ...currentSettings,
              priceMovingAverages: [...currentSettings.priceMovingAverages, newMA],
            },
          },
        },
      };
    }),
    
  updateTimeframePriceMA: (timeframe, id, ma) =>
    set((state) => {
      const currentSettings = state.chartSettings.timeframeMA?.[timeframe];
      if (!currentSettings) return state;
      
      return {
        chartSettings: {
          ...state.chartSettings,
          timeframeMA: {
            ...state.chartSettings.timeframeMA,
            [timeframe]: {
              ...currentSettings,
              priceMovingAverages: currentSettings.priceMovingAverages.map((item) =>
                item.id === id ? { ...item, ...ma } : item
              ),
            },
          },
        },
      };
    }),
    
  removeTimeframePriceMA: (timeframe, id) =>
    set((state) => {
      const currentSettings = state.chartSettings.timeframeMA?.[timeframe];
      if (!currentSettings) return state;
      
      return {
        chartSettings: {
          ...state.chartSettings,
          timeframeMA: {
            ...state.chartSettings.timeframeMA,
            [timeframe]: {
              ...currentSettings,
              priceMovingAverages: currentSettings.priceMovingAverages.filter(
                (item) => item.id !== id
              ),
            },
          },
        },
      };
    }),
    
  addTimeframeVolumeMA: (timeframe, ma) =>
    set((state) => {
      const currentSettings = state.chartSettings.timeframeMA?.[timeframe] || {
        priceMovingAverages: [],
        volumeMovingAverages: [],
      };
      const newMA: MovingAverage = {
        id: ma.id || `tf_vma_${Date.now()}`,
        period: ma.period || 20,
        color: ma.color || '#ffeb3b',
        width: ma.width || 1,
        enabled: ma.enabled ?? true,
        type: ma.type || 'SMA'
      };
      return {
        chartSettings: {
          ...state.chartSettings,
          timeframeMA: {
            ...state.chartSettings.timeframeMA,
            [timeframe]: {
              ...currentSettings,
              volumeMovingAverages: [...currentSettings.volumeMovingAverages, newMA],
            },
          },
        },
      };
    }),
    
  updateTimeframeVolumeMA: (timeframe, id, ma) =>
    set((state) => {
      const currentSettings = state.chartSettings.timeframeMA?.[timeframe];
      if (!currentSettings) return state;
      
      return {
        chartSettings: {
          ...state.chartSettings,
          timeframeMA: {
            ...state.chartSettings.timeframeMA,
            [timeframe]: {
              ...currentSettings,
              volumeMovingAverages: currentSettings.volumeMovingAverages.map((item) =>
                item.id === id ? { ...item, ...ma } : item
              ),
            },
          },
        },
      };
    }),
    
  removeTimeframeVolumeMA: (timeframe, id) =>
    set((state) => {
      const currentSettings = state.chartSettings.timeframeMA?.[timeframe];
      if (!currentSettings) return state;
      
      return {
        chartSettings: {
          ...state.chartSettings,
          timeframeMA: {
            ...state.chartSettings.timeframeMA,
            [timeframe]: {
              ...currentSettings,
              volumeMovingAverages: currentSettings.volumeMovingAverages.filter(
                (item) => item.id !== id
              ),
            },
          },
        },
      };
    }),
    
  copyTimeframeSettings: (fromTimeframe, toTimeframe) =>
    set((state) => {
      const sourceSettings = state.chartSettings.timeframeMA?.[fromTimeframe];
      if (!sourceSettings) return state;
      
      return {
        chartSettings: {
          ...state.chartSettings,
          timeframeMA: {
            ...state.chartSettings.timeframeMA,
            [toTimeframe]: JSON.parse(JSON.stringify(sourceSettings)), // 깊은 복사
          },
        },
      };
    }),
});