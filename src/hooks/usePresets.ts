import { useState, useEffect } from 'react';
import type { LayoutItem } from '../pages/Journal1/types';

export interface Preset {
  id: string;
  name: string;
  createdAt: number;
  isDefault?: boolean;
  layoutData: {
    widgetLayouts: LayoutItem[];
    hiddenWidgets: string[];
    hiddenMetricCards: string[];
  };
}

interface UsePresetsProps {
  journalId: 'journal1' | 'journal2';
}

// 기본 템플릿 없음 - 사용자가 직접 저장
const DEFAULT_TEMPLATES: Preset[] = [];

export const usePresets = ({ journalId }: UsePresetsProps) => {
  const storageKey = `${journalId}_presets`;
  const [presets, setPresets] = useState<Preset[]>([]);

  // localStorage에서 프리셋 불러오기
  useEffect(() => {
    const loadPresets = () => {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPresets(parsed);
        } catch (e) {
          console.error('Failed to load presets:', e);
          setPresets([]);
        }
      }
    };

    loadPresets();

    // storage 이벤트 리스너 (다른 탭에서 변경 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        loadPresets();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  // 프리셋 저장
  const savePreset = (name: string, layoutData: Preset['layoutData']) => {
    const newPreset: Preset = {
      id: `preset-${Date.now()}`,
      name,
      createdAt: Date.now(),
      layoutData
    };

    const updatedPresets = [...presets, newPreset];
    
    // 최대 10개 제한
    if (updatedPresets.length > 10) {
      updatedPresets.shift(); // 가장 오래된 것 제거
    }

    setPresets(updatedPresets);
    localStorage.setItem(storageKey, JSON.stringify(updatedPresets));
  };

  // 프리셋 삭제
  const deletePreset = (presetId: string) => {
    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    localStorage.setItem(storageKey, JSON.stringify(updatedPresets));
  };

  // 프리셋 불러오기 (적용)
  const loadPreset = (preset: Preset) => {
    // 이 함수는 컴포넌트에서 구현해야 함 (상태 업데이트)
    return preset.layoutData;
  };

  // 모든 프리셋 (기본 템플릿 + 사용자 저장)
  const allPresets = [...DEFAULT_TEMPLATES, ...presets];

  return {
    presets: allPresets,
    userPresets: presets,
    defaultTemplates: DEFAULT_TEMPLATES,
    savePreset,
    deletePreset,
    loadPreset
  };
};