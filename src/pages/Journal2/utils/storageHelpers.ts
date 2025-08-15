import { STORAGE_KEYS } from '../constants';
import type { LayoutItem } from '../types';

/**
 * localStorage에서 위젯 레이아웃 불러오기
 */
export const loadWidgetLayouts = (): LayoutItem[] | null => {
  const saved = localStorage.getItem(STORAGE_KEYS.WIDGET_LAYOUTS);
  if (!saved) return null;
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load saved widget layouts:', e);
    return null;
  }
};

/**
 * localStorage에 위젯 레이아웃 저장
 */
export const saveWidgetLayouts = (layouts: LayoutItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.WIDGET_LAYOUTS, JSON.stringify(layouts));
};

/**
 * localStorage에서 숨겨진 위젯 목록 불러오기
 */
export const loadHiddenWidgets = (): string[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.HIDDEN_WIDGETS);
  // 기본적으로 표시: metrics-1, metrics-table-1, position-table, today-trades
  // 나머지는 모두 숨김
  const defaultHidden = [
    'daily-notes',
    'daily-pnl',
    'daily-risk-limit',
    'metrics-2',
    'metrics-3',
    'metrics-table-2',
    'metrics-table-3'
  ];
  
  if (!saved) return defaultHidden;
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load saved hidden widgets:', e);
    return defaultHidden;
  }
};

/**
 * localStorage에 숨겨진 위젯 목록 저장
 */
export const saveHiddenWidgets = (hiddenWidgets: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.HIDDEN_WIDGETS, JSON.stringify(hiddenWidgets));
};

/**
 * localStorage에서 숨겨진 메트릭 카드 목록 불러오기
 */
export const loadHiddenMetricCards = (): string[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.HIDDEN_CARDS);
  if (!saved) return [];
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load saved hidden cards:', e);
    return [];
  }
};

/**
 * localStorage에 숨겨진 메트릭 카드 목록 저장
 */
export const saveHiddenMetricCards = (hiddenCards: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.HIDDEN_CARDS, JSON.stringify(hiddenCards));
};