import type { LayoutItem } from '../types';
import { COMPACT_LAYOUTS, DEFAULT_LAYOUTS } from '../constants';

/**
 * 반응형에 따른 기본 레이아웃 계산
 */
export const getResponsiveLayouts = (isCompact: boolean): LayoutItem[] => {
  return isCompact ? COMPACT_LAYOUTS : DEFAULT_LAYOUTS;
};

/**
 * 저장된 레이아웃과 기본 레이아웃을 병합
 */
export const mergeLayoutsWithSaved = (
  defaultLayouts: LayoutItem[],
  savedLayouts: LayoutItem[]
): LayoutItem[] => {
  return defaultLayouts.map(defaultLayout => {
    const savedLayout = savedLayouts.find(l => l.i === defaultLayout.i);
    if (savedLayout) {
      // 저장된 위치와 크기는 유지하되, 제약 조건은 업데이트
      return {
        ...savedLayout,
        minW: defaultLayout.minW,
        minH: defaultLayout.minH,
        maxW: defaultLayout.maxW,
        maxH: defaultLayout.maxH
      };
    }
    return defaultLayout;
  });
};

/**
 * 레이아웃 변경 시 숨겨진 위젯의 레이아웃도 유지
 */
export const mergeLayoutsWithHidden = (
  currentLayouts: LayoutItem[],
  newLayouts: LayoutItem[],
  hiddenWidgets: string[]
): LayoutItem[] => {
  const allLayouts = [...newLayouts];
  
  // 숨겨진 위젯의 레이아웃도 유지
  currentLayouts.forEach(existing => {
    if (hiddenWidgets.includes(existing.i) && !newLayouts.find(l => l.i === existing.i)) {
      allLayouts.push(existing);
    }
  });
  
  return allLayouts;
};

/**
 * 초기 컨테이너 너비 계산
 */
export const getInitialContainerWidth = (): number => {
  if (typeof window === 'undefined') return 1200;
  
  const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  const sidebarWidth = sidebarCollapsed ? 80 : 240;
  const padding = 48;
  
  return window.innerWidth - sidebarWidth - padding;
};