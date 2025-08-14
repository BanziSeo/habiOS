import type { StateCreator } from 'zustand';
import type { MenuShortcut, TimeframeShortcut, SettingsStore } from '../types';
import { defaultChartSettings, defaultGeneralSettings } from '../defaults';

export interface ShortcutSlice {
  // 타임프레임 단축키 관리
  setTimeframeShortcut: (key: string, timeframe: string | null) => void;
  removeTimeframeShortcut: (key: string) => void;
  getTimeframeByShortcut: (key: string) => string | undefined;
  
  // 차트 단축키 관리
  setChartShortcut: (action: string, key: string) => void;
  resetChartShortcut: (action: string) => void;
  resetAllChartShortcuts: () => void;
  
  // 메뉴 단축키 관리
  setMenuShortcut: (menu: string, key: string) => void;
  removeMenuShortcut: (menu: string) => void;
  getMenuByShortcut: (key: string) => MenuShortcut | undefined;
  resetMenuShortcuts: () => void;
}

export const createShortcutSlice: StateCreator<
  SettingsStore,
  [],
  [],
  ShortcutSlice
> = (set, get) => ({
  setTimeframeShortcut: (key, timeframe) =>
    set((state) => {
      const shortcuts = state.chartSettings.timeframeShortcuts || [];
      const existingIndex = shortcuts.findIndex(s => s.key === key);
      
      let newShortcuts;
      if (timeframe === null) {
        // 단축키 제거
        newShortcuts = shortcuts.filter(s => s.key !== key);
      } else {
        // 동일한 타임프레임이 다른 키에 할당되어 있으면 제거
        const filteredShortcuts = shortcuts.filter(s => s.timeframe !== timeframe);
        
        if (existingIndex >= 0) {
          // 기존 키 업데이트
          newShortcuts = [...filteredShortcuts];
          newShortcuts.splice(existingIndex, 0, { key, timeframe });
        } else {
          // 새 키 추가
          newShortcuts = [...filteredShortcuts, { key, timeframe }];
        }
      }
      
      return {
        chartSettings: {
          ...state.chartSettings,
          timeframeShortcuts: newShortcuts,
        },
      };
    }),
    
  removeTimeframeShortcut: (key) =>
    set((state) => ({
      chartSettings: {
        ...state.chartSettings,
        timeframeShortcuts: (state.chartSettings.timeframeShortcuts || []).filter(
          s => s.key !== key
        ),
      },
    })),
    
  getTimeframeByShortcut: (key: string): string | undefined => {
    const state = get();
    const shortcut = state.chartSettings.timeframeShortcuts?.find((s: TimeframeShortcut) => s.key === key);
    return shortcut?.timeframe;
  },
  
  // 차트 단축키 관련 액션
  setChartShortcut: (action, key) =>
    set((state) => ({
      chartSettings: {
        ...state.chartSettings,
        chartShortcuts: {
          ...state.chartSettings.chartShortcuts,
          [action]: key,
        },
      },
      hasUnsavedChanges: true,
    })),
    
  resetChartShortcut: (action) =>
    set((state) => ({
      chartSettings: {
        ...state.chartSettings,
        chartShortcuts: {
          ...state.chartSettings.chartShortcuts,
          [action]: defaultChartSettings.chartShortcuts?.[action] || '',
        },
      },
      hasUnsavedChanges: true,
    })),
    
  resetAllChartShortcuts: () =>
    set((state) => ({
      chartSettings: {
        ...state.chartSettings,
        chartShortcuts: defaultChartSettings.chartShortcuts,
      },
      hasUnsavedChanges: true,
    })),
    
  // 메뉴 단축키 관련 액션
  setMenuShortcut: (menu, key) =>
    set((state) => {
      const shortcuts = state.generalSettings.menuShortcuts || [];
      const updatedShortcuts = shortcuts.map(s => 
        s.menu === menu ? { ...s, key } : s
      );
      
      return {
        generalSettings: {
          ...state.generalSettings,
          menuShortcuts: updatedShortcuts,
        },
        hasUnsavedChanges: true,
      };
    }),
    
  removeMenuShortcut: (menu) =>
    set((state) => {
      const shortcuts = state.generalSettings.menuShortcuts || [];
      const updatedShortcuts = shortcuts.map(s => 
        s.menu === menu ? { ...s, key: '' } : s
      );
      
      return {
        generalSettings: {
          ...state.generalSettings,
          menuShortcuts: updatedShortcuts,
        },
        hasUnsavedChanges: true,
      };
    }),
    
  getMenuByShortcut: (key) => {
    const state = get();
    return state.generalSettings.menuShortcuts?.find(s => s.key === key);
  },
    
  resetMenuShortcuts: () =>
    set((state) => ({
      generalSettings: {
        ...state.generalSettings,
        menuShortcuts: defaultGeneralSettings.menuShortcuts,
      },
      hasUnsavedChanges: true,
    })),
});