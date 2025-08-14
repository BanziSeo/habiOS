import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsStore } from './types';
import { defaultChartSettings, defaultGeneralSettings } from './defaults';
import { createChartSlice } from './slices/chartSlice';
import { createMovingAverageSlice } from './slices/movingAverageSlice';
import { createTimeframeSlice } from './slices/timeframeSlice';
import { createShortcutSlice } from './slices/shortcutSlice';
import { createSetupSlice } from './slices/setupSlice';

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get, store) => ({
      // 상태
      chartSettings: defaultChartSettings,
      generalSettings: defaultGeneralSettings,
      hasUnsavedChanges: false,
      
      // 모든 슬라이스 통합
      ...createChartSlice(set, get, store),
      ...createMovingAverageSlice(set, get, store),
      ...createTimeframeSlice(set, get, store),
      ...createShortcutSlice(set, get, store),
      ...createSetupSlice(set, get, store),
      
      // 나머지 메서드들
      updateGeneralSettings: (settings) =>
        set((state) => ({
          generalSettings: { ...state.generalSettings, ...settings },
          hasUnsavedChanges: true,
        })),
        
      saveChanges: () =>
        set(() => ({
          hasUnsavedChanges: false,
        })),
        
      cancelChanges: () => {
        // localStorage에서 저장된 설정 가져오기
        const savedData = localStorage.getItem('trading-journal-settings');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          const state = parsed.state;
          set(() => ({
            chartSettings: state.chartSettings || defaultChartSettings,
            generalSettings: state.generalSettings || defaultGeneralSettings,
            hasUnsavedChanges: false,
          }));
        } else {
          // 저장된 데이터가 없으면 기본값으로 초기화
          set(() => ({
            chartSettings: defaultChartSettings,
            generalSettings: defaultGeneralSettings,
            hasUnsavedChanges: false,
          }));
        }
      },
      
      resetToDefaults: () => {
        set(() => ({
          chartSettings: defaultChartSettings,
          generalSettings: defaultGeneralSettings,
          hasUnsavedChanges: false,
        }));
      },
    }),
    {
      name: 'trading-journal-settings',
      version: 2,
      partialize: (state) => ({ 
        chartSettings: state.chartSettings,
        generalSettings: state.generalSettings 
      }),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<SettingsStore>;  // Type-safe migration
        // 버전 0에서 1로 마이그레이션 (chartMargins 추가)
        if (version === 0) {
          return {
            ...state,
            chartSettings: {
              ...state.chartSettings,
              chartMargins: state.chartSettings?.chartMargins || defaultChartSettings.chartMargins,
              panelDivider: state.chartSettings?.panelDivider || defaultChartSettings.panelDivider,
            },
          };
        }
        
        // 버전 1에서 2로 마이그레이션 (timeframeMA 추가)
        if (version <= 1) {
          return {
            ...state,
            chartSettings: {
              ...state.chartSettings,
              timeframeMA: state.chartSettings?.timeframeMA || {},
              timeframeShortcuts: state.chartSettings?.timeframeShortcuts || defaultChartSettings.timeframeShortcuts,
            },
          };
        }
        
        return state;
      },
    }
  )
);