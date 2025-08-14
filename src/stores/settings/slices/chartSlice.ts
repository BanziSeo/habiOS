import type { StateCreator } from 'zustand';
import type { ChartSettings, SettingsStore } from '../types';

export interface ChartSlice {
  updateChartSettings: (settings: Partial<ChartSettings>) => void;
}

export const createChartSlice: StateCreator<
  SettingsStore,
  [],
  [],
  ChartSlice
> = (set) => ({
  updateChartSettings: (settings) =>
    set((state) => ({
      chartSettings: { ...state.chartSettings, ...settings },
      hasUnsavedChanges: true,
    })),
});