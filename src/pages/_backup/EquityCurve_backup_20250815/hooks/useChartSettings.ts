import { useState, useEffect } from 'react';
import type { ChartSettings } from '../types';
import { DEFAULT_CHART_SETTINGS } from '../constants';

const STORAGE_KEY = 'equityCurve_chartSettings';

/**
 * 차트 설정 관리 훅 (localStorage 연동)
 */
export function useChartSettings() {
  const [settings, setSettings] = useState<ChartSettings>(() => {
    // localStorage에서 설정 불러오기
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load chart settings:', error);
    }
    return DEFAULT_CHART_SETTINGS;
  });

  // 설정 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save chart settings:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<ChartSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_CHART_SETTINGS);
  };

  return {
    settings,
    updateSettings,
    resetSettings
  };
}