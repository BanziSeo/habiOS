import { useState, useEffect, useRef } from 'react';
import type { LayoutItem } from '../types';
import { 
  loadWidgetLayouts, 
  saveWidgetLayouts,
  loadHiddenWidgets,
  saveHiddenWidgets,
  loadHiddenMetricCards,
  saveHiddenMetricCards
} from '../utils/storageHelpers';
import { 
  mergeLayoutsWithSaved, 
  mergeLayoutsWithHidden 
} from '../utils/layoutHelpers';

/**
 * 위젯 레이아웃 관리
 */
export const useWidgetLayout = (responsiveLayouts: LayoutItem[]) => {
  const [widgetLayouts, setWidgetLayouts] = useState(responsiveLayouts);
  // 기본적으로 추가 위젯들은 숨김
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([
    'daily-notes',
    'daily-pnl',
    'daily-risk-limit',
    'metrics-2',
    'metrics-3',
    'metrics-table-2',
    'metrics-table-3'
  ]);
  const [hiddenMetricCards, setHiddenMetricCards] = useState<string[]>([]);
  const isInitialMount = useRef(true);
  
  // localStorage에서 설정 불러오기
  useEffect(() => {
    // 위젯 레이아웃
    const savedLayouts = loadWidgetLayouts();
    if (savedLayouts) {
      const mergedLayouts = mergeLayoutsWithSaved(responsiveLayouts, savedLayouts);
      setWidgetLayouts(mergedLayouts);
    }
    
    // 숨겨진 위젯
    const savedHiddenWidgets = loadHiddenWidgets();
    setHiddenWidgets(savedHiddenWidgets);
    
    // 숨겨진 메트릭 카드
    const savedHiddenCards = loadHiddenMetricCards();
    setHiddenMetricCards(savedHiddenCards);
  }, [responsiveLayouts]);
  
  // 위젯 레이아웃 변경 핸들러
  const handleWidgetLayoutChange = (layout: LayoutItem[]) => {
    // 초기 마운트 시에는 저장하지 않음
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // 현재 레이아웃과 숨겨진 위젯의 레이아웃을 병합
    const allLayouts = mergeLayoutsWithHidden(widgetLayouts, layout, hiddenWidgets);
    
    setWidgetLayouts(allLayouts);
    saveWidgetLayouts(allLayouts);
  };
  
  // 위젯 표시/숨기기 토글
  const toggleWidgetVisibility = (widgetId: string) => {
    const newHiddenWidgets = hiddenWidgets.includes(widgetId)
      ? hiddenWidgets.filter(id => id !== widgetId)
      : [...hiddenWidgets, widgetId];
    
    setHiddenWidgets(newHiddenWidgets);
    saveHiddenWidgets(newHiddenWidgets);
  };
  
  // 메트릭 카드 표시/숨기기 토글
  const toggleCardVisibility = (cardId: string) => {
    const newHiddenCards = hiddenMetricCards.includes(cardId)
      ? hiddenMetricCards.filter(id => id !== cardId)
      : [...hiddenMetricCards, cardId];
    
    setHiddenMetricCards(newHiddenCards);
    saveHiddenMetricCards(newHiddenCards);
  };
  
  // 프리셋 로드
  const loadPreset = (layoutData: {
    widgetLayouts: LayoutItem[];
    hiddenWidgets: string[];
    hiddenMetricCards: string[];
  }) => {
    // 레이아웃 적용
    if (layoutData.widgetLayouts && layoutData.widgetLayouts.length > 0) {
      setWidgetLayouts(layoutData.widgetLayouts);
      saveWidgetLayouts(layoutData.widgetLayouts);
    }
    
    // 숨겨진 위젯 적용
    setHiddenWidgets(layoutData.hiddenWidgets);
    saveHiddenWidgets(layoutData.hiddenWidgets);
    
    // 숨겨진 메트릭 카드 적용
    setHiddenMetricCards(layoutData.hiddenMetricCards);
    saveHiddenMetricCards(layoutData.hiddenMetricCards);
  };
  
  return {
    widgetLayouts,
    hiddenWidgets,
    hiddenMetricCards,
    handleWidgetLayoutChange,
    toggleWidgetVisibility,
    toggleCardVisibility,
    loadPreset
  };
};