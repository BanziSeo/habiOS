import { useState, useCallback } from 'react';
import type { MetricsSettings } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants';

export const useMetricsSettings = () => {
  const [categoryFontSize, setCategoryFontSize] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORY_FONT_SIZE);
    return saved ? parseInt(saved) : DEFAULT_SETTINGS.categoryFontSize;
  });

  const [titleFontSize, setTitleFontSize] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TITLE_FONT_SIZE);
    return saved ? parseInt(saved) : DEFAULT_SETTINGS.titleFontSize;
  });

  const [valueFontSize, setValueFontSize] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VALUE_FONT_SIZE);
    return saved ? parseInt(saved) : DEFAULT_SETTINGS.valueFontSize;
  });

  const [subValueFontSize, setSubValueFontSize] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUB_VALUE_FONT_SIZE);
    return saved ? parseInt(saved) : DEFAULT_SETTINGS.subValueFontSize;
  });

  const [categoryBold, setCategoryBold] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORY_BOLD);
    return saved === 'true';
  });

  const [titleBold, setTitleBold] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TITLE_BOLD);
    return saved === 'true';
  });

  const [valueBold, setValueBold] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VALUE_BOLD);
    return saved === 'true';
  });

  const [subValueBold, setSubValueBold] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUB_VALUE_BOLD);
    return saved === 'true';
  });

  const updateSettings = useCallback((updates: Partial<MetricsSettings>) => {
    if (updates.categoryFontSize !== undefined) {
      setCategoryFontSize(updates.categoryFontSize);
      localStorage.setItem(STORAGE_KEYS.CATEGORY_FONT_SIZE, updates.categoryFontSize.toString());
    }
    if (updates.titleFontSize !== undefined) {
      setTitleFontSize(updates.titleFontSize);
      localStorage.setItem(STORAGE_KEYS.TITLE_FONT_SIZE, updates.titleFontSize.toString());
    }
    if (updates.valueFontSize !== undefined) {
      setValueFontSize(updates.valueFontSize);
      localStorage.setItem(STORAGE_KEYS.VALUE_FONT_SIZE, updates.valueFontSize.toString());
    }
    if (updates.subValueFontSize !== undefined) {
      setSubValueFontSize(updates.subValueFontSize);
      localStorage.setItem(STORAGE_KEYS.SUB_VALUE_FONT_SIZE, updates.subValueFontSize.toString());
    }
    if (updates.categoryBold !== undefined) {
      setCategoryBold(updates.categoryBold);
      localStorage.setItem(STORAGE_KEYS.CATEGORY_BOLD, updates.categoryBold.toString());
    }
    if (updates.titleBold !== undefined) {
      setTitleBold(updates.titleBold);
      localStorage.setItem(STORAGE_KEYS.TITLE_BOLD, updates.titleBold.toString());
    }
    if (updates.valueBold !== undefined) {
      setValueBold(updates.valueBold);
      localStorage.setItem(STORAGE_KEYS.VALUE_BOLD, updates.valueBold.toString());
    }
    if (updates.subValueBold !== undefined) {
      setSubValueBold(updates.subValueBold);
      localStorage.setItem(STORAGE_KEYS.SUB_VALUE_BOLD, updates.subValueBold.toString());
    }
  }, []);

  const settings: MetricsSettings = {
    categoryFontSize,
    titleFontSize,
    valueFontSize,
    subValueFontSize,
    categoryBold,
    titleBold,
    valueBold,
    subValueBold,
  };

  return {
    settings,
    updateSettings,
  };
};