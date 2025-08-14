import type { Category, MetricItem, ModalLayout } from '../types';
import { AVAILABLE_METRICS } from '../constants';

// 드래그 중인 아이템 찾기
export const findDraggedItem = (
  activeId: string | null,
  categories: Category[]
): MetricItem | null => {
  if (!activeId) return null;
  
  for (const category of categories) {
    const item = category.items.find(item => item.id === activeId);
    if (item) return item;
  }
  
  return null;
};

// 현재 사용 중인 메트릭 ID 목록 가져오기
export const getUsedMetricIds = (layout: ModalLayout): Set<string> => {
  const usedIds = new Set<string>();
  
  layout.categories.forEach(category => {
    category.items.forEach(item => {
      usedIds.add(item.id);
    });
  });
  
  return usedIds;
};

// 메트릭 ID로 메트릭 정보 찾기
export const findMetricById = (metricId: string): MetricItem | undefined => {
  return AVAILABLE_METRICS.find(m => m.id === metricId);
};

// 카테고리에서 아이템 위치 찾기
export interface ItemPosition {
  categoryIndex: number;
  itemIndex: number;
  item: MetricItem;
}

export const findItemPosition = (
  itemId: string,
  categories: Category[]
): ItemPosition | null => {
  for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
    const category = categories[categoryIndex];
    const itemIndex = category.items.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      return {
        categoryIndex,
        itemIndex,
        item: category.items[itemIndex]
      };
    }
  }
  
  return null;
};