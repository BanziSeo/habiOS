import type { StateCreator } from 'zustand';
import type { SettingsStore } from '../types';

export interface SetupSlice {
  // 셋업 카테고리 관리
  addSetupCategory: (category: string) => void;
  removeSetupCategory: (category: string) => void;
  updateSetupCategories: (categories: string[]) => void;
  
  // 편집 모드
  toggleEditMode: () => void;
  setEditMode: (enabled: boolean) => void;
}

export const createSetupSlice: StateCreator<
  SettingsStore,
  [],
  [],
  SetupSlice
> = (set) => ({
  // 셋업 카테고리 관련 액션
  addSetupCategory: (category) =>
    set((state) => ({
      generalSettings: {
        ...state.generalSettings,
        setupCategories: [...(state.generalSettings.setupCategories || []), category],
      },
      hasUnsavedChanges: true,
    })),
    
  removeSetupCategory: (category) =>
    set((state) => ({
      generalSettings: {
        ...state.generalSettings,
        setupCategories: (state.generalSettings.setupCategories || []).filter(c => c !== category),
      },
      hasUnsavedChanges: true,
    })),
    
  updateSetupCategories: (categories) =>
    set((state) => ({
      generalSettings: {
        ...state.generalSettings,
        setupCategories: categories,
      },
      hasUnsavedChanges: true,
    })),
    
  // 편집 모드 관련 액션
  toggleEditMode: () =>
    set((state) => ({
      generalSettings: {
        ...state.generalSettings,
        isEditMode: !state.generalSettings.isEditMode,
      },
    })),
    
  setEditMode: (enabled) =>
    set((state) => ({
      generalSettings: {
        ...state.generalSettings,
        isEditMode: enabled,
      },
    })),
});