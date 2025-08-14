import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { TableCategory } from '../types';

const STORAGE_KEY_PREFIX = 'metricsTableCategories_';

export const useTableCategories = (widgetId: string) => {
  const { t } = useTranslation('widgets');
  const storageKey = `${STORAGE_KEY_PREFIX}${widgetId}`;
  
  // Hook 내부에서 기본 카테고리 생성 (t 함수 사용 가능)
  const getDefaultCategories = useCallback((): TableCategory[] => [
    {
      id: 'category-1',
      name: t('metricsTable.defaultCategories.mainMetrics'),
      metricIds: ['payoff-ratio', 'portfolio-open-risk', 'portfolio-net-risk', 'expectancy'],
      order: 0
    }
  ], [t]);
  
  const [categories, setCategories] = useState<TableCategory[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
    // 저장된 데이터가 없을 때만 기본값 사용
    return getDefaultCategories();
  });

  // 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(categories));
  }, [categories, storageKey]);

  // 카테고리 추가
  const addCategory = useCallback(() => {
    const newCategory: TableCategory = {
      id: `category-${Date.now()}`,
      name: t('metricsTable.settings.newCategory'),
      metricIds: [],
      order: categories.length
    };
    setCategories([...categories, newCategory]);
    return newCategory;
  }, [categories, t]);

  // 카테고리 이름 변경
  const updateCategoryName = useCallback((categoryId: string, name: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, name } : cat
    ));
  }, []);

  // 카테고리 삭제
  const deleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  }, []);

  // 카테고리에 메트릭 추가/제거
  const toggleMetricInCategory = useCallback((categoryId: string, metricId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const hasMetric = cat.metricIds.includes(metricId);
        return {
          ...cat,
          metricIds: hasMetric 
            ? cat.metricIds.filter(id => id !== metricId)
            : [...cat.metricIds, metricId]
        };
      }
      return cat;
    }));
  }, []);

  // 특정 카테고리의 메트릭 설정
  const setCategoryMetrics = useCallback((categoryId: string, metricIds: string[]) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, metricIds } : cat
    ));
  }, []);

  // 초기화
  const resetToDefault = useCallback(() => {
    setCategories(getDefaultCategories());
  }, [getDefaultCategories]);

  return {
    categories,
    addCategory,
    updateCategoryName,
    deleteCategory,
    toggleMetricInCategory,
    setCategoryMetrics,
    resetToDefault
  };
};