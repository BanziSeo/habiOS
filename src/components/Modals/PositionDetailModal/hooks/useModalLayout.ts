import { useState, useEffect } from 'react';
import type { ModalLayout, Category } from '../types';
import { DEFAULT_LAYOUT, STORAGE_KEY } from '../constants';
import { findMetricById } from '../utils/layoutHelpers';

/**
 * 레이아웃 관리 및 localStorage 동기화 훅
 */
export const useModalLayout = () => {
  const [layout, setLayout] = useState<ModalLayout>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  // 레이아웃 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  // 카테고리 이름 변경
  const editCategory = (categoryId: string, newName: string) => {
    setLayout((prevLayout) => ({
      ...prevLayout,
      categories: prevLayout.categories.map(cat =>
        cat.id === categoryId ? { ...cat, name: newName } : cat
      )
    }));
  };

  // 카테고리 삭제
  const deleteCategory = (categoryId: string) => {
    setLayout((prevLayout) => ({
      ...prevLayout,
      categories: prevLayout.categories.filter(cat => cat.id !== categoryId)
    }));
  };

  // 새 카테고리 추가
  const addCategory = () => {
    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name: 'New Category',
      items: []
    };
    setLayout((prevLayout) => ({
      ...prevLayout,
      categories: [...prevLayout.categories, newCategory]
    }));
  };

  // 메트릭 토글 (추가/제거)
  const toggleMetric = (metricId: string) => {
    const metric = findMetricById(metricId);
    if (!metric) return;

    setLayout((prevLayout) => {
      const newLayout = { ...prevLayout };
      let found = false;

      // 모든 카테고리에서 해당 메트릭 찾기
      newLayout.categories = newLayout.categories.map(cat => {
        const hasMetric = cat.items.some(item => item.id === metricId);
        if (hasMetric) {
          found = true;
          // 제거
          return {
            ...cat,
            items: cat.items.filter(item => item.id !== metricId)
          };
        }
        return cat;
      });

      // 찾지 못했으면 첫 번째 카테고리에 추가
      if (!found && newLayout.categories.length > 0) {
        newLayout.categories[0].items.push(metric);
      }

      return newLayout;
    });
  };

  return {
    layout,
    setLayout,
    editCategory,
    deleteCategory,
    addCategory,
    toggleMetric
  };
};